from django.urls import path
from .views import ChatView

urlpatterns = [
    path('send/', ChatView.as_view(), name='chat-send'),
]
