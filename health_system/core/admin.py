from django.contrib import admin
from .models import User, HealthProgram, Client, Enrollment, Prescription, Metric, Appointment

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'is_doctor', 'is_nurse', 'employer_id', 'work_email')
    list_filter = ('is_doctor', 'is_nurse')
    search_fields = ('username', 'employer_id', 'work_email')

@admin.register(HealthProgram)
class HealthProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    search_fields = ('name', 'description')

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number')
    search_fields = ('first_name', 'last_name', 'phone_number', 'email')
    list_filter = ('gender',)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('client', 'program', 'enrolled_by', 'enrollment_date', 'is_active')
    list_filter = ('is_active', 'program')

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('client', 'medication_name', 'prescribed_by', 'start_date', 'end_date')
    search_fields = ('medication_name', 'client__first_name', 'client__last_name')
    list_filter = ('start_date',)

@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ('client', 'name', 'value', 'unit', 'recorded_by', 'recorded_at')
    list_filter = ('name', 'unit')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('client', 'scheduled_with', 'scheduled_for', 'status')
    list_filter = ('status', 'scheduled_for')
    search_fields = ('client__first_name', 'client__last_name', 'reason')
