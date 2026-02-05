from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try standard header authentication first
        header = self.get_header(request)
        if header is not None:
             raw_token = self.get_raw_token(header)
        else:
            # If no header, try to get token from cookie
            # Note: We use the key defined in our settings, or default to 'access_token'
            cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
            raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
