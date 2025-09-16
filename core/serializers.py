from rest_framework import serializers
from .models import (
    User, HealthProgram, Client, Enrollment, Prescription, Metric, UserProfile, Encounter,
    Appointment, Drug, PharmacyInventory, EnhancedPrescription, PaymentMethod, Payment, TelemedicineSession,
    HealthFacility, Department, MedicalSpecialty, StaffProfile, HospitalNetwork, DoctorAvailability,
    ShiftBooking, SurgeryType, OperatingRoom, SurgerySchedule, DrugCategory, DrugManufacturer,
    VirtualPharmacist, PatientInsurance, MedicalHistory, SystemConfiguration, AuditLog
)
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_doctor', 'is_nurse', 'is_staff', 'employer_id', 'work_email']
        read_only_fields = ['id']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'work_email', 'employer_id', 'is_doctor', 'is_nurse', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class HealthProgramSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = HealthProgram
        fields = ['id', 'name', 'description', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_at']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'phone_number', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    program = HealthProgramSerializer(read_only=True)
    enrolled_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'client', 'program', 'enrolled_by', 'enrollment_date', 'is_active']
        read_only_fields = ['id', 'enrollment_date']

class PrescriptionSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    prescribed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Prescription
        fields = ['id', 'client', 'prescribed_by', 'medication_name', 'dosage', 'frequency', 'duration', 'start_date', 'end_date', 'notes', 'prescribed_date', 'created_at']
        read_only_fields = ['id', 'prescribed_date', 'created_at']

class MetricSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    recorded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Metric
        fields = ['id', 'client', 'recorded_by', 'name', 'value', 'unit', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']

class EncounterSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    
    class Meta:
        model = Encounter
        fields = ['id', 'client', 'provider', 'encounter_type', 'scheduled_for', 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

# Enhanced serializers for new models
class AppointmentSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    doctor = UserSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'doctor', 'client_id', 'doctor_id', 'appointment_type', 
            'scheduled_date', 'scheduled_time', 'duration_minutes', 'status', 
            'reason', 'notes', 'is_telemedicine', 'meeting_link', 'reminder_sent', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DrugSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drug
        fields = [
            'id', 'name', 'generic_name', 'brand_name', 'description', 
            'dosage_forms', 'strength_options', 'contraindications', 'side_effects', 
            'drug_interactions', 'pregnancy_category', 'requires_prescription', 
            'is_controlled_substance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PharmacyInventorySerializer(serializers.ModelSerializer):
    drug = DrugSerializer(read_only=True)
    drug_id = serializers.IntegerField(write_only=True)
    is_expired = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = PharmacyInventory
        fields = [
            'id', 'drug', 'drug_id', 'batch_number', 'quantity_in_stock', 
            'unit_price', 'cost_price', 'expiry_date', 'supplier', 
            'minimum_stock_level', 'location', 'is_active', 'is_expired', 
            'is_low_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class EnhancedPrescriptionSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    prescribed_by = UserSerializer(read_only=True)
    dispensed_by = UserSerializer(read_only=True)
    drug = DrugSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    prescribed_by_id = serializers.IntegerField(write_only=True)
    drug_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = EnhancedPrescription
        fields = [
            'id', 'client', 'prescribed_by', 'dispensed_by', 'drug', 
            'client_id', 'prescribed_by_id', 'drug_id', 'dosage', 'frequency', 
            'duration_days', 'quantity_prescribed', 'instructions', 'start_date', 
            'end_date', 'status', 'refills_allowed', 'refills_used', 
            'interaction_warnings', 'is_dispensed', 'dispensed_date', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'dispensed_date', 'created_at', 'updated_at']

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    appointment = AppointmentSerializer(read_only=True)
    prescription = EnhancedPrescriptionSerializer(read_only=True)
    payment_method = PaymentMethodSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    payment_method_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'client', 'appointment', 'prescription', 'payment_method',
            'client_id', 'payment_method_id', 'amount', 'currency', 'purpose', 
            'description', 'status', 'transaction_id', 'external_transaction_id', 
            'payment_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'payment_date', 'created_at', 'updated_at']

class TelemedicineSessionSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)
    appointment_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TelemedicineSession
        fields = [
            'id', 'appointment', 'appointment_id', 'session_id', 'meeting_url', 
            'recording_url', 'status', 'started_at', 'ended_at', 'duration_minutes', 
            'technical_notes', 'created_at'
        ]
        read_only_fields = ['id', 'session_id', 'created_at']

# Kenya Health Facility Management Serializers

class HealthFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthFacility
        fields = [
            'id', 'name', 'facility_type', 'facility_level', 'registration_number',
            'county', 'sub_county', 'ward', 'physical_address', 'postal_address',
            'phone_number', 'email', 'website', 'latitude', 'longitude',
            'bed_capacity', 'operating_hours_start', 'operating_hours_end', 'is_24_hour',
            'emergency_services', 'maternity_services', 'surgery_services',
            'laboratory_services', 'pharmacy_services', 'radiology_services',
            'dental_services', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DepartmentSerializer(serializers.ModelSerializer):
    facility = HealthFacilitySerializer(read_only=True)
    head_of_department = UserSerializer(read_only=True)
    facility_id = serializers.IntegerField(write_only=True)
    head_of_department_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Department
        fields = [
            'id', 'facility', 'facility_id', 'name', 'department_type', 'description',
            'head_of_department', 'head_of_department_id', 'location', 'phone_extension',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class MedicalSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalSpecialty
        fields = ['id', 'name', 'description', 'requires_board_certification']
        read_only_fields = ['id']

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    facility = HealthFacilitySerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    specialties = MedicalSpecialtySerializer(many=True, read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    facility_id = serializers.IntegerField(write_only=True)
    department_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = StaffProfile
        fields = [
            'id', 'user', 'user_id', 'facility', 'facility_id', 'staff_id', 'staff_type',
            'department', 'department_id', 'specialties', 'license_number', 'license_expiry_date',
            'employment_status', 'date_joined', 'phone_number', 'emergency_contact_name',
            'emergency_contact_phone', 'national_id', 'kra_pin', 'nhif_number',
            'bank_account_number', 'bank_name', 'is_available_for_shifts', 'hourly_rate',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

# Inter-Doctor Hospital System Serializers

class HospitalNetworkSerializer(serializers.ModelSerializer):
    member_facilities = HealthFacilitySerializer(many=True, read_only=True)
    member_facility_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    class Meta:
        model = HospitalNetwork
        fields = [
            'id', 'name', 'description', 'member_facilities', 'member_facility_ids',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    doctor = UserSerializer(read_only=True)
    facility = HealthFacilitySerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    facility_id = serializers.IntegerField(write_only=True)
    department_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DoctorAvailability
        fields = [
            'id', 'doctor', 'doctor_id', 'facility', 'facility_id', 'department',
            'department_id', 'date', 'start_time', 'end_time', 'status', 'hourly_rate',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class ShiftBookingSerializer(serializers.ModelSerializer):
    doctor = UserSerializer(read_only=True)
    facility = HealthFacilitySerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    booked_by = UserSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    facility_id = serializers.IntegerField(write_only=True)
    department_id = serializers.IntegerField(write_only=True)
    booked_by_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ShiftBooking
        fields = [
            'id', 'booking_id', 'doctor', 'doctor_id', 'facility', 'facility_id',
            'department', 'department_id', 'booked_by', 'booked_by_id', 'shift_type',
            'date', 'start_time', 'end_time', 'expected_patients', 'special_requirements',
            'hourly_rate', 'total_amount', 'status', 'confirmation_deadline',
            'actual_start_time', 'actual_end_time', 'patients_attended', 'notes',
            'rating', 'feedback', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_id', 'created_at', 'updated_at']

# Surgery Management Serializers

class SurgeryTypeSerializer(serializers.ModelSerializer):
    required_specialties = MedicalSpecialtySerializer(many=True, read_only=True)
    required_specialty_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    class Meta:
        model = SurgeryType
        fields = [
            'id', 'name', 'description', 'complexity_level', 'estimated_duration_minutes',
            'required_specialties', 'required_specialty_ids', 'equipment_required',
            'pre_op_requirements', 'post_op_requirements', 'average_cost'
        ]
        read_only_fields = ['id']

class OperatingRoomSerializer(serializers.ModelSerializer):
    facility = HealthFacilitySerializer(read_only=True)
    facility_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = OperatingRoom
        fields = [
            'id', 'facility', 'facility_id', 'room_number', 'room_name', 'capacity',
            'equipment_available', 'status', 'last_cleaned', 'next_maintenance', 'is_active'
        ]
        read_only_fields = ['id']

class SurgeryScheduleSerializer(serializers.ModelSerializer):
    patient = ClientSerializer(read_only=True)
    surgery_type = SurgeryTypeSerializer(read_only=True)
    primary_surgeon = UserSerializer(read_only=True)
    assisting_surgeons = UserSerializer(many=True, read_only=True)
    anesthesiologist = UserSerializer(read_only=True)
    operating_room = OperatingRoomSerializer(read_only=True)
    patient_id = serializers.IntegerField(write_only=True)
    surgery_type_id = serializers.IntegerField(write_only=True)
    primary_surgeon_id = serializers.IntegerField(write_only=True)
    operating_room_id = serializers.IntegerField(write_only=True)
    assisting_surgeon_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    anesthesiologist_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = SurgerySchedule
        fields = [
            'id', 'surgery_id', 'patient', 'patient_id', 'surgery_type', 'surgery_type_id',
            'primary_surgeon', 'primary_surgeon_id', 'assisting_surgeons', 'assisting_surgeon_ids',
            'anesthesiologist', 'anesthesiologist_id', 'operating_room', 'operating_room_id',
            'scheduled_date', 'scheduled_start_time', 'estimated_duration_minutes',
            'actual_start_time', 'actual_end_time', 'status', 'pre_op_notes',
            'operative_notes', 'post_op_notes', 'complications', 'estimated_cost',
            'actual_cost', 'insurance_covered', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'surgery_id', 'created_at', 'updated_at']

# Virtual Pharmacy Serializers

class DrugCategorySerializer(serializers.ModelSerializer):
    parent_category = serializers.StringRelatedField(read_only=True)
    parent_category_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = DrugCategory
        fields = ['id', 'name', 'description', 'parent_category', 'parent_category_id']
        read_only_fields = ['id']

class DrugManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrugManufacturer
        fields = ['id', 'name', 'country', 'contact_info', 'is_approved']
        read_only_fields = ['id']

class VirtualPharmacistSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    reviewed_by_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = VirtualPharmacist
        fields = [
            'id', 'consultation_id', 'client', 'client_id', 'consultation_type',
            'input_data', 'ai_response', 'confidence_score', 'human_reviewed',
            'reviewed_by', 'reviewed_by_id', 'review_notes', 'created_at'
        ]
        read_only_fields = ['id', 'consultation_id', 'created_at']

# Enhanced Patient Management Serializers

class PatientInsuranceSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PatientInsurance
        fields = [
            'id', 'client', 'client_id', 'insurance_type', 'provider_name',
            'policy_number', 'member_number', 'coverage_amount', 'deductible',
            'copay_percentage', 'valid_from', 'valid_until', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class MedicalHistorySerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MedicalHistory
        fields = [
            'id', 'client', 'client_id', 'allergies', 'chronic_conditions',
            'previous_surgeries', 'family_history', 'social_history',
            'immunization_history', 'blood_type', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relationship',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

# System Management Serializers

class SystemConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfiguration
        fields = ['id', 'key', 'value', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AuditLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'action_type', 'model_name', 'object_id', 'changes',
            'ip_address', 'user_agent', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']