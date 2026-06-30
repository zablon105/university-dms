from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    TagListCreateView, TagDetailView
)

urlpatterns = [
    path('', CategoryListCreateView.as_view(), name='category_list'),
    path('<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('tags/', TagListCreateView.as_view(), name='tag_list'),
    path('tags/<int:pk>/', TagDetailView.as_view(), name='tag_detail'),
]