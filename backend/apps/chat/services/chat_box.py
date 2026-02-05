from .llm_client import LLMClient
from .prompt_manager import PromptManager

class ChatBox:
    def __init__(self):
        self.llm_client = LLMClient()
        self.prompt_manager = PromptManager()
        # Placeholder for tools
        self.tools = []

    def process_message(self, user_message, user_settings=None, callback=None):
        # 1. Manage Context (placeholder)
        if callback:
            import time
            import random
            steps = [
                "Analyzing your tone...",
                "Consulting the archives of sarcasm...",
                "Pretending to care...",
                "Formulating a witty retort...",
                "Judging silently..."
            ]
            for _ in range(2):
                callback(random.choice(steps))
                time.sleep(0.8)
        context = None
        if user_settings:
            # logic to use user settings
            pass

        # 2. Construct Prompt
        messages = self.prompt_manager.construct_messages(user_message, context)

        # 3. Call LLM
        response = self.llm_client.get_response(messages)

        # 4. Check for Tools (placeholder logic)
        # if tool_trigger in response: execute_tool()

        return response
