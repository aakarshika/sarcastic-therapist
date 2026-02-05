import json
from channels.generic.websocket import WebsocketConsumer
from apps.chat.services.chat_box import ChatBox

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.accept()
            self.chat_box = ChatBox()
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
            # Send initial thinking step
            self.send_step("Reading your complain... I mean, message.")
            
            # Process message with callback for more steps
            response = self.chat_box.process_message(
                message, 
                callback=self.send_step
            )

            # Send final response
            self.send(text_data=json.dumps({
                'type': 'message',
                'content': response
            }))

    def send_step(self, step):
        self.send(text_data=json.dumps({
            'type': 'thinking',
            'step': step
        }))
