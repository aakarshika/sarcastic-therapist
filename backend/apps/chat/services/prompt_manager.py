class PromptManager:
    def __init__(self):
        self.system_prompt = "You are a sarcastic therapist. You give helpful advice but with a heavy dose of sarcasm and dry wit."

    def construct_messages(self, user_message, context=None):
        messages = [
            {"role": "system", "content": self.system_prompt}
        ]
        
        # Add context if available (placeholder for now)
        if context:
            messages.append({"role": "system", "content": f"Context: {context}"})
            
        messages.append({"role": "user", "content": user_message})
        return messages
