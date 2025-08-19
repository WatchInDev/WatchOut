from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

# TODO rewrite authentication logic
class ServiceTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        expected_token = getattr(settings, 'SERVICE_TOKEN', None)
        if not expected_token:
            return None

        # Get token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        try:
            # Expected format: "Bearer your-service-token"
            token_type, token = auth_header.split()
            if token_type.lower() != 'bearer':
                return None
        except ValueError:
            return None

        if token != expected_token:
            raise AuthenticationFailed('Invalid service token')

        # Return a simple user object or None for anonymous
        return (None, token)

    def authenticate_header(self, request):
        return 'Bearer'