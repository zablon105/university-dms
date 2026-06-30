from django.urls import path
from .views import (
    DocumentListCreateView, DocumentDetailView,
    DocumentVersionCreateView, DocumentVersionListView,
    MyDocumentsView
)

urlpatterns = [
    path('', DocumentListCreateView.as_view(), name='document_list'),
    path('<int:pk>/', DocumentDetailView.as_view(), name='document_detail'),
    path('<int:pk>/versions/', DocumentVersionListView.as_view(), name='document_versions'),
    path('<int:pk>/versions/upload/', DocumentVersionCreateView.as_view(), name='version_upload'),
    path('my/', MyDocumentsView.as_view(), name='my_documents'),
]