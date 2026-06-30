from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import string
from .validators import validate_registration_number, validate_kafu_email


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
        ('student', 'Student'),
    ]

    # Override username with registration number validation
    username = models.CharField(
        max_length=20,
        unique=True,
        validators=[validate_registration_number],
        help_text='Registration number e.g. COM/0028/2023',
        error_messages={
            'unique': 'This registration number is already registered.'
        }
    )

    # Override email with validation
    email = models.EmailField(
        unique=True,
        validators=[validate_kafu_email],
        error_messages={
            'unique': 'This email address is already registered.'
        }
    )

    role = models.CharField(
        max_length=10, choices=ROLE_CHOICES, default='student'
    )
    department = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(
        upload_to='profiles/', blank=True, null=True
    )
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role}) - {self.username}"

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_staff_member(self):
        return self.role == 'staff'

    @property
    def is_student(self):
        return self.role == 'student'


class OTPCode(models.Model):
    """Stores OTP codes for password reset."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='otp_codes'
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.user.username} - {self.code}"

    @classmethod
    def generate_for_user(cls, user):
        # Invalidate old OTPs
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        # Generate 6-digit OTP
        code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timezone.timedelta(minutes=10)

        return cls.objects.create(
            user=user,
            code=code,
            expires_at=expires_at
        )

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at