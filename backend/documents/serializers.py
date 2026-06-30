from rest_framework import serializers
from .models import Document, DocumentVersion
from accounts.serializers import UserSerializer
from categories.serializers import CategorySerializer, TagSerializer


class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = DocumentVersion
        fields = [
            'id', 'version_number', 'file', 'change_note',
            'uploaded_by', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by', 'version_number']


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'file', 'file_type', 'file_size',
            'uploaded_by', 'category', 'category_detail',
            'tags', 'tags_detail', 'status', 'visibility',
            'version_count', 'versions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'file_type', 'file_size', 'uploaded_by',
            'created_at', 'updated_at'
        ]

    def get_version_count(self, obj):
        return obj.versions.count()


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing — no nested versions"""
    uploaded_by = UserSerializer(read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'file', 'file_type', 'file_size',
            'uploaded_by', 'category', 'category_detail',
            'tags', 'tags_detail', 'status', 'visibility',
            'version_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'file_type', 'file_size', 'uploaded_by',
            'created_at', 'updated_at'
        ]

    def get_version_count(self, obj):
        return obj.versions.count()