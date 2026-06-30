from django.db import models
from django.utils import timezone
from accounts.models import User
from documents.models import Document


class ApprovalRequest(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name='approval_requests'
    )
    requested_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='approval_requests_sent'
    )
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='approval_requests_reviewed'
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    request_note = models.TextField(blank=True)   # why the user is requesting approval
    review_note = models.TextField(blank=True)    # admin/staff feedback on decision

    created_at = models.DateTimeField(default=timezone.now)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document.title} — {self.status}"


class ApprovalLog(models.Model):
    """Keeps a full audit trail of every status change."""
    approval_request = models.ForeignKey(
        ApprovalRequest, on_delete=models.CASCADE, related_name='logs'
    )
    action = models.CharField(max_length=20)       # submitted, approved, rejected
    performed_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='approval_logs'
    )
    note = models.TextField(blank=True)
    performed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-performed_at']

    def __str__(self):
        return f"{self.action} by {self.performed_by} at {self.performed_at}"