from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User model for staff (Doctors/Nurses) and other users
class User(AbstractUser):
    is_doctor = models.BooleanField(default=False)
    is_nurse = models.BooleanField(default=False)
    employer_id = models.CharField(max_length=100, unique=True, blank=False)  # Unique employer ID for login
    work_email = models.EmailField(unique=True, blank=False)  # Work email for staff registration

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username

# HealthProgram model for different programs in the healthcare system
class HealthProgram(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='programs_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Client (Patient) model with personal details and other information
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

# Enrollment model to link clients to health programs
class Enrollment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='enrollments')
    program = models.ForeignKey(HealthProgram, on_delete=models.CASCADE)
    enrolled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='enrollments_created')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('client', 'program')

    def __str__(self):
        return f"{self.client} in {self.program}"

# Prescription model for client prescriptions
class Prescription(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='prescriptions')
    prescribed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='prescriptions_written')
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medication_name} for {self.client}"

# Metric model for tracking health metrics of clients
class Metric(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='metrics')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='metrics_recorded')
    name = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=20)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}: {self.value}{self.unit} for {self.client}"

# Appointment model for scheduling appointments with clients
class Appointment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments')
    scheduled_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments_scheduled')
    scheduled_for = models.DateTimeField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='Scheduled', 
                             choices=[('Scheduled', 'Scheduled'), 
                                      ('Completed', 'Completed'),
                                      ('Cancelled', 'Cancelled')])
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment for {self.client} on {self.scheduled_for}"

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    notifications = models.BooleanField(default=True)
    email_alerts = models.BooleanField(default=True)
    dark_mode = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    date_format = models.CharField(max_length=20, default='YYYY-MM-DD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s settings"

class UserProfile(models.Model):
    """
    Extended user profile model to store additional information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    work_email = models.EmailField(unique=True)
    employer_id = models.CharField(max_length=50, unique=True)
    is_doctor = models.BooleanField(default=False)
    is_nurse = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    class Meta:
        ordering = ['-created_at']
