from django.db import models
from django.conf import settings
from health_system.core.models import User, Appointment

class SpecialistProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='specialist_profile')
    specialty = models.CharField(max_length=100)
    rates = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('busy', 'Busy'),
        ('on_call', 'On-Call'),
        ('off_duty', 'Off-Duty'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    def __str__(self):
        return f"{self.user.username} ({self.specialty})"

class AvailabilitySlot(models.Model):
    specialist = models.ForeignKey(SpecialistProfile, on_delete=models.CASCADE, related_name='availability_slots')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=SpecialistProfile.STATUS_CHOICES, default='available')

    def __str__(self):
        return f"{self.specialist} {self.start_time} - {self.end_time}"

class ReferralRequest(models.Model):
    URGENCY_CHOICES = [
        ('emergency', 'Emergency'),
        ('normal', 'Normal'),
        ('follow_up', 'Follow-up'),
    ]
    patient = models.ForeignKey('core.Client', on_delete=models.CASCADE, related_name='referrals')
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='referral_requests')
    specialty = models.CharField(max_length=100)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')
    status = models.CharField(max_length=20, default='pending')
    assigned_specialist = models.ForeignKey(SpecialistProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_referrals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Referral for {self.patient} ({self.specialty})"

class ReferralAttempt(models.Model):
    referral = models.ForeignKey(ReferralRequest, on_delete=models.CASCADE, related_name='attempts')
    specialist = models.ForeignKey(SpecialistProfile, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[('pending','Pending'),('accepted','Accepted'),('declined','Declined'),('timeout','Timeout'),('escalated','Escalated')], default='pending')
    attempted_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Attempt: {self.referral} -> {self.specialist} ({self.status})" 