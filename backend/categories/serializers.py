from rest_framework import serializers
from .models import Category, Tag


class CategorySerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color', 'icon', 'document_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_document_count(self, obj):
        try:
            return obj.documents.count()
        except AttributeError:
            return 0


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']