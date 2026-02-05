from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.chat.services.chat_box import ChatBox
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
