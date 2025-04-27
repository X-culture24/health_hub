from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views

urlpatterns = [
    # Authentication
    path('auth/token/', obtain_auth_token, name='api-token'),
    path('auth/register/', views.register_user, name='api-register'),
    path('auth/user/', views.user_profile, name='user-profile'),
    
    # Client endpoints
    path('clients/', views.client_list, name='client-list'),
    path('clients/<int:pk>/', views.client_detail, name='client-detail'),
    path('clients/<int:pk>/delete/', views.delete_client, name='delete-client'),
    path('clients/search/', views.search_clients, name='client-search'),
    path('clients/register/', views.register_client, name='register_client'),
    path('clients/<int:client_id>/', views.client_profile, name='client_profile'),
    path('clients/<int:client_id>/comprehensive/', views.get_client_comprehensive_info, name='client_comprehensive_info'),
    
    # Program endpoints
    path('programs/', views.program_list, name='program-list'),
    path('programs/create/', views.create_program, name='create_program'),
    path('programs/<int:pk>/', views.program_detail, name='program-detail'),
    path('programs/<int:pk>/delete/', views.delete_program, name='delete-program'),
    
    # Enrollment endpoints
    path('enrollments/create/', views.enroll_client, name='enroll_client'),
    path('enrollments/', views.enrollment_list, name='enrollment-list'),
    path('enrollments/<int:pk>/', views.enrollment_detail, name='enrollment-detail'),
    path('enrollments/<int:pk>/delete/', views.delete_enrollment, name='delete-enrollment'),
    
    # Prescription endpoints
    path('prescriptions/create/', views.create_prescription, name='create_prescription'),
    path('prescriptions/', views.prescription_list, name='prescription-list'),
    path('prescriptions/<int:pk>/delete/', views.delete_prescription, name='delete-prescription'),
    
    # Metric endpoints
    path('metrics/record/', views.record_metric, name='record_metric'),
    path('metrics/', views.metric_list, name='metric-list'),
    path('metrics/<int:pk>/', views.metric_detail, name='metric-detail'),
    path('metrics/<int:pk>/delete/', views.delete_metric, name='delete-metric'),
    
    # Appointment endpoints
    path('appointments/create/', views.create_appointment, name='create_appointment'),
    path('appointments/', views.appointment_list, name='appointment-list'),
    path('appointments/<int:pk>/delete/', views.delete_appointment, name='delete-appointment'),
    
    # Report endpoints
    path('reports/', views.generate_report, name='generate-report'),
    
    # Settings endpoints
    path('settings/', views.user_settings, name='user-settings'),
    path('change-password/', views.change_password, name='change-password'),
    path('program-metrics/', views.program_metrics, name='program-metrics'),
    path('resource-utilization/', views.resource_utilization, name='resource-utilization'),
] 