"""
Custom JSON Renderer
====================
Wraps all API responses in a standardized format:

Success:
    {"success": true, "message": "...", "data": {...}}

Error:
    {"success": false, "message": "...", "errors": {...}}
"""

from rest_framework.renderers import JSONRenderer


class CustomJSONRenderer(JSONRenderer):
    """
    Custom renderer that enforces consistent API response structure.
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        status_code = response.status_code if response else 200

        # Determine if this is a success or error response
        if 200 <= status_code < 300:
            # Success response
            wrapped = {
                'success': True,
                'message': data.pop('message', 'Request successful') if isinstance(data, dict) else 'Request successful',
                'data': data,
            }
        else:
            # Error response
            if isinstance(data, dict):
                message = data.pop('detail', None) or data.pop('message', 'An error occurred')
                errors = data
            else:
                message = str(data) if data else 'An error occurred'
                errors = {}

            wrapped = {
                'success': False,
                'message': message,
                'errors': errors,
            }

        return super().render(wrapped, accepted_media_type, renderer_context)
