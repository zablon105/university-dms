from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from .models import User, OTPCode
from .validators import validate_registration_number
import re


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'password2', 'role', 'department', 'phone'
        ]

    def validate_username(self, value):
        value = value.upper().strip()

        import re
        # Student format
        student_pattern = r'^[A-Z]{2,4}\/\d{3,4}\/\d{4}$'
        # Staff format
        staff_pattern = r'^KAFU\/(STF|EMP)\/\d{3,4}$'

        if not (re.match(student_pattern, value) or
                re.match(staff_pattern, value)):
            raise serializers.ValidationError(
                'Invalid username format. '
                'Students use: COM/0028/2023 | '
                'Staff use: KAFU/STF/001'
            )

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'This username is already registered. '
                'If this is your account, please login instead.'
            )
        return value

    def validate_email(self, value):
        value = value.lower().strip()

        # Validate format
        try:
            validate_email(value)
        except Exception:
            raise serializers.ValidationError(
                'Please enter a valid email address.'
            )

        # Check uniqueness
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'This email address is already registered.'
                'Please use a different email or login.'
            )
        return value

    def validate_role(self, value):
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        # Force username to uppercase
        validated_data['username'] = validated_data['username'].upper()
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'department', 'phone',
            'profile_picture', 'is_approved', 'is_superuser', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_approved', 'is_superuser']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_role(self, obj):
        # Django superusers always get admin privileges regardless of stored role
        if obj.is_superuser:
            return 'admin'
        return obj.role


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        value = value.lower().strip()
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'No account found with this email address.'
            )
        return value


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                'OTP must be 6 digits.'
            )
        return value