from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Client, Program, Appointment, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    work_email = serializers.EmailField(source='user.work_email', read_only=True)
    employer_id = serializers.CharField(source='user.employer_id', read_only=True)
    is_doctor = serializers.BooleanField(source='user.is_doctor', read_only=True)
    is_nurse = serializers.BooleanField(source='user.is_nurse', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'work_email', 'employer_id', 'is_doctor', 'is_nurse', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] 