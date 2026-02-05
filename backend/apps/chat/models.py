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
