from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.conf import settings
from http.cookies import SimpleCookie

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        print(f"DEBUG: JWT Middleware received token: {token_key[:20]}...")
        token = AccessToken(token_key)
        user_id = token['user_id']
        user = User.objects.get(id=user_id)
        print(f"DEBUG: JWT Middleware found user: {user.username} (ID: {user.id})")
        return user
    except Exception as e:
        print(f"DEBUG: JWT Middleware Error: {e}")
        import traceback
        traceback.print_exc()
        return AnonymousUser()

class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        params = dict(x.split('=') for x in query_string.split('&') if '=' in x)
        token = params.get('token')
        
        # Try to get token from cookies if not in query params
        if not token or token == 'null' or token == 'undefined':
            headers = dict(scope.get('headers', []))
            if b'cookie' in headers:
                try:
                    cookie_str = headers[b'cookie'].decode('utf-8')
                    cookies = SimpleCookie()
                    cookies.load(cookie_str)
                    
                    cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
                    if cookie_name in cookies:
                        token = cookies[cookie_name].value
                        print(f"DEBUG: Found {cookie_name} in cookies: {token[:20]}...")
                except Exception as e:
                    print(f"DEBUG: Error parsing cookies: {e}")
        
        if token and token != 'null' and token != 'undefined':
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
            
        return await super().__call__(scope, receive, send)
