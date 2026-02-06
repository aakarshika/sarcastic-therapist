# NOTE: The app must never do migrations.
# The reset db script will always be run by the user whenever a new table is added.
# We will never care about the existing data in the db.
from django.db import models

class AILog(models.Model):
    input_text = models.TextField(help_text="User input message")
    context = models.JSONField(help_text="Full message history/context passed to LLM", default=list)
    output_text = models.TextField(help_text="AI response")
    model_name = models.CharField(max_length=50, help_text="Model used, e.g. gpt-4o-mini")
    tokens_used = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Log {self.id} - {self.timestamp}"


class Conversation(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="conversations")
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} - {self.title or 'Untitled'}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=50)  # "user" or "assistant"
    content = models.TextField()
    context = models.JSONField(default=list, blank=True)  # Store context used for this message if needed
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role} in {self.conversation_id}: {self.content[:50]}..."
