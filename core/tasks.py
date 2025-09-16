"""
Celery tasks for Health Hub System
"""
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
from .models import Appointment, EnhancedPrescription, PharmacyInventory
from .services import AppointmentService, InventoryService

@shared_task
def send_appointment_reminders():
    """
    Send appointment reminders 24 hours before scheduled time
    """
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    appointments = Appointment.objects.filter(
        scheduled_date=tomorrow,
        status__in=['scheduled', 'confirmed'],
        reminder_sent=False
    ).select_related('client', 'doctor')
    
    sent_count = 0
    for appointment in appointments:
        success = AppointmentService.send_appointment_reminder(appointment.id)
        if success:
            sent_count += 1
    
    return f"Sent {sent_count} appointment reminders"

@shared_task
def check_prescription_expiry():
    """
    Check for prescriptions that are about to expire
    """
    expiring_soon = timezone.now().date() + timedelta(days=7)
    
    prescriptions = EnhancedPrescription.objects.filter(
        end_date__lte=expiring_soon,
        status='active'
    ).select_related('client', 'drug')
    
    for prescription in prescriptions:
        # Send notification to patient about expiring prescription
        message = f"Your prescription for {prescription.drug.name} expires on {prescription.end_date}. Please consult your doctor for renewal."
        
        # This would send actual notification
        print(f"Prescription expiry notification: {message}")
    
    return f"Checked {prescriptions.count()} expiring prescriptions"

@shared_task
def inventory_alerts():
    """
    Send alerts for low stock and expired items
    """
    low_stock_items = InventoryService.check_low_stock_items()
    expired_items = InventoryService.check_expired_items()
    
    if low_stock_items.exists() or expired_items.exists():
        # Send email to pharmacy manager
        subject = "Pharmacy Inventory Alert"
        message = f"""
        Low Stock Items: {low_stock_items.count()}
        Expired Items: {expired_items.count()}
        
        Please check the pharmacy inventory management system for details.
        """
        
        # This would send actual email
        print(f"Inventory alert: {message}")
    
    return f"Low stock: {low_stock_items.count()}, Expired: {expired_items.count()}"

@shared_task
def process_payment_status_updates():
    """
    Process pending payment status updates
    """
    from .models import Payment
    
    pending_payments = Payment.objects.filter(
        status='pending',
        created_at__lt=timezone.now() - timedelta(minutes=30)
    )
    
    # In a real implementation, this would check with payment providers
    # For now, we'll just mark old pending payments as failed
    updated_count = pending_payments.update(status='failed')
    
    return f"Updated {updated_count} payment statuses"

@shared_task
def generate_daily_reports():
    """
    Generate daily system reports
    """
    today = timezone.now().date()
    
    # Count today's appointments
    appointments_today = Appointment.objects.filter(
        scheduled_date=today
    ).count()
    
    # Count today's payments
    from .models import Payment
    payments_today = Payment.objects.filter(
        payment_date__date=today,
        status='completed'
    ).count()
    
    # Count active prescriptions
    active_prescriptions = EnhancedPrescription.objects.filter(
        status='active'
    ).count()
    
    report = {
        'date': today.isoformat(),
        'appointments': appointments_today,
        'payments': payments_today,
        'active_prescriptions': active_prescriptions
    }
    
    return f"Daily report generated: {report}"
