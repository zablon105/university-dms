from django.db import models
from django.utils import timezone
from accounts.models import User


class Notification(models.Model):
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.recipient.username}: {self.message[:40]}"


def notify(recipient, message, link=''):
    """Convenience helper to create a notification from anywhere in the codebase."""
    return Notification.objects.create(
        recipient=recipient,
        message=message,
        link=link
    )
