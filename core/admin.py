from django.contrib import admin
from .models import (
    User, UserProfile, Client, HealthProgram, Enrollment, 
    Prescription, Metric, Encounter, Appointment, Drug, 
    PharmacyInventory, EnhancedPrescription, PaymentMethod, 
    Payment, TelemedicineSession, HealthFacility, Department,
    MedicalSpecialty, StaffProfile, HospitalNetwork, DoctorAvailability,
    ShiftBooking, SurgeryType, OperatingRoom, SurgerySchedule,
    DrugCategory, DrugManufacturer, VirtualPharmacist, PatientInsurance,
    MedicalHistory, SystemConfiguration, AuditLog
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_doctor', 'is_nurse', 'is_staff', 'date_joined']
    list_filter = ['is_doctor', 'is_nurse', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'employer_id']

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 'email']
    list_filter = ['gender', 'created_at']
    search_fields = ['first_name', 'last_name', 'phone_number', 'email']
    date_hierarchy = 'created_at'

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['client', 'doctor', 'appointment_type', 'scheduled_date', 'scheduled_time', 'status']
    list_filter = ['appointment_type', 'status', 'is_telemedicine', 'scheduled_date']
    search_fields = ['client__first_name', 'client__last_name', 'doctor__username']
    date_hierarchy = 'scheduled_date'
    ordering = ['-scheduled_date', '-scheduled_time']

@admin.register(Drug)
class DrugAdmin(admin.ModelAdmin):
    list_display = ['name', 'generic_name', 'brand_name', 'requires_prescription', 'is_controlled_substance']
    list_filter = ['requires_prescription', 'is_controlled_substance', 'pregnancy_category']
    search_fields = ['name', 'generic_name', 'brand_name']
    ordering = ['name']

@admin.register(PharmacyInventory)
class PharmacyInventoryAdmin(admin.ModelAdmin):
    list_display = ['drug', 'batch_number', 'quantity_in_stock', 'unit_price', 'expiry_date', 'is_low_stock', 'is_expired']
    list_filter = ['is_active', 'expiry_date', 'supplier']
    search_fields = ['drug__name', 'batch_number', 'supplier']
    date_hierarchy = 'expiry_date'
    
    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'
    
    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True
    is_expired.short_description = 'Expired'

@admin.register(EnhancedPrescription)
class EnhancedPrescriptionAdmin(admin.ModelAdmin):
    list_display = ['client', 'drug', 'prescribed_by', 'dosage', 'status', 'is_dispensed', 'start_date']
    list_filter = ['status', 'is_dispensed', 'start_date']
    search_fields = ['client__first_name', 'client__last_name', 'drug__name']
    date_hierarchy = 'start_date'

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['name', 'is_active']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'client', 'amount', 'currency', 'purpose', 'status', 'payment_date']
    list_filter = ['status', 'purpose', 'payment_method', 'currency']
    search_fields = ['transaction_id', 'external_transaction_id', 'client__first_name', 'client__last_name']
    date_hierarchy = 'payment_date'

@admin.register(TelemedicineSession)
class TelemedicineSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'appointment', 'status', 'started_at', 'duration_minutes']
    list_filter = ['status', 'started_at']
    search_fields = ['session_id', 'appointment__client__first_name']

# Kenya Health Facility Management
@admin.register(HealthFacility)
class HealthFacilityAdmin(admin.ModelAdmin):
    list_display = ['name', 'facility_type', 'facility_level', 'county', 'sub_county', 'bed_capacity', 'is_active']
    list_filter = ['facility_type', 'facility_level', 'county', 'is_24_hour', 'emergency_services', 'is_active']
    search_fields = ['name', 'registration_number', 'county', 'sub_county']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'facility_type', 'facility_level', 'registration_number')
        }),
        ('Location', {
            'fields': ('county', 'sub_county', 'ward', 'physical_address', 'postal_address', 'latitude', 'longitude')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'email', 'website')
        }),
        ('Services', {
            'fields': ('bed_capacity', 'emergency_services', 'maternity_services', 'surgery_services', 
                      'laboratory_services', 'pharmacy_services', 'radiology_services', 'dental_services')
        }),
        ('Operating Hours', {
            'fields': ('operating_hours_start', 'operating_hours_end', 'is_24_hour')
        }),
        ('Status', {
            'fields': ('is_active',)
        })
    )

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'facility', 'department_type', 'head_of_department', 'is_active']
    list_filter = ['department_type', 'facility', 'is_active']
    search_fields = ['name', 'facility__name']

@admin.register(MedicalSpecialty)
class MedicalSpecialtyAdmin(admin.ModelAdmin):
    list_display = ['name', 'requires_board_certification']
    search_fields = ['name']

@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'staff_id', 'staff_type', 'facility', 'department', 'employment_status', 'is_active']
    list_filter = ['staff_type', 'facility', 'employment_status', 'is_available_for_shifts', 'is_active']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'staff_id', 'national_id']
    filter_horizontal = ['specialties']

# Inter-Doctor Hospital System
@admin.register(HospitalNetwork)
class HospitalNetworkAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    filter_horizontal = ['member_facilities']
    search_fields = ['name']

@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'facility', 'department', 'date', 'start_time', 'end_time', 'status', 'hourly_rate']
    list_filter = ['status', 'facility', 'department', 'date']
    search_fields = ['doctor__username', 'doctor__first_name', 'doctor__last_name']
    date_hierarchy = 'date'

@admin.register(ShiftBooking)
class ShiftBookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'doctor', 'facility', 'shift_type', 'date', 'status', 'total_amount']
    list_filter = ['shift_type', 'status', 'facility', 'date']
    search_fields = ['booking_id', 'doctor__username', 'doctor__first_name', 'doctor__last_name']
    date_hierarchy = 'date'
    readonly_fields = ['booking_id']

# Surgery Management
@admin.register(SurgeryType)
class SurgeryTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'complexity_level', 'estimated_duration_minutes', 'average_cost']
    list_filter = ['complexity_level']
    search_fields = ['name']
    filter_horizontal = ['required_specialties']

@admin.register(OperatingRoom)
class OperatingRoomAdmin(admin.ModelAdmin):
    list_display = ['facility', 'room_number', 'room_name', 'capacity', 'status', 'is_active']
    list_filter = ['facility', 'status', 'is_active']
    search_fields = ['room_number', 'room_name', 'facility__name']

@admin.register(SurgerySchedule)
class SurgeryScheduleAdmin(admin.ModelAdmin):
    list_display = ['surgery_id', 'patient', 'surgery_type', 'primary_surgeon', 'scheduled_date', 'status', 'estimated_cost']
    list_filter = ['status', 'surgery_type', 'scheduled_date', 'insurance_covered']
    search_fields = ['surgery_id', 'patient__first_name', 'patient__last_name', 'primary_surgeon__username']
    date_hierarchy = 'scheduled_date'
    readonly_fields = ['surgery_id']
    filter_horizontal = ['assisting_surgeons']

# Virtual Pharmacy
@admin.register(DrugCategory)
class DrugCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent_category']
    search_fields = ['name']

@admin.register(DrugManufacturer)
class DrugManufacturerAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'is_approved']
    list_filter = ['country', 'is_approved']
    search_fields = ['name']

@admin.register(VirtualPharmacist)
class VirtualPharmacistAdmin(admin.ModelAdmin):
    list_display = ['consultation_id', 'client', 'consultation_type', 'confidence_score', 'human_reviewed', 'created_at']
    list_filter = ['consultation_type', 'human_reviewed', 'created_at']
    search_fields = ['consultation_id', 'client__first_name', 'client__last_name']
    readonly_fields = ['consultation_id']

# Enhanced Patient Management
@admin.register(PatientInsurance)
class PatientInsuranceAdmin(admin.ModelAdmin):
    list_display = ['client', 'insurance_type', 'provider_name', 'policy_number', 'valid_from', 'valid_until', 'is_active']
    list_filter = ['insurance_type', 'provider_name', 'is_active']
    search_fields = ['client__first_name', 'client__last_name', 'policy_number', 'member_number']

@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    list_display = ['client', 'blood_type', 'emergency_contact_name', 'emergency_contact_phone']
    search_fields = ['client__first_name', 'client__last_name', 'emergency_contact_name']

# System Management
@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = ['key', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['key']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action_type', 'model_name', 'object_id', 'timestamp']
    list_filter = ['action_type', 'model_name', 'timestamp']
    search_fields = ['user__username', 'model_name', 'object_id']
    date_hierarchy = 'timestamp'
    readonly_fields = ['user', 'action_type', 'model_name', 'object_id', 'changes', 'ip_address', 'user_agent', 'timestamp']

# Register existing models
admin.site.register(UserProfile)
admin.site.register(HealthProgram)
admin.site.register(Enrollment)
admin.site.register(Prescription)
admin.site.register(Metric)
admin.site.register(Encounter)
