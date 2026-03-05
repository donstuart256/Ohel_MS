import secrets

from django.core import signing
from django.core.cache import cache
from django.contrib.auth import get_user_model

from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
OTP_TIMEOUT_SECONDS = 300           # 5 minutes
MFA_MAX_ATTEMPTS = 5
MFA_TOKEN_SALT = 'mfa-flow'


def _generate_otp() -> str:
    """Return a 6-digit OTP using the cryptographically secure secrets module."""
    return str(secrets.randbelow(900_000) + 100_000)


def _make_mfa_token(user_id: int) -> str:
    """
    Create a short-lived signed token that embeds the user_id.
    This prevents the client from supplying an arbitrary user_id
    (user enumeration / IDOR attack).
    """
    return signing.dumps(user_id, salt=MFA_TOKEN_SALT)


def _read_mfa_token(token: str) -> int | None:
    """
    Validate and decode the signed MFA token.
    Returns the user_id on success, None on tampered/expired token.
    """
    try:
        return signing.loads(token, salt=MFA_TOKEN_SALT, max_age=OTP_TIMEOUT_SECONDS)
    except signing.BadSignature:
        return None
    except signing.SignatureExpired:
        return None


# ---------------------------------------------------------------------------
# Login (step 1)
# ---------------------------------------------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.is_2fa_enabled:
            otp = _generate_otp()
            mfa_token = _make_mfa_token(self.user.id)

            # Store OTP keyed to the signed token (not raw user_id)
            cache.set(f"otp_{mfa_token}", otp, timeout=OTP_TIMEOUT_SECONDS)
            # Initialise attempt counter
            cache.set(f"otp_attempts_{mfa_token}", 0, timeout=OTP_TIMEOUT_SECONDS)

            # ⚠️  In production, send OTP via SMS/Email instead of printing.
            # Remove or gate this behind DEBUG only:
            if __debug__:
                import logging
                logging.getLogger(__name__).debug(
                    "MFA OTP for user %s: %s", self.user.username, otp
                )

            return {
                "mfa_required": True,
                "mfa_token": mfa_token,   # signed opaque token — not a raw user_id
                "message": "OTP sent to your registered device.",
            }

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_scope = 'login'            # maps to DEFAULT_THROTTLE_RATES['login']
    throttle_classes = [ScopedRateThrottle]


# ---------------------------------------------------------------------------
# MFA verify (step 2)
# ---------------------------------------------------------------------------
class MFAVerifyView(views.APIView):
    """
    Second step of the MFA login flow.

    The client POSTs:
        { "mfa_token": "<signed token from step 1>", "otp": "123456" }

    On success, full JWT pair is issued and the OTP is invalidated.
    After 5 failed attempts the OTP is invalidated regardless.
    """
    permission_classes = []
    throttle_scope = 'mfa'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        mfa_token = request.data.get('mfa_token', '')
        otp = request.data.get('otp', '')

        # ---- Validate & decode the signed token ----------------------------
        user_id = _read_mfa_token(mfa_token)
        if user_id is None:
            return Response(
                {"error": "Invalid or expired session. Please log in again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_cache_key = f"otp_{mfa_token}"
        attempts_key = f"otp_attempts_{mfa_token}"

        # ---- Check attempt count -------------------------------------------
        attempts = cache.get(attempts_key, 0)
        if attempts >= MFA_MAX_ATTEMPTS:
            cache.delete(otp_cache_key)
            cache.delete(attempts_key)
            return Response(
                {"error": "Too many failed attempts. Please log in again."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        # ---- Verify OTP ----------------------------------------------------
        cached_otp = cache.get(otp_cache_key)
        if not cached_otp or not secrets.compare_digest(cached_otp, str(otp)):
            cache.incr(attempts_key)
            remaining = MFA_MAX_ATTEMPTS - (attempts + 1)
            return Response(
                {"error": f"Invalid OTP. {remaining} attempt(s) remaining."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---- OTP valid — issue tokens and invalidate OTP immediately -------
        cache.delete(otp_cache_key)
        cache.delete(attempts_key)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
