from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatView, AILogViewSet

router = DefaultRouter()
router.register(r'logs', AILogViewSet, basename='ai-logs')

urlpatterns = [
    path('send/', ChatView.as_view(), name='chat-send'),
    path('', include(router.urls)),
]
