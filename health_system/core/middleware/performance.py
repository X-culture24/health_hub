import time
import logging
from django.db import connection
from django.conf import settings

logger = logging.getLogger(__name__)

class PerformanceMonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        # Count database queries before request
        n_queries_before = len(connection.queries)
        
        response = self.get_response(request)
        
        # Calculate request duration
        duration = time.time() - start_time
        
        # Count database queries after request
        n_queries_after = len(connection.queries)
        n_queries = n_queries_after - n_queries_before
        
        # Log if request takes too long
        if duration > settings.SLOW_REQUEST_THRESHOLD:
            logger.warning(
                f'Slow request: {request.method} {request.path} '
                f'took {duration:.2f}s with {n_queries} queries'
            )
        
        # Add performance headers in debug mode
        if settings.DEBUG:
            response['X-Request-Duration'] = f'{duration:.2f}s'
            response['X-Query-Count'] = str(n_queries)
        
        return response 