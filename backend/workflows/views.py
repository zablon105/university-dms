from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import ApprovalRequest, ApprovalLog
from .serializers import (
    ApprovalRequestSerializer, ApprovalActionSerializer
)
from documents.models import Document


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']


class SubmitForApprovalView(APIView):
    """Any authenticated user submits their document for approval."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, doc_id):
        document = get_object_or_404(Document, pk=doc_id)

        # Only the document owner can submit it
        if document.uploaded_by != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You can only submit your own documents.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if already pending
        if ApprovalRequest.objects.filter(
            document=document, status='pending'
        ).exists():
            return Response(
                {'error': 'This document already has a pending approval request.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the approval request
        approval = ApprovalRequest.objects.create(
            document=document,
            requested_by=request.user,
            request_note=request.data.get('request_note', ''),
            status='pending'
        )

        # Update document status
        document.status = 'pending'
        document.save()

        # Log the action
        ApprovalLog.objects.create(
            approval_request=approval,
            action='submitted',
            performed_by=request.user,
            note=approval.request_note
        )

        return Response(
            ApprovalRequestSerializer(approval).data,
            status=status.HTTP_201_CREATED
        )


class ReviewApprovalView(APIView):
    """Admin or staff approves or rejects a pending request."""
    permission_classes = [IsAdminOrStaff]

    def post(self, request, approval_id):
        approval = get_object_or_404(ApprovalRequest, pk=approval_id)

        if approval.status != 'pending':
            return Response(
                {'error': f'This request is already {approval.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        review_note = serializer.validated_data.get('review_note', '')

        # Update approval request
        approval.status = 'approved' if action == 'approve' else 'rejected'
        approval.reviewed_by = request.user
        approval.review_note = review_note
        approval.reviewed_at = timezone.now()
        approval.save()

        # Update document status
        approval.document.status = approval.status
        approval.document.save()

        # Log the action
        ApprovalLog.objects.create(
            approval_request=approval,
            action=approval.status,
            performed_by=request.user,
            note=review_note
        )

        return Response(ApprovalRequestSerializer(approval).data)


class PendingApprovalsView(generics.ListAPIView):
    """Admin/staff view all pending approval requests."""
    serializer_class = ApprovalRequestSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        return ApprovalRequest.objects.filter(
            status='pending'
        ).select_related(
            'document', 'requested_by', 'reviewed_by'
        )


class AllApprovalsView(generics.ListAPIView):
    """Admin/staff view all approval requests with optional filters."""
    serializer_class = ApprovalRequestSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        queryset = ApprovalRequest.objects.select_related(
            'document', 'requested_by', 'reviewed_by'
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class MyApprovalsView(generics.ListAPIView):
    """Any user views their own approval requests."""
    serializer_class = ApprovalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ApprovalRequest.objects.filter(
            requested_by=self.request.user
        ).select_related('document', 'requested_by', 'reviewed_by')