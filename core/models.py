from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    is_doctor = models.BooleanField(default=False)
    is_nurse = models.BooleanField(default=False)
    employer_id = models.CharField(max_length=100, unique=True, blank=False)
    work_email = models.EmailField(unique=True, blank=False)

    def __str__(self):
        return self.username

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    work_email = models.EmailField(max_length=255, blank=True)
    employer_id = models.CharField(max_length=50, blank=True)
    is_doctor = models.BooleanField(default=False)
    is_nurse = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

class HealthProgram(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='programs_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Client(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Enrollment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='enrollments')
    program = models.ForeignKey(HealthProgram, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='enrollments_created')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('client', 'program')

    def __str__(self):
        return f"{self.client} in {self.program}"

class Prescription(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='prescriptions')
    prescribed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='prescriptions_written')
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    prescribed_date = models.DateField(auto_now_add=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medication_name} for {self.client}"

class Metric(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='metrics')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='metrics_recorded')
    name = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=20)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}: {self.value}{self.unit} for {self.client}"

ENCOUNTER_TYPE_CHOICES = [
    ('Consultation', 'Consultation'),
    ('Follow-up', 'Follow-up'),
    ('Emergency', 'Emergency'),
    ('Routine', 'Routine'),
]

ENCOUNTER_STATUS_CHOICES = [
    ('Scheduled', 'Scheduled'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
    ('No Show', 'No Show'),
]

class Encounter(models.Model):
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='encounters')
    provider = models.ForeignKey('User', on_delete=models.CASCADE, related_name='encounters')
    encounter_type = models.CharField(max_length=32, choices=ENCOUNTER_TYPE_CHOICES, default='Consultation')
    scheduled_for = models.DateTimeField()
    status = models.CharField(max_length=20, choices=ENCOUNTER_STATUS_CHOICES, default='Scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.encounter_type} for {self.client} with {self.provider} on {self.scheduled_for}"
