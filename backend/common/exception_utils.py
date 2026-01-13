from builtins import AttributeError

from django.db import DatabaseError
from django.http import Http404
from django.shortcuts import get_object_or_404

from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import (
    ValidationError,
    AuthenticationFailed,
    PermissionDenied,
    NotFound,
    MethodNotAllowed,
    ParseError,
    Throttled,
    APIException
)
from rest_framework.response import Response

class CustomAPIException(Exception):
    def __init__(self, message, status_code=400, data=None):
        self.message = message
        self.status_code = status_code
        self.data = data or {}
        super().__init__(message)

def custom_exception_handler(exc, context):
    # Handle CustomAPIException
    if isinstance(exc, CustomAPIException):
        return Response({
            "success": False,
            "message": exc.message,
            "data": exc.data
        }, status=exc.status_code)

    # Handle ValidationError
    if isinstance(exc, ValidationError):
        return Response({
            "success": False,
            "message": "Validation error",
            "data": exc.detail
        }, status=400)

    # Handle AuthenticationFailed
    if isinstance(exc, AuthenticationFailed):
        return Response({
            "success": False,
            "message": "Authentication failed",
            "data": exc.detail
        }, status=401)

    # Handle PermissionDenied
    if isinstance(exc, PermissionDenied):
        return Response({
            "success": False,
            "message": "Permission denied",
            "data": exc.detail if exc.detail else {}
        }, status=403)

    # Handle NotFound
    if isinstance(exc, NotFound):
        return Response({
            "success": False,
            "message": "Resource not found",
            "data": exc.detail if exc.detail else {}
        }, status=404)

    # Handle Http404 (Django non-DRF)
    if isinstance(exc, Http404):
        return Response({
            "success": False,
            "message": "Resource not found",
            "data": str(exc) if str(exc) else {}
        }, status=404)

    # Handle MethodNotAllowed
    if isinstance(exc, MethodNotAllowed):
        return Response({
            "success": False,
            "message": "Method not allowed",
            "data": exc.detail if exc.detail else {}
        }, status=405)

    # Handle ParseError
    if isinstance(exc, ParseError):
        return Response({
            "success": False,
            "message": "Invalid request data",
            "data": exc.detail if exc.detail else {}
        }, status=400)

    # Handle Throttled
    if isinstance(exc, Throttled):
        return Response({
            "success": False,
            "message": "Request limit exceeded",
            "data": exc.detail if exc.detail else {}
        }, status=429)

    # Handle generic APIException
    if isinstance(exc, APIException):
        return Response({
            "success": False,
            "message": "API error occurred",
            "data": exc.detail if exc.detail else {}
        }, status=exc.status_code)

    # Handle DatabaseError
    if isinstance(exc, DatabaseError):
        return Response({
            "success": False,
            "message": "Database error occurred",
            "data": str(exc) if str(exc) else {}
        }, status=500)

    # Handle AttributeError
    # if isinstance(exc, AttributeError):
    #     return Response({
    #         "success": False,
    #         "message": "Server error occurred",
    #         "data": str(exc) if str(exc) else {}
    #     }, status=500)

    # Let DRF handle all other exceptions
    return drf_exception_handler(exc, context)

