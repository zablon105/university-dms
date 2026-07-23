from django.urls import path
from .views import (
    MyDocumentRequestsView, AllDocumentRequestsView,
    FulfillDocumentRequestView, RejectDocumentRequestView
)

urlpatterns = [
    path('', MyDocumentRequestsView.as_view(), name='my_document_requests'),
    path('all/', AllDocumentRequestsView.as_view(), name='all_document_requests'),
    path('<int:request_id>/fulfill/', FulfillDocumentRequestView.as_view(), name='fulfill_document_request'),
    path('<int:request_id>/reject/', RejectDocumentRequestView.as_view(), name='reject_document_request'),
]