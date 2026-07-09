from django.urls import path
from .views import (
    NotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<int:notification_id>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark_all_notifications_read'),
]
