from django.conf import settings
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.client = OpenAI(api_key=self.api_key)

    def get_response(self, messages, model="gpt-4o-mini"):
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error calling OpenAI: {e}")
            return "Analysis complete: I am currently unable to provide therapy. Please check my connection."
