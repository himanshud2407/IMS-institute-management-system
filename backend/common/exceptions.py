import logging
from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Intercepts ProtectedError to return a clean 400 Bad Request response.
    """
    response = exception_handler(exc, context)

    # If response is None, it means DRF did not handle the exception (e.g. 500 errors)
    if response is None:
        if isinstance(exc, ProtectedError):
            protected_models = set()
            for obj in exc.protected_objects:
                verbose_name_plural = getattr(obj._meta, 'verbose_name_plural', 'dependent records')
                protected_models.add(str(verbose_name_plural).lower())
            
            if protected_models:
                models_str = ", ".join(sorted(list(protected_models)))
                message = f"Cannot delete this record because it is referenced by active {models_str}."
            else:
                message = "Cannot delete this record because it has dependent relationships."
            
            logger.warning(f"ProtectedError encountered: {exc}. Returning 400 Bad Request.")
            
            return Response(
                {"detail": message},
                status=status.HTTP_400_BAD_REQUEST
            )

    return response
