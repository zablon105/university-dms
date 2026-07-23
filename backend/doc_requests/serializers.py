from rest_framework import serializers
from .models import DocumentRequest
from accounts.serializers import UserSerializer
from documents.serializers import DocumentListSerializer


class DocumentRequestSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)
    fulfilled_by = UserSerializer(read_only=True)
    fulfilled_document_detail = DocumentListSerializer(source='fulfilled_document', read_only=True)

    class Meta:
        model = DocumentRequest
        fields = [
            'id', 'document_type', 'reason', 'status',
            'requested_by', 'fulfilled_by', 'fulfilled_document',
            'fulfilled_document_detail', 'staff_note',
            'created_at', 'fulfilled_at'
        ]
        read_only_fields = [
            'id', 'status', 'requested_by', 'fulfilled_by',
            'fulfilled_document', 'staff_note', 'created_at', 'fulfilled_at'
        ]