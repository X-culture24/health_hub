from django.urls import path
from . import views

urlpatterns = [
    path('programs/create/', views.create_program, name='create_program'),
    path('clients/register/', views.register_client, name='register_client'),
    path('enrollments/create/', views.enroll_client, name='enroll_client'),
    path('clients/search/', views.search_clients, name='search_clients'),
    path('clients/<int:client_id>/', views.client_profile, name='client_profile'),
    path('prescriptions/create/', views.create_prescription, name='create_prescription'),
    path('metrics/record/', views.record_metric, name='record_metric'),
    path('appointments/create/', views.create_appointment, name='create_appointment'),
]
