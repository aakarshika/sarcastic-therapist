"""Main entry point for API v1 routing."""

from django.urls import include, path

urlpatterns = [
    path("auth/", include("api.v1.auth.urls")),
    path("chat/", include("api.v1.chat.urls")),
    path("profiles/", include("api.v1.profiles.urls")),
]
