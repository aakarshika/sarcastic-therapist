from django.urls import path

from api.views.auth_views import CookieTokenLogoutView, CookieTokenRefreshView

from .views import LoginView, MeView, SignUpView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("signin/", LoginView.as_view(), name="signin"),
    path("signout/", CookieTokenLogoutView.as_view(), name="signout"),
    path("me/", MeView.as_view(), name="me"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
]
