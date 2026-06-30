from django.urls import path
from .views import (
    SubmitForApprovalView, ReviewApprovalView,
    PendingApprovalsView, AllApprovalsView, MyApprovalsView
)

urlpatterns = [
    path('submit/<int:doc_id>/', SubmitForApprovalView.as_view(), name='submit_approval'),
    path('review/<int:approval_id>/', ReviewApprovalView.as_view(), name='review_approval'),
    path('pending/', PendingApprovalsView.as_view(), name='pending_approvals'),
    path('all/', AllApprovalsView.as_view(), name='all_approvals'),
    path('my/', MyApprovalsView.as_view(), name='my_approvals'),
]