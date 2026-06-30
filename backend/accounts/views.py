from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import User, OTPCode
from .serializers import (
    RegisterSerializer, UserSerializer,
    ChangePasswordSerializer, OTPRequestSerializer,
    OTPVerifySerializer
)


def send_admin_notification(user):
    """Send email to admin when new user registers."""
    try:
        admin_users = User.objects.filter(role='admin', is_approved=True)
        admin_emails = list(admin_users.values_list('email', flat=True))

        # Also send to ADMIN_EMAIL from settings
        if hasattr(settings, 'ADMIN_EMAIL') and settings.ADMIN_EMAIL:
            admin_emails.append(settings.ADMIN_EMAIL)

        admin_emails = list(set(filter(None, admin_emails)))

        if not admin_emails:
            return

        full_name = user.get_full_name() or user.username
        role = user.role.capitalize()
        department = user.department or 'Not specified'

        subject = f'[DocLibrary KAFU] New {role} Registration — {full_name}'
        message = f"""
Hello Admin,

A new user has registered on DocLibrary KAFU and is awaiting your approval.

━━━━━━━━━━━━━━━━━━━━━━━━
USER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━
Full Name:        {full_name}
Registration No:  {user.username}
Email:            {user.email}
Role:             {role}
Department:       {department}
Registered At:    {user.created_at.strftime('%d %b %Y, %I:%M %p')}
━━━━━━━━━━━━━━━━━━━━━━━━

Please log in to the DocLibrary Admin portal to approve or deny this account.

→ Login at: https://your-app.vercel.app/admin-login

This is an automated notification from DocLibrary KAFU.
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=True
        )
    except Exception as e:
        print(f"Email notification error: {e}")


def send_otp_email(user, otp_code):
    """Send OTP code to user's email."""
    try:
        subject = '[DocLibrary KAFU] Password Reset OTP'
        message = f"""
Hello {user.get_full_name() or user.username},

You requested a password reset for your DocLibrary KAFU account.

━━━━━━━━━━━━━━━━━━━━━━━━
YOUR OTP CODE
━━━━━━━━━━━━━━━━━━━━━━━━

        {otp_code.code}

━━━━━━━━━━━━━━━━━━━━━━━━

⏰ This OTP expires in 10 minutes.
🔒 Do not share this code with anyone.

If you did not request a password reset, please ignore this email
or contact support immediately.

DocLibrary KAFU Security Team
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )
    except Exception as e:
        print(f"OTP email error: {e}")


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Notify admin by email
        send_admin_notification(user)

        return Response({
            'message': (
                'Account created successfully! '
                'Your account is pending admin approval. '
                'The admin has been notified and will review your account shortly.'
            ),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').upper().strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {'error': 'Invalid registration number or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_approved:
            return Response(
                {
                    'error': (
                        'Your account is pending admin approval. '
                        'You will receive an email once approved.'
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully.'})


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_admin:
            return User.objects.none()
        return User.objects.all().order_by('-created_at')


class ApproveUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if not request.user.is_admin:
            return Response(
                {'error': 'Admins only.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action')

        if action == 'approve':
            user.is_approved = True
            user.save()

            # Notify user their account is approved
            try:
                send_mail(
                    subject='[DocLibrary KAFU] Account Approved!',
                    message=f"""
Hello {user.get_full_name() or user.username},

Great news! Your DocLibrary KAFU account has been approved.

You can now log in using:
→ Registration Number: {user.username}
→ Login at: https://your-app.vercel.app/login

Welcome to DocLibrary KAFU!
                    """.strip(),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True
                )
            except Exception:
                pass

            return Response({
                'message': f'{user.get_full_name() or user.username} approved successfully.'
            })

        elif action == 'deny':
            username = user.get_full_name() or user.username
            user.delete()
            return Response({'message': f'{username} denied and removed.'})

        return Response(
            {'error': 'Invalid action. Use approve or deny.'},
            status=status.HTTP_400_BAD_REQUEST
        )


class RequestOTPView(APIView):
    """Step 1 — User requests OTP for password reset."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        # Generate and send OTP
        otp = OTPCode.generate_for_user(user)
        send_otp_email(user, otp)

        return Response({
            'message': (
                f'OTP sent to {email[:3]}***{email[email.index("@"):]}'
                '. Check your inbox and spam folder.'
            )
        })


class VerifyOTPView(APIView):
    """Step 2 — User submits OTP + new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].lower()
        otp_input = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Find latest unused OTP
        try:
            otp = OTPCode.objects.filter(
                user=user, is_used=False
            ).latest('created_at')
        except OTPCode.DoesNotExist:
            return Response(
                {'error': 'No OTP found. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if OTP is valid
        if not otp.is_valid():
            return Response(
                {'error': 'OTP has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if OTP matches
        if otp.code != otp_input:
            return Response(
                {'error': 'Invalid OTP. Please check and try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reset password
        user.set_password(new_password)
        user.save()

        # Mark OTP as used
        otp.is_used = True
        otp.save()

        return Response({
            'message': 'Password reset successfully. You can now login.'
        })