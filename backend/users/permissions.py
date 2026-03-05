"""
Role-based permission classes for the School Management System.

Usage:
    class MyViewSet(viewsets.ModelViewSet):
        permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Full access for ADMIN users only."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsAdminOrReadOnly(BasePermission):
    """ADMIN gets full access; everyone else gets read-only."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == 'ADMIN'


class IsTeacher(BasePermission):
    """Access for TEACHER users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'TEACHER'


class IsTeacherOrAdmin(BasePermission):
    """Write access for TEACHER and ADMIN; read-only for others."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('ADMIN', 'TEACHER')


class IsFinanceOrAdmin(BasePermission):
    """Finance module access for FINANCE and ADMIN roles."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('ADMIN', 'FINANCE')


class IsOwnerOrAdmin(BasePermission):
    """Object-level: user can only access their own data unless ADMIN."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        # Check common FK patterns
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if hasattr(obj, 'student') and obj.student == request.user:
            return True
        return False
