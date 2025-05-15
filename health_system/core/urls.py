from django.urls import path
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/login/', views.CustomAuthToken.as_view(), name='api-token-auth'),
    path('auth/register/', views.register_user, name='api-register'),
    
    # Client endpoints
    path('clients/', views.client_list, name='client-list'),
    path('clients/<int:pk>/', views.client_detail, name='client-detail'),
    path('clients/search/', views.search_clients, name='client-search'),
    path('clients/register/', views.register_client, name='register_client'),
    
    # Program endpoints
    path('programs/', views.program_list, name='program-list'),
    path('programs/create/', views.create_program, name='create_program'),
    path('programs/<int:pk>/', views.program_detail, name='program-detail'),
    
    # Enrollment endpoints
    path('enrollments/', views.enrollment_list, name='enrollment-list'),
    path('enrollments/create/', views.enroll_client, name='enroll_client'),
    path('enrollments/<int:pk>/', views.enrollment_detail, name='enrollment-detail'),
    
    # Prescription endpoints
    path('prescriptions/create/', views.create_prescription, name='create_prescription'),
    
    # Metric endpoints
    path('metrics/dashboard/', views.dashboard_metrics, name='dashboard-metrics'),
    path('metrics/record/', views.record_metric, name='record_metric'),
    path('metrics/', views.metric_list, name='metric-list'),
    path('metrics/<int:pk>/', views.metric_detail, name='metric-detail'),
    
    # Appointment endpoints
    path('appointments/create/', views.create_appointment, name='create_appointment'),
    
    # Report endpoints
    path('reports/', views.generate_report, name='generate-report'),
    
    # Settings endpoints
    path('settings/', views.user_settings, name='user-settings'),
    path('change-password/', views.change_password, name='change-password'),
    path('program-metrics/', views.program_metrics, name='program-metrics'),
    path('resource-utilization/', views.resource_utilization, name='resource-utilization'),
]
