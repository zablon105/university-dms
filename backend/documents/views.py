from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Document, DocumentVersion
from .serializers import (
    DocumentSerializer, DocumentListSerializer, DocumentVersionSerializer
)


class DocumentPermission(permissions.BasePermission):
    """Controls who can see what based on document visibility and user role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'admin':
            return True
        if obj.visibility == 'admin':
            return user.role == 'admin'
        if obj.visibility == 'staff':
            return user.role in ['admin', 'staff']
        return True  # public


class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name', 'tags__name']
    ordering_fields = ['created_at', 'title', 'file_size']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DocumentListSerializer
        return DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.select_related(
            'uploaded_by', 'category'
        ).prefetch_related('tags', 'versions')

        # Filter by visibility based on role
        if user.role == 'student':
            queryset = queryset.filter(visibility='public')
        elif user.role == 'staff':
            queryset = queryset.filter(visibility__in=['public', 'staff'])
        # admin sees all

        # Optional filters from query params
        category = self.request.query_params.get('category')
        status_filter = self.request.query_params.get('status')
        visibility = self.request.query_params.get('visibility')

        if category:
            queryset = queryset.filter(category__id=category)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if visibility:
            queryset = queryset.filter(visibility=visibility)

        return queryset

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [DocumentPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        return DocumentSerializer

    def get_queryset(self):
        return Document.objects.select_related(
            'uploaded_by', 'category'
        ).prefetch_related('tags', 'versions')

    def update(self, request, *args, **kwargs):
        # Only uploader or admin can edit
        instance = self.get_object()
        if request.user.role != 'admin' and instance.uploaded_by != request.user:
            return Response(
                {'error': 'You can only edit your own documents.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role != 'admin' and instance.uploaded_by != request.user:
            return Response(
                {'error': 'You can only delete your own documents.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class DocumentVersionCreateView(APIView):
    """Upload a new version of an existing document."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk)

        # Only uploader or admin can add versions
        if request.user.role != 'admin' and document.uploaded_by != request.user:
            return Response(
                {'error': 'Only the document owner or admin can upload new versions.'},
                status=status.HTTP_403_FORBIDDEN
            )

        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get next version number
        last_version = document.versions.first()
        next_version = (last_version.version_number + 1) if last_version else 1

        version = DocumentVersion.objects.create(
            document=document,
            file=file,
            version_number=next_version,
            change_note=request.data.get('change_note', ''),
            uploaded_by=request.user
        )

        # Update the main document file to latest version
        document.file = file
        document.save()

        return Response(
            DocumentVersionSerializer(version).data,
            status=status.HTTP_201_CREATED
        )


class DocumentVersionListView(generics.ListAPIView):
    """List all versions of a document."""
    serializer_class = DocumentVersionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        document = get_object_or_404(Document, pk=self.kwargs['pk'])
        return document.versions.all()


class MyDocumentsView(generics.ListAPIView):
    """List documents uploaded by the logged-in user."""
    serializer_class = DocumentListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(
            uploaded_by=self.request.user
        ).select_related('category').prefetch_related('tags', 'versions')