from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connections
from django.db.utils import OperationalError
from redis import Redis
from django.conf import settings
import psutil
import os

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Comprehensive health check endpoint for monitoring system status
    """
    # Check database
    db_healthy = True
    try:
        connections['default'].cursor()
    except OperationalError:
        db_healthy = False
    
    # Check Redis if configured
    redis_healthy = True
    try:
        redis_client = Redis.from_url(settings.REDIS_URL)
        redis_client.ping()
    except:
        redis_healthy = False
    
    # System metrics
    cpu_usage = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    health_status = {
        'status': 'healthy' if db_healthy and redis_healthy else 'unhealthy',
        'database': {
            'status': 'up' if db_healthy else 'down',
            'name': settings.DATABASES['default']['NAME']
        },
        'redis': {
            'status': 'up' if redis_healthy else 'down'
        },
        'system': {
            'cpu_usage': f"{cpu_usage}%",
            'memory_usage': f"{memory.percent}%",
            'disk_usage': f"{disk.percent}%"
        },
        'environment': os.getenv('DJANGO_ENV', 'unknown')
    }
    
    return Response(health_status) 