from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from apps.chat.services.chat_box import ChatBox
from apps.chat.models import AILog
from apps.chat.serializers import AILogSerializer, MessageSerializer
from core.responses import success_response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

class ChatView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat_box = ChatBox()

    @extend_schema(
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                },
                'required': ['message']
            }
        },
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'response': {'type': 'string'}
                }
            }
        },
        summary="Send a message to the AI Chat Service",
        description="Sends a user message to the AI and returns the thoughtful (and likely sarcastic) response."
    )
    def post(self, request):
        message = request.data.get('message')
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Placeholder for user settings - could be fetched from request.user profile
        user_settings = {} 

        ai_response = self.chat_box.process_message(message, user_settings)
        
        return Response({"response": ai_response}, status=status.HTTP_200_OK)


from rest_framework import permissions
from rest_framework.decorators import action
from apps.chat.models import Conversation
from apps.chat.serializers import ConversationListSerializer, ConversationDetailSerializer


class AILogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows AI logs to be viewed.
    """
    queryset = AILog.objects.all()
    serializer_class = AILogSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def new(self, request):
        """
        Creates a new conversation or returns the most recent empty one.
        """
        # Check for latest conversation
        last_conv = Conversation.objects.filter(user=request.user).order_by('-created_at').first()
        
        # If it exists and has no messages, reuse it
        if last_conv and last_conv.messages.count() == 0:
            serializer = ConversationListSerializer(last_conv)
            return success_response(serializer.data, message="Reused empty conversation")
            
        # Otherwise create a new one
        new_conv = Conversation.objects.create(user=request.user, title="New Chat")
        serializer = ConversationListSerializer(new_conv)
        return success_response(serializer.data, message="Created new conversation")

    @action(detail=True, methods=['post'])
    def clear_history(self, request, pk=None):
        conversation = self.get_object()
        conversation.messages.all().delete()
        return Response({'status': 'history cleared'})

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        serializer = MessageSerializer(conversation.messages.all(), many=True)
        return success_response(serializer.data)

