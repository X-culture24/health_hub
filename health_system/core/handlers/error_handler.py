import logging
from django.http import JsonResponse
from rest_framework import status
from django.conf import settings

logger = logging.getLogger(__name__)

def custom_error_handler(exc, context):
    """
    Custom error handler for better error reporting and monitoring
    """
    if settings.DEBUG:
        import traceback
        trace = ''.join(traceback.format_tb(exc.__traceback__))
    else:
        trace = None
    
    error_id = generate_error_id()
    
    # Log the error
    logger.error(
        f'Error ID: {error_id}\n'
        f'Type: {type(exc).__name__}\n'
        f'Message: {str(exc)}\n'
        f'Path: {context["request"].path}\n'
        f'Method: {context["request"].method}\n'
        f'Trace: {trace}'
    )
    
    response_data = {
        'error': {
            'id': error_id,
            'type': type(exc).__name__,
            'message': str(exc),
            'trace': trace if settings.DEBUG else None
        }
    }
    
    return JsonResponse(
        response_data,
        status=getattr(exc, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
    ) 