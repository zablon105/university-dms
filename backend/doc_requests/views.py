from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import DocumentRequest
from .serializers import DocumentRequestSerializer
from documents.models import Document
from accounts.models import User
from notifications.models import notify


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']


class MyDocumentRequestsView(generics.ListCreateAPIView):
    """Student creates a request and lists their own requests."""
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DocumentRequest.objects.filter(requested_by=self.request.user)

    def perform_create(self, serializer):
        req = serializer.save(requested_by=self.request.user)
        staff_and_admins = User.objects.filter(
            role__in=['admin', 'staff'], is_approved=True, is_active=True
        )
        for person in staff_and_admins:
            notify(
                recipient=person,
                message=f'{self.request.user.get_full_name() or self.request.user.username} requested a {req.document_type}.',
                link='/staff/requests'
            )


class AllDocumentRequestsView(generics.ListAPIView):
    """Staff/admin view all document requests."""
    serializer_class = DocumentRequestSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        queryset = DocumentRequest.objects.select_related(
            'requested_by', 'fulfilled_by', 'fulfilled_document'
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class FulfillDocumentRequestView(APIView):
    """Staff/admin uploads the actual document and marks the request fulfilled."""
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, request_id):
        doc_request = get_object_or_404(DocumentRequest, pk=request_id)

        if doc_request.status != 'pending':
            return Response(
                {'error': f'This request is already {doc_request.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        document = Document.objects.create(
            title=doc_request.document_type,
            description=f'Fulfilled request for {doc_request.requested_by.get_full_name() or doc_request.requested_by.username}',
            file=file,
            uploaded_by=request.user,
            status='approved',
            visibility='admin'
        )

        doc_request.status = 'fulfilled'
        doc_request.fulfilled_by = request.user
        doc_request.fulfilled_document = document
        doc_request.fulfilled_at = timezone.now()
        doc_request.staff_note = request.data.get('staff_note', '')
        doc_request.save()

        notify(
            recipient=doc_request.requested_by,
            message=f'Your request for "{doc_request.document_type}" has been fulfilled.',
            link='/student/records'
        )

        return Response(DocumentRequestSerializer(doc_request).data)


class RejectDocumentRequestView(APIView):
    permission_classes = [IsAdminOrStaff]

    def post(self, request, request_id):
        doc_request = get_object_or_404(DocumentRequest, pk=request_id)

        if doc_request.status != 'pending':
            return Response(
                {'error': f'This request is already {doc_request.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        doc_request.status = 'rejected'
        doc_request.fulfilled_by = request.user
        doc_request.staff_note = request.data.get('staff_note', '')
        doc_request.fulfilled_at = timezone.now()
        doc_request.save()

        notify(
            recipient=doc_request.requested_by,
            message=f'Your request for "{doc_request.document_type}" was declined.' +
                    (f' Note: {doc_request.staff_note}' if doc_request.staff_note else ''),
            link='/student/records'
        )

        return Response(DocumentRequestSerializer(doc_request).data)