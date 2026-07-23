from django.db import models
from django.utils import timezone
from accounts.models import User
from documents.models import Document


class DocumentRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('fulfilled', 'Fulfilled'),
        ('rejected', 'Rejected'),
    ]

    requested_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='document_requests'
    )
    document_type = models.CharField(max_length=100)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    fulfilled_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fulfilled_requests'
    )
    fulfilled_document = models.ForeignKey(
        Document, on_delete=models.SET_NULL, null=True, blank=True
    )
    staff_note = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    fulfilled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document_type} — {self.requested_by.username} ({self.status})"
