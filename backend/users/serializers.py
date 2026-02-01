# serializers.py
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from common.exception_utils import CustomAPIException
from common.serializer_utils import get_serialized_or_none


from .models import (
    User, UserProfile, OTP, Role, UserResources
)
from .services import (
    LoginService, RoleService, UserService, OTPService,
)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(required=True, write_only=True)
    username = serializers.CharField(required=True, write_only=True)
    contact = serializers.CharField(required=False, allow_blank=True, write_only=True)
    hear_about_us = serializers.CharField(required=False, allow_blank=True, write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True, write_only=True)
    otp_code = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            'email', 'password', 'full_name', 'username',
            'contact', 'hear_about_us', 'referral_code', 'otp_code',
        )

    def create(self, validated_data):

        user, otp_code, otp_minutes = UserService.register_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=RoleService.get_user_role(),
            username=validated_data.get('username'),
            contact=validated_data.get('contact'),
            hear_about_us=validated_data.get('hear_about_us'),
            referral_code=validated_data.get('referral_code'),
        )

        user.otp_code = otp_code
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email

        if hasattr(user, 'userprofile'):
            token['full_name'] = user.userprofile.full_name

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add extra data to the response body (not just JWT payload)
        data['user'] = {}
        data['user']['id'] = self.user.id
        data['user']['email'] = self.user.email
        data['user']['has_paid'] = self.user.has_paid

        if hasattr(self.user, 'userprofile'):
            data['profile'] = {}
            data['profile']['id'] = self.user.userprofile.id
            data['profile']['full_name'] = self.user.userprofile.full_name
            data['profile']['role'] = self.user.userprofile.role.name

        return data

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return {'user': user}

class OTPGenerateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    type = serializers.ChoiceField(choices=OTP.otp_type, required=True)

    def validate(self, attrs):

        validated_data = super().validate(attrs)

        otp_type = validated_data['type']

        if otp_type == 'sign_up':

            user = User.objects.filter(
                email=validated_data['email']
            ).first()

            if user is None:
                raise CustomAPIException(
                    "User with this email does not exist",
                    status_code=404
                )

            if user.is_active:
                raise CustomAPIException(
                    "User with this email is already active",
                    status_code=400
                )

        return validated_data

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ('user', 'otp', 'type')

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.IntegerField()

    def validate(self, data):
        user, otp_type = OTPService.validate_otp(
            email=data['email'],
            otp=data['otp'],
        )
        return user, otp_type

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise CustomAPIException("Old password is incorrect")
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['user']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation['role'] = get_serialized_or_none(RoleSerializer, instance.role)

        return representation

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'created_at', 'updated_at', 'profile')

    def update(self, instance, validated_data):
        # Update the user fields (email, etc.)
        return UserService.update_user(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['has_paid'] = instance.has_paid
        representation['profile'] = get_serialized_or_none(UserProfileSerializer, instance.userprofile)
        return representation

class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value

class ResetPasswordSerializer(serializers.Serializer):
    reset_token = serializers.CharField()
    email = serializers.EmailField()
    new_password = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])

            UserService.validate_password_reset_token(user, data['reset_token'])

            data['user'] = user
            return data
        except User.DoesNotExist:
            raise CustomAPIException("User not found", 404)

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()

class UserResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserResources
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['plan_name'] = instance.plan.title
        return representation


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management"""
    subscription = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    last_active = serializers.SerializerMethodField()
    joined_date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d")

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'subscription',
            'status', 'joined_date', 'last_active'
        ]

    def get_subscription(self, obj):
        resource = obj.userresources_set.order_by('-created_at').first()
        if resource and resource.plan:
            return resource.plan.title
        return "Free"

    def get_status(self, obj):
        return "active" if obj.is_active else "inactive"

    def get_last_active(self, obj):
        return obj.last_login.strftime("%Y-%m-%d") if obj.last_login else "Never"