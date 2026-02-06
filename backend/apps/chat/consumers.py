import json
from channels.generic.websocket import WebsocketConsumer
from apps.chat.services.chat_box import ChatBox
from apps.chat.models import Conversation, Message

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.accept()
            self.chat_box = ChatBox()
            
            # Extract conversation_id from query params
            query_string = self.scope.get('query_string', b'').decode('utf-8')
            params = dict(x.split('=') for x in query_string.split('&') if '=' in x)
            self.conversation_id = params.get('conversation_id')
            print(f"DEBUG: WebSocket connected. User: {self.scope['user']}, Conversation ID: {self.conversation_id}")

            self.send(text_data=json.dumps({
                'type': 'system',
                'message': 'Connected to Sarcastic Therapist.'
            }))
        except Exception as e:
            import traceback
            print(f"Error in connect: {e}")
            traceback.print_exc()
            self.close()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')

        if message:
            # Get user from scope (requires AuthMiddlewareStack)
            user = self.scope.get('user')
            print(f"DEBUG: Receive message: {message[:50]}... | User: {user} (Auth: {user.is_authenticated})")
            
            # Auto-create conversation if missing
            conversation = None
            if self.conversation_id:
                try:
                    conversation = Conversation.objects.get(id=self.conversation_id, user=user)
                    print(f"DEBUG: Found existing conversation: {conversation.id}")
                except Conversation.DoesNotExist:
                    print(f"DEBUG: Conversation {self.conversation_id} not found for user.")
                    self.conversation_id = None # Reset if invalid

            if not conversation and user.is_authenticated:
                conversation = Conversation.objects.create(
                    user=user,
                    title=message[:30] + "..." if len(message) > 30 else message
                )
                self.conversation_id = str(conversation.id)
                print(f"DEBUG: Created new conversation: {conversation.id}")
                
                # Notify frontend of new conversation
                self.send(text_data=json.dumps({
                    'type': 'conversation_started',
                    'conversation_id': self.conversation_id
                }))

            # Persist User Message
            if conversation:
                # Rename conversation if it's the first message
                if conversation.messages.count() == 0:
                    new_title = message[:30] + "..." if len(message) > 30 else message
                    conversation.title = new_title
                    conversation.save()
                    print(f"DEBUG: Renamed convo {conversation.id} to: {new_title}")

                Message.objects.create(
                    conversation=conversation,
                    role='user',
                    content=message
                )
                print(f"DEBUG: Saved user message to DB.")

            # Send initial thinking step
            self.send_step("Reading your complain... I mean, message.")
            
            # Process message with callback for more steps
            response = self.chat_box.process_message(
                message, 
                callback=self.send_step
            )

            # Persist Assistant Message
            if conversation:
                Message.objects.create(
                    conversation=conversation,
                    role='assistant',
                    content=response
                )
                print(f"DEBUG: Saved assistant message to DB.")

            # Send final response
            self.send(text_data=json.dumps({
                'type': 'message',
                'content': response,
                'conversation_id': self.conversation_id
            }))

    def send_step(self, step):
        self.send(text_data=json.dumps({
            'type': 'thinking',
            'step': step
        }))
