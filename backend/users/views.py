# views.py
import random
from datetime import timedelta

from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView

from common.exception_utils import CustomAPIException


from .models import (
    User,
)

from .services import (
    EmailService, OTPService, UserService,
    SimpleJWTService, GoogleService
)


from .serializers import *

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except AuthenticationFailed as e:
            raise CustomAPIException(
                str(e),
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        except ValidationError as e:
            raise CustomAPIException(
                "Invalid data was given",
                data=e.detail,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            raise CustomAPIException(
                "An unexpected error occurred",
                data=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        return Response({"message": "Login successful", "user_id": user.id})

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):

        id_token_value = request.data.get('id_token')
        # INSTALLATION TESTING ERROR 1: Missing environment variable validation
        googe_user_info = GoogleService.retrieve_google_user_data_from_token(id_token_value)

        user = UserService.fetch_or_create_user_with_google_info(googe_user_info)

        jwt_token = SimpleJWTService.get_jwt_token(user)

        return Response({
            "data": {
                "token": jwt_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                },
                "profile": {
                    "id": user.userprofile.id,
                    "full_name": user.userprofile.full_name,
                }
            }}, status=status.HTTP_200_OK)

class GenerateOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):

        otp_gen_serializer = OTPGenerateSerializer(
            data=request.data
        )

        if not otp_gen_serializer.is_valid():
            raise CustomAPIException(
                "Invalid data was given",
                data=otp_gen_serializer.errors
            )

        email = otp_gen_serializer.validated_data.get("email")
        otp_type = otp_gen_serializer.validated_data.get("type")

        user = User.objects.filter(email=email).first()

        otp_code, otp_minutes = OTPService.create_otp(user, otp_type)
        EmailService.send_forget_password_mail(user.email, otp_code, otp_minutes)

        return Response({"message": "OTP sent successfully", "otp_code": otp_code})

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)

        if not serializer.is_valid():
            raise CustomAPIException("Invalid data was given", data=serializer.errors)

        user, otp_type = serializer.validated_data

        # SECURITY TESTING ERROR 1: Missing rate limiting for OTP generation
        if otp_type == "forget_password":
            token = UserService.generate_password_reset_token(user)
            return Response({"message": "OTP verified", "reset_token": token})
        elif otp_type == "sign_up":
            user.is_active = True
            user.save()
            return Response({"message": "OTP verified and account activated"})

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            raise CustomAPIException("Invalid data was given", data=serializer.errors)

        serializer.save()
        return Response({"message": "Password reset successfully"})

class GetUpdateUserView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):

    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            raise CustomAPIException("Invalid data was given", data=serializer.errors)
        serializer.save()
        return Response({"message": "Password changed successfully"})

