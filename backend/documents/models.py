from django.db import models
from django.utils import timezone
from accounts.models import User
from categories.models import Category, Tag
from cloudinary.models import CloudinaryField


class Document(models.Model):

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('staff', 'Staff Only'),
        ('admin', 'Admin Only'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = CloudinaryField('file', resource_type='raw', folder='documents/')
    file_type = models.CharField(max_length=10, blank=True)
    file_size = models.PositiveIntegerField(default=0)

    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='documents'
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='documents'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='documents')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            try:
                name = str(self.file)
                if '.' in name:
                    self.file_type = name.rsplit('.', 1)[-1].lower()
            except Exception:
                pass
            try:
                self.file_size = self.file.size
            except Exception:
                pass
        super().save(*args, **kwargs)


class DocumentVersion(models.Model):
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name='versions'
    )
    file = CloudinaryField('file', resource_type='raw', folder='versions/')
    version_number = models.PositiveIntegerField()
    change_note = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='uploaded_versions'
    )
    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.document.title} — v{self.version_number}"