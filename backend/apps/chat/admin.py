"""Admin configuration for the chat application."""

from django.contrib import admin

from .models import AILog, Conversation, Message


@admin.register(AILog)
class AILogAdmin(admin.ModelAdmin):
    """Admin configuration for AILog model."""

    list_display = ("id", "model_name", "tokens_used", "timestamp")
    list_filter = ("model_name", "timestamp")
    search_fields = ("input_text", "output_text")
    readonly_fields = ("timestamp",)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin configuration for Conversation model."""

    list_display = ("id", "user", "title", "created_at", "updated_at", "is_active")
    list_filter = ("is_active", "created_at", "updated_at")
    search_fields = ("title", "user__username", "user__email")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin configuration for Message model."""

    list_display = ("id", "conversation", "role", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("content",)
