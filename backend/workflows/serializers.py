from rest_framework import serializers
from django.utils import timezone
from .models import ApprovalRequest, ApprovalLog
from accounts.serializers import UserSerializer
from documents.serializers import DocumentListSerializer


class ApprovalLogSerializer(serializers.ModelSerializer):
    performed_by = UserSerializer(read_only=True)

    class Meta:
        model = ApprovalLog
        fields = ['id', 'action', 'performed_by', 'note', 'performed_at']
        read_only_fields = ['id', 'performed_at']


class ApprovalRequestSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    document_detail = DocumentListSerializer(source='document', read_only=True)
    logs = ApprovalLogSerializer(many=True, read_only=True)

    class Meta:
        model = ApprovalRequest
        fields = [
            'id', 'document', 'document_detail',
            'requested_by', 'reviewed_by',
            'status', 'request_note', 'review_note',
            'logs', 'created_at', 'reviewed_at'
        ]
        read_only_fields = [
            'id', 'requested_by', 'reviewed_by',
            'status', 'reviewed_at', 'created_at'
        ]


class ApprovalActionSerializer(serializers.Serializer):
    """Used by admin/staff to approve or reject."""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    review_note = serializers.CharField(required=False, allow_blank=True)