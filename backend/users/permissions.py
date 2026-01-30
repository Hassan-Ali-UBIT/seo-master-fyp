from decouple import config

from django.utils import timezone
from rest_framework import permissions

from .models import UserResources

class IsSuperAdminAndEmailExists(permissions.BasePermission):
    """
    Custom permission to only allow superadmin users with valid admin emails.
    """
    def has_permission(self, request, view):
        # Get the email from request data
        email = request.data.get('email')
        print('permission- email',email)
        if not email:
            return False

        # Get list of admin emails from environment variable
        admin_emails = config('ADMIN_EMAILS', default='').split(',')
        print('permission- admin_emails',admin_emails)

        # Check if the email is in the admin emails list
        if email not in admin_emails:
            return False

        return True

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.userprofile  and request.user.userprofile.role.name in ['superadmin', 'admin']

class IsAdminOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.userprofile.role and request.user.userprofile.role.name in ['admin', 'superadmin']

class RolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow all users, including unauthorized, to access GET requests
        if request.method == 'GET':
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        # For POST, PUT, PATCH, DELETE - only superadmin
        return request.user.userprofile.role and request.user.userprofile.role.name in ['superadmin', 'admin']

    def has_object_permission(self, request, view, obj):
        # For GET requests, allow all users, including unauthorized
        if request.method == 'GET':
            return True

        # For POST, PUT, PATCH, DELETE - only superadmin
        return request.user.userprofile.role and request.user.userprofile.role.name in ['superadmin', 'admin']

class IsSuperAdminOrAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        # Only allow authenticated users to access GET requests
        if request.method == 'GET':
            return request.user and request.user.is_authenticated

        if not request.user or not request.user.is_authenticated:
            return False

        # For POST, PUT, PATCH, DELETE - only superadmin
        return request.user.userprofile.role and request.user.userprofile.role.name in ['superadmin', 'admin']

    def has_object_permission(self, request, view, obj):
        # Only allow authenticated users to access GET requests
        if request.method == 'GET':
            return request.user and request.user.is_authenticated

        # For POST, PUT, PATCH, DELETE - only superadmin
        return request.user.userprofile.role and request.user.userprofile.role.name in ['superadmin', 'admin']


class IsSuperAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow GET and HEAD requests for all users, including unauthenticated
        if request.method in permissions.SAFE_METHODS:
            return True

        # Require authentication for write actions
        if not request.user or not request.user.is_authenticated:
            return False

        # Restrict write actions (POST, PUT, PATCH, DELETE) to superadmin
        return request.user.userprofile.role and request.user.userprofile.role.name in ['superadmin', 'admin']

    def has_object_permission(self, request, view, obj):
        # Allow GET and HEAD requests for all users, including unauthenticated
        if request.method in permissions.SAFE_METHODS:
            return True

        # Restrict write actions (POST, PUT, PATCH, DELETE) to superadmin
        return request.user.userprofile.role and request.user.userprofile.role.name in ['superadmin', 'admin']

class IsAdmin(permissions.BasePermission):
    message = "You must be admin to perform requested operation"

    def has_permission(self, request, view):
        return request.user.userprofile.role.name == "admin"

class CustomPermission(permissions.BasePermission):

    def has_permission(self, request, view):

        view_permission = getattr(view, 'required_permission', None)

        if view_permission is None:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.userprofile.role.name in ["superadmin", "admin"]:
            return True

        if request.user.userprofile.role.permissions is None:
            return False

        return request.user.userprofile.role.permissions.get(view_permission)

class HasLinkedInOptimizerPermission(permissions.BasePermission):
    """
    Allows access only to:
    1. Superusers / Staff
    2. Users with an active plan AND sufficient resources (credits).
    """

    message = "You do not have an active plan or sufficient credits to perform this action."

    def has_permission(self, request, view):
        # 1. Allow Superusers and Staff unconditionally
        if request.user.is_superuser or request.user.is_staff:
            return True

        # 2. Check for UserResources
        user_resources = request.user.userresources_set.first()

        if not user_resources:
            self.message = "No subscription resources found for this user."
            return False

        # 3. Check for active plan validity
        # Check if plan exists
        if not user_resources.plan:
             self.message = "You do not have an active plan."
             return False

        # Check if plan is expired
        if user_resources.subscription_end and user_resources.subscription_end < timezone.now().date():
             self.message = "Your subscription has expired. Please renew to continue."
             return False

        # Check if plan is cancelled (and cancellation date is past or immediate effect)
        # Usually we allow access until the end of the period even if cancelled.
        # But if is_cancelled is True and we want to stop immediate access (e.g. refund), we could check.
        # Standard logic: access valid until subscription_end regardless of is_cancelled flag,
        # is_cancelled just means it won't renew.
        # So the date check above covers the access validity.

        # 4. Check for sufficient credits
        # We assume a default cost of 1 credit for permission checks usually.
        # This checks if they have at least 1 credit to proceed.
        if user_resources.remaining_credits() > 0:
            return True

        self.message = "Insufficient credits. Please upgrade your plan."
        return False