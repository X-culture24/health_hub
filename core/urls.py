from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views
from . import api_views

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
    path('clients/by-name/<str:first_name>/<str:last_name>/comprehensive/', views.get_client_comprehensive_info_by_name, name='client_comprehensive_info_by_name'),
    
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
    path('prescriptions/<int:pk>/', views.prescription_detail, name='prescription-detail'),
    path('prescriptions/<int:pk>/update/', views.update_prescription, name='update-prescription'),
    
    # Metric endpoints
    path('metrics/record/', views.record_metric, name='record_metric'),
    path('metrics/', views.metric_list, name='metric-list'),
    path('metrics/<int:pk>/', views.metric_detail, name='metric-detail'),
    path('metrics/<int:pk>/delete/', views.delete_metric, name='delete-metric'),
    
    # Encounter endpoints
    path('encounters/create/', views.create_encounter, name='create_encounter'),
    path('encounters/', views.list_encounters, name='list_encounters'),
    path('encounters/<int:pk>/', views.get_encounter, name='get_encounter'),
    path('encounters/<int:pk>/delete/', views.delete_encounter, name='delete_encounter'),
    
    # Report endpoints
    path('reports/generate/', views.generate_report, name='generate-report'),
    
    # Settings endpoints
    path('change-password/', views.change_password, name='change-password'),
    path('program-metrics/', views.program_metrics, name='program-metrics'),
    path('resource-utilization/', views.resource_utilization, name='resource-utilization'),
    path('staff/', views.staff_list, name='staff-list'),
    path('webhook/', views.webhook_endpoint),
    
    # Enhanced API endpoints
    # Appointments
    path('api/appointments/', api_views.appointments_api, name='api-appointments'),
    path('api/appointments/<int:doctor_id>/<str:date>/slots/', api_views.available_slots, name='api-available-slots'),
    path('api/appointments/<int:appointment_id>/status/', api_views.update_appointment_status, name='api-update-appointment-status'),
    
    # Virtual Pharmacist
    path('api/pharmacy/interactions/', api_views.check_drug_interactions, name='api-drug-interactions'),
    path('api/pharmacy/recommendations/', api_views.get_drug_recommendations, name='api-drug-recommendations'),
    path('api/pharmacy/validate/', api_views.validate_prescription, name='api-validate-prescription'),
    
    # Pharmacy Inventory
    path('api/inventory/', api_views.pharmacy_inventory, name='api-pharmacy-inventory'),
    path('api/inventory/<int:inventory_id>/stock/', api_views.update_inventory_stock, name='api-update-inventory-stock'),
    path('api/inventory/alerts/', api_views.inventory_alerts, name='api-inventory-alerts'),
    
    # Enhanced Prescriptions
    path('api/prescriptions/enhanced/', api_views.enhanced_prescriptions, name='api-enhanced-prescriptions'),
    path('api/prescriptions/<int:prescription_id>/dispense/', api_views.dispense_prescription, name='api-dispense-prescription'),
    
    # Payments
    path('api/payments/initiate/', api_views.initiate_payment, name='api-initiate-payment'),
    path('api/payments/<str:provider>/callback/', api_views.payment_callback, name='api-payment-callback'),
    path('api/payments/history/<int:client_id>/', api_views.payment_history, name='api-payment-history'),
    
    # Drugs
    path('api/drugs/', api_views.drugs_api, name='api-drugs'),
    
    # Dashboard
    path('api/dashboard/analytics/', api_views.dashboard_analytics, name='api-dashboard-analytics'),
]