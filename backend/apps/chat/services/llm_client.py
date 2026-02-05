from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.chat = ChatOpenAI(
            api_key=self.api_key,
            model="gpt-4o-mini"
        )

    def get_response(self, messages, model="gpt-4o-mini"):
        try:
            # Update model if different from default
            if model != self.chat.model_name:
                self.chat.model_name = model

            langchain_messages = []
            for msg in messages:
                role = msg.get("role")
                content = msg.get("content")
                if role == "system":
                    langchain_messages.append(SystemMessage(content=content))
                elif role == "user":
                    langchain_messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    langchain_messages.append(AIMessage(content=content))
            
            response = self.chat.invoke(langchain_messages)
            return response.content
        except Exception as e:
            logger.error(f"Error calling OpenAI via LangChain: {e}")
            return "Analysis complete: I am currently unable to provide therapy. Please check my connection."
