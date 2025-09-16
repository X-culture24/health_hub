from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import RegexValidator
import uuid

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

# Enhanced Appointment System
class Appointment(models.Model):
    APPOINTMENT_TYPES = [
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up'),
        ('emergency', 'Emergency'),
        ('telemedicine', 'Telemedicine'),
        ('vaccination', 'Vaccination'),
        ('checkup', 'Regular Checkup'),
    ]
    
    APPOINTMENT_STATUS = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor_appointments')
    appointment_type = models.CharField(max_length=20, choices=APPOINTMENT_TYPES)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    duration_minutes = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS, default='scheduled')
    reason = models.TextField()
    notes = models.TextField(blank=True)
    is_telemedicine = models.BooleanField(default=False)
    meeting_link = models.URLField(blank=True, null=True)
    reminder_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('doctor', 'scheduled_date', 'scheduled_time')
        ordering = ['scheduled_date', 'scheduled_time']
    
    def __str__(self):
        return f"{self.client} - {self.appointment_type} on {self.scheduled_date} at {self.scheduled_time}"

# Pharmacy and Drug Management
class Drug(models.Model):
    name = models.CharField(max_length=200, unique=True)
    generic_name = models.CharField(max_length=200, blank=True)
    brand_name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    dosage_forms = models.JSONField(default=list)  # ['tablet', 'capsule', 'syrup']
    strength_options = models.JSONField(default=list)  # ['10mg', '20mg', '50mg']
    contraindications = models.TextField(blank=True)
    side_effects = models.TextField(blank=True)
    drug_interactions = models.JSONField(default=list)  # List of drug IDs that interact
    pregnancy_category = models.CharField(max_length=10, blank=True)
    requires_prescription = models.BooleanField(default=True)
    is_controlled_substance = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.generic_name})"

class PharmacyInventory(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE, related_name='inventory')
    batch_number = models.CharField(max_length=100)
    quantity_in_stock = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField()
    supplier = models.CharField(max_length=200)
    minimum_stock_level = models.IntegerField(default=10)
    location = models.CharField(max_length=100, blank=True)  # Shelf/bin location
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('drug', 'batch_number')
    
    def __str__(self):
        return f"{self.drug.name} - Batch: {self.batch_number} (Qty: {self.quantity_in_stock})"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return self.expiry_date < timezone.now().date()
    
    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.minimum_stock_level

# Enhanced Prescription with Drug Interaction Checking
class EnhancedPrescription(models.Model):
    PRESCRIPTION_STATUS = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='enhanced_prescriptions')
    prescribed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enhanced_prescriptions_written')
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration_days = models.IntegerField()
    quantity_prescribed = models.IntegerField()
    instructions = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=PRESCRIPTION_STATUS, default='active')
    refills_allowed = models.IntegerField(default=0)
    refills_used = models.IntegerField(default=0)
    interaction_warnings = models.JSONField(default=list)
    is_dispensed = models.BooleanField(default=False)
    dispensed_date = models.DateTimeField(null=True, blank=True)
    dispensed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='dispensed_prescriptions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.drug.name} for {self.client} - {self.dosage}"

# Payment System
class PaymentMethod(models.Model):
    PAYMENT_TYPES = [
        ('mpesa', 'M-Pesa'),
        ('airtel', 'Airtel Money'),
        ('card', 'Credit/Debit Card'),
        ('cash', 'Cash'),
        ('insurance', 'Insurance'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    name = models.CharField(max_length=50, choices=PAYMENT_TYPES)
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict)  # Store API keys, endpoints etc
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.get_name_display()

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_PURPOSE = [
        ('consultation', 'Consultation Fee'),
        ('medication', 'Medication'),
        ('procedure', 'Medical Procedure'),
        ('lab_test', 'Laboratory Test'),
        ('admission', 'Hospital Admission'),
        ('other', 'Other'),
    ]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    prescription = models.ForeignKey(EnhancedPrescription, on_delete=models.SET_NULL, null=True, blank=True)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    purpose = models.CharField(max_length=20, choices=PAYMENT_PURPOSE)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True)
    external_transaction_id = models.CharField(max_length=100, blank=True)  # From payment provider
    payment_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.transaction_id} - {self.amount} {self.currency} ({self.status})"

# Telemedicine
class TelemedicineSession(models.Model):
    SESSION_STATUS = [
        ('scheduled', 'Scheduled'),
        ('waiting', 'Waiting Room'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('technical_issues', 'Technical Issues'),
    ]
    
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='telemedicine_session')
    session_id = models.CharField(max_length=100, unique=True)
    meeting_url = models.URLField()
    recording_url = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=SESSION_STATUS, default='scheduled')
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    technical_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Telemedicine Session {self.session_id} - {self.appointment}"

# Kenya Health Facility Management System

class HealthFacility(models.Model):
    """Represents any health facility in Kenya - hospitals, clinics, dispensaries, etc."""
    FACILITY_TYPES = [
        ('national_hospital', 'National Referral Hospital'),
        ('county_hospital', 'County Referral Hospital'),
        ('sub_county_hospital', 'Sub-County Hospital'),
        ('health_centre', 'Health Centre'),
        ('dispensary', 'Dispensary'),
        ('private_hospital', 'Private Hospital'),
        ('private_clinic', 'Private Clinic'),
        ('nursing_home', 'Nursing Home'),
        ('specialized_clinic', 'Specialized Clinic'),
    ]
    
    FACILITY_LEVELS = [
        ('level_1', 'Level 1 - Community'),
        ('level_2', 'Level 2 - Dispensary'),
        ('level_3', 'Level 3 - Health Centre'),
        ('level_4', 'Level 4 - Sub-County Hospital'),
        ('level_5', 'Level 5 - County Hospital'),
        ('level_6', 'Level 6 - National Hospital'),
    ]
    
    name = models.CharField(max_length=200)
    facility_type = models.CharField(max_length=30, choices=FACILITY_TYPES)
    facility_level = models.CharField(max_length=20, choices=FACILITY_LEVELS)
    registration_number = models.CharField(max_length=100, unique=True)
    county = models.CharField(max_length=100)
    sub_county = models.CharField(max_length=100)
    ward = models.CharField(max_length=100)
    physical_address = models.TextField()
    postal_address = models.CharField(max_length=200, blank=True)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    bed_capacity = models.IntegerField(default=0)
    operating_hours_start = models.TimeField()
    operating_hours_end = models.TimeField()
    is_24_hour = models.BooleanField(default=False)
    emergency_services = models.BooleanField(default=False)
    maternity_services = models.BooleanField(default=False)
    surgery_services = models.BooleanField(default=False)
    laboratory_services = models.BooleanField(default=False)
    pharmacy_services = models.BooleanField(default=False)
    radiology_services = models.BooleanField(default=False)
    dental_services = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_facility_type_display()}"

class Department(models.Model):
    """Hospital departments like Surgery, Pediatrics, etc."""
    DEPARTMENT_TYPES = [
        ('emergency', 'Emergency Department'),
        ('surgery', 'Surgery'),
        ('internal_medicine', 'Internal Medicine'),
        ('pediatrics', 'Pediatrics'),
        ('obstetrics_gynecology', 'Obstetrics & Gynecology'),
        ('orthopedics', 'Orthopedics'),
        ('cardiology', 'Cardiology'),
        ('neurology', 'Neurology'),
        ('psychiatry', 'Psychiatry'),
        ('radiology', 'Radiology'),
        ('laboratory', 'Laboratory'),
        ('pharmacy', 'Pharmacy'),
        ('outpatient', 'Outpatient'),
        ('inpatient', 'Inpatient'),
        ('icu', 'Intensive Care Unit'),
        ('maternity', 'Maternity'),
        ('dental', 'Dental'),
        ('ophthalmology', 'Ophthalmology'),
        ('ent', 'ENT (Ear, Nose, Throat)'),
        ('dermatology', 'Dermatology'),
    ]
    
    facility = models.ForeignKey(HealthFacility, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    department_type = models.CharField(max_length=30, choices=DEPARTMENT_TYPES)
    description = models.TextField(blank=True)
    head_of_department = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='departments_headed')
    location = models.CharField(max_length=200, blank=True)  # Floor, wing, room numbers
    phone_extension = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('facility', 'department_type')
    
    def __str__(self):
        return f"{self.name} - {self.facility.name}"

class MedicalSpecialty(models.Model):
    """Medical specialties for doctors"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    requires_board_certification = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Medical Specialties"
    
    def __str__(self):
        return self.name

class StaffProfile(models.Model):
    """Enhanced staff profile for all healthcare workers"""
    STAFF_TYPES = [
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('clinical_officer', 'Clinical Officer'),
        ('pharmacist', 'Pharmacist'),
        ('lab_technician', 'Laboratory Technician'),
        ('radiographer', 'Radiographer'),
        ('physiotherapist', 'Physiotherapist'),
        ('nutritionist', 'Nutritionist'),
        ('social_worker', 'Social Worker'),
        ('administrator', 'Administrator'),
        ('receptionist', 'Receptionist'),
        ('security', 'Security'),
        ('cleaner', 'Cleaner'),
        ('driver', 'Driver'),
        ('other', 'Other'),
    ]
    
    EMPLOYMENT_STATUS = [
        ('permanent', 'Permanent'),
        ('contract', 'Contract'),
        ('locum', 'Locum'),
        ('volunteer', 'Volunteer'),
        ('intern', 'Intern'),
        ('resident', 'Resident'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    facility = models.ForeignKey(HealthFacility, on_delete=models.CASCADE, related_name='staff')
    staff_id = models.CharField(max_length=50, unique=True)
    staff_type = models.CharField(max_length=20, choices=STAFF_TYPES)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    specialties = models.ManyToManyField(MedicalSpecialty, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='permanent')
    date_joined = models.DateField()
    phone_number = models.CharField(max_length=20)
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    national_id = models.CharField(max_length=20, unique=True)
    kra_pin = models.CharField(max_length=20, blank=True)
    nhif_number = models.CharField(max_length=20, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    is_available_for_shifts = models.BooleanField(default=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_staff_type_display()} ({self.staff_id})"

# Inter-Doctor Hospital System

class HospitalNetwork(models.Model):
    """Network of hospitals for inter-doctor collaboration"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    member_facilities = models.ManyToManyField(HealthFacility, related_name='networks')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class DoctorAvailability(models.Model):
    """Doctor availability for shifts across different hospitals"""
    AVAILABILITY_STATUS = [
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('unavailable', 'Unavailable'),
        ('on_leave', 'On Leave'),
    ]
    
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability_slots')
    facility = models.ForeignKey(HealthFacility, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=AVAILABILITY_STATUS, default='available')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('doctor', 'facility', 'date', 'start_time')
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.doctor.get_full_name()} - {self.facility.name} on {self.date}"

class ShiftBooking(models.Model):
    """Booking system for doctors to work shifts at different hospitals"""
    BOOKING_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    SHIFT_TYPES = [
        ('regular', 'Regular Shift'),
        ('emergency', 'Emergency Call'),
        ('surgery', 'Surgery'),
        ('consultation', 'Consultation'),
        ('on_call', 'On-Call'),
    ]
    
    booking_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shift_bookings')
    facility = models.ForeignKey(HealthFacility, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    booked_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_made')
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPES)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    expected_patients = models.IntegerField(default=0)
    special_requirements = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    confirmation_deadline = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    patients_attended = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    rating = models.IntegerField(null=True, blank=True)  # 1-5 rating
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Shift Booking {self.booking_id} - {self.doctor.get_full_name()} at {self.facility.name}"

# Surgery Management System

class SurgeryType(models.Model):
    """Types of surgeries available"""
    COMPLEXITY_LEVELS = [
        ('minor', 'Minor Surgery'),
        ('major', 'Major Surgery'),
        ('complex', 'Complex Surgery'),
        ('emergency', 'Emergency Surgery'),
    ]
    
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    complexity_level = models.CharField(max_length=20, choices=COMPLEXITY_LEVELS)
    estimated_duration_minutes = models.IntegerField()
    required_specialties = models.ManyToManyField(MedicalSpecialty)
    equipment_required = models.JSONField(default=list)
    pre_op_requirements = models.TextField(blank=True)
    post_op_requirements = models.TextField(blank=True)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_complexity_level_display()})"

class OperatingRoom(models.Model):
    """Operating rooms/theaters in hospitals"""
    ROOM_STATUS = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Under Maintenance'),
        ('cleaning', 'Being Cleaned'),
        ('reserved', 'Reserved'),
    ]
    
    facility = models.ForeignKey(HealthFacility, on_delete=models.CASCADE, related_name='operating_rooms')
    room_number = models.CharField(max_length=20)
    room_name = models.CharField(max_length=100, blank=True)
    capacity = models.IntegerField(default=10)  # Number of people it can accommodate
    equipment_available = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=ROOM_STATUS, default='available')
    last_cleaned = models.DateTimeField(null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('facility', 'room_number')
    
    def __str__(self):
        return f"OR {self.room_number} - {self.facility.name}"

class SurgerySchedule(models.Model):
    """Surgery scheduling system"""
    SURGERY_STATUS = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('pre_op', 'Pre-Operative'),
        ('in_progress', 'In Progress'),
        ('post_op', 'Post-Operative'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('postponed', 'Postponed'),
    ]
    
    surgery_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    patient = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='surgeries')
    surgery_type = models.ForeignKey(SurgeryType, on_delete=models.CASCADE)
    primary_surgeon = models.ForeignKey(User, on_delete=models.CASCADE, related_name='primary_surgeries')
    assisting_surgeons = models.ManyToManyField(User, related_name='assisting_surgeries', blank=True)
    anesthesiologist = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='anesthesia_cases')
    operating_room = models.ForeignKey(OperatingRoom, on_delete=models.CASCADE)
    scheduled_date = models.DateField()
    scheduled_start_time = models.TimeField()
    estimated_duration_minutes = models.IntegerField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=SURGERY_STATUS, default='scheduled')
    pre_op_notes = models.TextField(blank=True)
    operative_notes = models.TextField(blank=True)
    post_op_notes = models.TextField(blank=True)
    complications = models.TextField(blank=True)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    insurance_covered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Surgery {self.surgery_id} - {self.surgery_type.name} for {self.patient}"

# Virtual Pharmacy Enhancement

class DrugCategory(models.Model):
    """Categories for drugs (Antibiotics, Analgesics, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent_category = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Drug Categories"
    
    def __str__(self):
        return self.name

class DrugManufacturer(models.Model):
    """Drug manufacturers"""
    name = models.CharField(max_length=200, unique=True)
    country = models.CharField(max_length=100)
    contact_info = models.JSONField(default=dict)
    is_approved = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class VirtualPharmacist(models.Model):
    """AI-powered virtual pharmacist for drug interactions and recommendations"""
    CONSULTATION_TYPES = [
        ('interaction_check', 'Drug Interaction Check'),
        ('recommendation', 'Drug Recommendation'),
        ('dosage_advice', 'Dosage Advice'),
        ('side_effects', 'Side Effects Information'),
        ('contraindications', 'Contraindications Check'),
    ]
    
    consultation_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='pharmacist_consultations')
    consultation_type = models.CharField(max_length=30, choices=CONSULTATION_TYPES)
    input_data = models.JSONField()  # Symptoms, current medications, etc.
    ai_response = models.JSONField()  # AI recommendations, warnings, etc.
    confidence_score = models.FloatField()  # AI confidence level
    human_reviewed = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    review_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Virtual Pharmacist Consultation {self.consultation_id} - {self.client}"

# Enhanced Patient Management

class PatientInsurance(models.Model):
    """Patient insurance information"""
    INSURANCE_TYPES = [
        ('nhif', 'NHIF'),
        ('private', 'Private Insurance'),
        ('employer', 'Employer Insurance'),
        ('community', 'Community Insurance'),
        ('other', 'Other'),
    ]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='insurance_policies')
    insurance_type = models.CharField(max_length=20, choices=INSURANCE_TYPES)
    provider_name = models.CharField(max_length=200)
    policy_number = models.CharField(max_length=100)
    member_number = models.CharField(max_length=100, blank=True)
    coverage_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    deductible = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    copay_percentage = models.FloatField(default=0)  # Percentage patient pays
    valid_from = models.DateField()
    valid_until = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.client} - {self.provider_name} ({self.policy_number})"

class MedicalHistory(models.Model):
    """Comprehensive medical history for patients"""
    client = models.OneToOneField(Client, on_delete=models.CASCADE, related_name='medical_history')
    allergies = models.JSONField(default=list)  # List of allergies
    chronic_conditions = models.JSONField(default=list)  # Diabetes, Hypertension, etc.
    previous_surgeries = models.JSONField(default=list)  # Surgery history
    family_history = models.JSONField(default=dict)  # Family medical history
    social_history = models.JSONField(default=dict)  # Smoking, drinking, etc.
    immunization_history = models.JSONField(default=list)  # Vaccination records
    blood_type = models.CharField(max_length=5, blank=True)
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    emergency_contact_relationship = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Medical History - {self.client}"

# System Scalability Features

class SystemConfiguration(models.Model):
    """System-wide configuration for scalability"""
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.key

class AuditLog(models.Model):
    """Audit trail for all system activities"""
    ACTION_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('payment', 'Payment'),
        ('prescription', 'Prescription'),
        ('appointment', 'Appointment'),
        ('surgery', 'Surgery'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)
    changes = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} - {self.action_type} {self.model_name} at {self.timestamp}"
