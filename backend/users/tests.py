"""
Security-focused tests for the authentication and MFA flow.

Run with:
    python manage.py test users --verbosity=2
"""

import secrets as _secrets
import unittest
from unittest.mock import patch, MagicMock

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.core.cache import cache

from rest_framework import status
from rest_framework.test import APITestCase

from users.auth_views import (
    _generate_otp,
    _make_mfa_token,
    _read_mfa_token,
    OTP_TIMEOUT_SECONDS,
    MFA_MAX_ATTEMPTS,
    MFA_TOKEN_SALT,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def _make_user(username='testuser', password='Str0ng!Pass99', **kwargs):
    return User.objects.create_user(username=username, password=password, **kwargs)


# ---------------------------------------------------------------------------
# OTP generation
# ---------------------------------------------------------------------------
class OTPGenerationTests(TestCase):

    def test_otp_is_six_digits(self):
        """OTP must always be a 6-digit string."""
        for _ in range(50):
            otp = _generate_otp()
            self.assertTrue(otp.isdigit(), f"OTP is not numeric: {otp}")
            self.assertEqual(len(otp), 6, f"OTP length wrong: {otp}")
            self.assertGreaterEqual(int(otp), 100_000)
            self.assertLessEqual(int(otp), 999_999)

    def test_otp_uses_secrets_module(self):
        """_generate_otp must delegate to secrets.randbelow (not random)."""
        with patch('users.auth_views.secrets.randbelow', wraps=_secrets.randbelow) as mock_rb:
            _generate_otp()
            mock_rb.assert_called_once()

    def test_otp_values_are_not_all_identical(self):
        """Sanity: 100 calls should not all produce the same value."""
        otps = {_generate_otp() for _ in range(100)}
        self.assertGreater(len(otps), 10, "OTPs appear non-random")


# ---------------------------------------------------------------------------
# MFA signed token
# ---------------------------------------------------------------------------
class MFATokenTests(TestCase):

    def test_round_trip(self):
        """A freshly created token should decode back to the same user_id."""
        user_id = 42
        token = _make_mfa_token(user_id)
        self.assertEqual(_read_mfa_token(token), user_id)

    def test_tampered_token_rejected(self):
        """A modified token must return None."""
        token = _make_mfa_token(7)
        tampered = token[:-4] + 'XXXX'
        self.assertIsNone(_read_mfa_token(tampered))

    def test_raw_user_id_string_rejected(self):
        """Passing a plain user_id integer string must not decode successfully."""
        self.assertIsNone(_read_mfa_token('42'))

    def test_expired_token_rejected(self):
        """A token signed with a fake old timestamp should be rejected."""
        with patch('django.core.signing.time') as mock_time:
            mock_time.time.return_value = 0          # signed at epoch
            token = _make_mfa_token(99)
        # Now verify at OTP_TIMEOUT_SECONDS + 1 in the future
        with patch('django.core.signing.time') as mock_time:
            mock_time.time.return_value = OTP_TIMEOUT_SECONDS + 1
            self.assertIsNone(_read_mfa_token(token))


# ---------------------------------------------------------------------------
# MFA verify endpoint
# ---------------------------------------------------------------------------
@override_settings(
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
    REST_FRAMEWORK={
        'DEFAULT_AUTHENTICATION_CLASSES': [],
        'DEFAULT_PERMISSION_CLASSES': [],
    },
)
class MFAVerifyViewTests(APITestCase):

    def setUp(self):
        cache.clear()
        self.user = _make_user(is_2fa_enabled=True)
        self.mfa_token = _make_mfa_token(self.user.id)
        self.otp = _generate_otp()
        cache.set(f"otp_{self.mfa_token}", self.otp, timeout=OTP_TIMEOUT_SECONDS)
        cache.set(f"otp_attempts_{self.mfa_token}", 0, timeout=OTP_TIMEOUT_SECONDS)
        self.url = '/api/v1/auth/mfa-verify/'

    def _post(self, mfa_token=None, otp=None):
        return self.client.post(self.url, {
            'mfa_token': mfa_token if mfa_token is not None else self.mfa_token,
            'otp': otp if otp is not None else self.otp,
        }, format='json')

    # --- success path -------------------------------------------------------
    def test_valid_otp_returns_tokens(self):
        resp = self._post()
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_otp_deleted_after_success(self):
        """Re-using the same OTP after a valid verify must fail (replay prevention)."""
        self._post()
        resp = self._post()
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # --- invalid inputs ------------------------------------------------------
    def test_wrong_otp_returns_400(self):
        wrong_otp = '000000' if self.otp != '000000' else '111111'
        resp = self._post(otp=wrong_otp)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_raw_user_id_rejected(self):
        """Confirm that passing a raw integer user_id (old API) is rejected."""
        resp = self.client.post(self.url, {
            'mfa_token': str(self.user.id),
            'otp': self.otp,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_token_returns_400(self):
        resp = self.client.post(self.url, {'otp': self.otp}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # --- brute-force lockout -------------------------------------------------
    def test_brute_force_lockout_after_max_attempts(self):
        """
        After MFA_MAX_ATTEMPTS invalid OTPs, the endpoint must block
        even a correct OTP.
        """
        bad_otp = '000000' if self.otp != '000000' else '111111'

        for i in range(MFA_MAX_ATTEMPTS):
            resp = self._post(otp=bad_otp)
            self.assertEqual(
                resp.status_code, status.HTTP_400_BAD_REQUEST,
                f"Expected 400 on attempt {i + 1}",
            )

        # Next attempt with correct OTP must be rejected (locked out)
        resp = self._post(otp=self.otp)
        self.assertEqual(resp.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_attempt_counter_decrements_remaining(self):
        """Response body should report remaining attempts."""
        bad_otp = '000000' if self.otp != '000000' else '111111'
        resp = self._post(otp=bad_otp)
        self.assertIn('remaining', resp.data.get('error', ''))


# ---------------------------------------------------------------------------
# Login throttle (smoke test only — full rate limiting requires Redis)
# ---------------------------------------------------------------------------
@override_settings(
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class LoginThrottleTests(APITestCase):

    def setUp(self):
        cache.clear()
        self.user = _make_user(username='throttleuser', password='Str0ng!Pass99')
        self.url = '/api/v1/auth/login/'

    def test_repeated_bad_logins_eventually_throttled(self):
        """
        Sending > 5 rapid requests from the same IP should trigger a 429.
        Note: LocMemCache throttling works within the same test process.
        """
        throttled = False
        for _ in range(10):
            resp = self.client.post(self.url, {
                'username': 'throttleuser',
                'password': 'wrongpassword',
            }, format='json')
            if resp.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                throttled = True
                break
        self.assertTrue(throttled, "Login endpoint was never throttled after 10 rapid attempts")
