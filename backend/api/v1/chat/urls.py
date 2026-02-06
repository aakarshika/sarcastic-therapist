from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatView, AILogViewSet, ConversationViewSet

router = DefaultRouter()
router.register(r'logs', AILogViewSet, basename='ai-logs')
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('send/', ChatView.as_view(), name='chat-send'),
    path('', include(router.urls)),
]
