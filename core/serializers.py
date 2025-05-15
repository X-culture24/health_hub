from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client, UserProfile, HealthProgram, Enrollment, Prescription, Metric, Appointment

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    work_email = serializers.EmailField(source='user.work_email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'work_email', 'employer_id', 
                 'is_doctor', 'is_nurse', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'address', 'date_of_birth', 'emergency_contact']

class HealthProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthProgram
        fields = ['id', 'name', 'description', 'created_by', 'created_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'client', 'program', 'enrolled_by', 'enrollment_date', 'is_active']

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['id', 'client', 'prescribed_by', 'medication_name', 'dosage', 'frequency', 'start_date', 'end_date', 'notes']

class MetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = ['id', 'client', 'recorded_by', 'name', 'value', 'unit', 'recorded_at']

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'client', 'scheduled_with', 'scheduled_for', 'reason', 'status', 'notes'] 