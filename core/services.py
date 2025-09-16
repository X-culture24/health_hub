"""
Services for Health Hub System
Contains business logic for virtual pharmacist, payments, and other features
"""
import uuid
import json
import requests
from typing import List, Dict, Any
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Drug, EnhancedPrescription, PharmacyInventory, 
    Payment, PaymentMethod, Client, Appointment
)

class VirtualPharmacistService:
    """
    AI-powered virtual pharmacist for drug interaction checking and recommendations
    """
    
    @staticmethod
    def check_drug_interactions(drug_ids: List[int]) -> Dict[str, Any]:
        """
        Check for drug interactions between multiple drugs
        """
        interactions = []
        warnings = []
        
        drugs = Drug.objects.filter(id__in=drug_ids)
        
        for i, drug1 in enumerate(drugs):
            for drug2 in drugs[i+1:]:
                # Check if drug1 interacts with drug2
                if drug2.id in drug1.drug_interactions:
                    interaction = {
                        'drug1': drug1.name,
                        'drug2': drug2.name,
                        'severity': 'moderate',  # This would come from a drug database
                        'description': f'Potential interaction between {drug1.name} and {drug2.name}',
                        'recommendation': 'Monitor patient closely for adverse effects'
                    }
                    interactions.append(interaction)
        
        return {
            'has_interactions': len(interactions) > 0,
            'interactions': interactions,
            'warnings': warnings,
            'total_drugs_checked': len(drugs)
        }
    
    @staticmethod
    def get_drug_recommendations(client_id: int, symptoms: str) -> List[Dict[str, Any]]:
        """
        Get drug recommendations based on client history and symptoms
        """
        client = Client.objects.get(id=client_id)
        
        # Get client's prescription history
        recent_prescriptions = EnhancedPrescription.objects.filter(
            client=client,
            created_at__gte=timezone.now() - timedelta(days=90)
        ).select_related('drug')
        
        # Simple recommendation logic (in production, this would use ML/AI)
        recommendations = []
        
        # Check for common symptoms and suggest OTC medications
        symptom_keywords = symptoms.lower().split()
        
        if any(word in symptom_keywords for word in ['headache', 'pain', 'ache']):
            recommendations.append({
                'drug_name': 'Paracetamol',
                'reason': 'For pain relief',
                'dosage': '500mg every 6 hours',
                'max_daily_dose': '4000mg',
                'requires_prescription': False
            })
        
        if any(word in symptom_keywords for word in ['fever', 'temperature']):
            recommendations.append({
                'drug_name': 'Ibuprofen',
                'reason': 'For fever reduction',
                'dosage': '400mg every 8 hours',
                'max_daily_dose': '1200mg',
                'requires_prescription': False
            })
        
        return recommendations
    
    @staticmethod
    def check_prescription_safety(prescription_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check prescription safety including dosage, interactions, and contraindications
        """
        drug = Drug.objects.get(id=prescription_data['drug_id'])
        client = Client.objects.get(id=prescription_data['client_id'])
        
        safety_checks = {
            'is_safe': True,
            'warnings': [],
            'contraindications': [],
            'dosage_check': 'normal'
        }
        
        # Check existing prescriptions for interactions
        active_prescriptions = EnhancedPrescription.objects.filter(
            client=client,
            status='active'
        ).exclude(drug=drug)
        
        if active_prescriptions.exists():
            drug_ids = [p.drug.id for p in active_prescriptions] + [drug.id]
            interaction_check = VirtualPharmacistService.check_drug_interactions(drug_ids)
            
            if interaction_check['has_interactions']:
                safety_checks['is_safe'] = False
                safety_checks['warnings'].extend([
                    f"Drug interaction: {interaction['description']}" 
                    for interaction in interaction_check['interactions']
                ])
        
        return safety_checks

class PaymentService:
    """
    Handle various payment methods including M-Pesa and Airtel Money
    """
    
    @staticmethod
    def initiate_mpesa_payment(phone_number: str, amount: float, reference: str) -> Dict[str, Any]:
        """
        Initiate M-Pesa STK Push payment
        """
        # This would integrate with actual M-Pesa API
        # For now, return a mock response
        
        transaction_id = f"MP{uuid.uuid4().hex[:10].upper()}"
        
        # Mock API call to M-Pesa
        response = {
            'success': True,
            'transaction_id': transaction_id,
            'checkout_request_id': f"ws_CO_{uuid.uuid4().hex[:10]}",
            'response_code': '0',
            'response_description': 'Success. Request accepted for processing',
            'customer_message': 'Success. Request accepted for processing'
        }
        
        return response
    
    @staticmethod
    def initiate_airtel_payment(phone_number: str, amount: float, reference: str) -> Dict[str, Any]:
        """
        Initiate Airtel Money payment
        """
        transaction_id = f"AM{uuid.uuid4().hex[:10].upper()}"
        
        # Mock Airtel Money API response
        response = {
            'success': True,
            'transaction_id': transaction_id,
            'status': 'PENDING',
            'message': 'Payment request sent to customer'
        }
        
        return response
    
    @staticmethod
    def create_payment_record(client_id: int, amount: float, purpose: str, 
                            payment_method: str, appointment_id: int = None) -> Payment:
        """
        Create a payment record in the database
        """
        client = Client.objects.get(id=client_id)
        payment_method_obj = PaymentMethod.objects.get(name=payment_method)
        
        appointment = None
        if appointment_id:
            appointment = Appointment.objects.get(id=appointment_id)
        
        transaction_id = f"TXN{uuid.uuid4().hex[:12].upper()}"
        
        payment = Payment.objects.create(
            client=client,
            appointment=appointment,
            payment_method=payment_method_obj,
            amount=amount,
            purpose=purpose,
            transaction_id=transaction_id,
            status='pending'
        )
        
        return payment
    
    @staticmethod
    def process_payment_callback(transaction_id: str, status: str, 
                               external_transaction_id: str = None) -> bool:
        """
        Process payment callback from payment providers
        """
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
            payment.status = status.lower()
            payment.external_transaction_id = external_transaction_id
            
            if status.lower() == 'completed':
                payment.payment_date = timezone.now()
            
            payment.save()
            return True
        except Payment.DoesNotExist:
            return False

class AppointmentService:
    """
    Enhanced appointment scheduling and management
    """
    
    @staticmethod
    def get_available_slots(doctor_id: int, date: str, duration_minutes: int = 30) -> List[str]:
        """
        Get available appointment slots for a doctor on a specific date
        """
        from datetime import datetime, time
        
        target_date = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Define working hours (9 AM to 5 PM)
        start_time = time(9, 0)
        end_time = time(17, 0)
        
        # Get existing appointments for the doctor on this date
        existing_appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            scheduled_date=target_date,
            status__in=['scheduled', 'confirmed', 'in_progress']
        ).values_list('scheduled_time', flat=True)
        
        # Generate available slots
        available_slots = []
        current_time = start_time
        
        while current_time < end_time:
            if current_time not in existing_appointments:
                available_slots.append(current_time.strftime('%H:%M'))
            
            # Move to next slot
            current_datetime = datetime.combine(target_date, current_time)
            next_datetime = current_datetime + timedelta(minutes=duration_minutes)
            current_time = next_datetime.time()
        
        return available_slots
    
    @staticmethod
    def schedule_appointment(client_id: int, doctor_id: int, appointment_data: Dict[str, Any]) -> Appointment:
        """
        Schedule a new appointment
        """
        client = Client.objects.get(id=client_id)
        doctor = User.objects.get(id=doctor_id)
        
        appointment = Appointment.objects.create(
            client=client,
            doctor=doctor,
            appointment_type=appointment_data['appointment_type'],
            scheduled_date=appointment_data['scheduled_date'],
            scheduled_time=appointment_data['scheduled_time'],
            duration_minutes=appointment_data.get('duration_minutes', 30),
            reason=appointment_data['reason'],
            is_telemedicine=appointment_data.get('is_telemedicine', False)
        )
        
        # Generate meeting link for telemedicine appointments
        if appointment.is_telemedicine:
            meeting_link = f"https://meet.healthhub.com/session/{uuid.uuid4().hex[:12]}"
            appointment.meeting_link = meeting_link
            appointment.save()
        
        return appointment
    
    @staticmethod
    def send_appointment_reminder(appointment_id: int) -> bool:
        """
        Send appointment reminder to client
        """
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # This would integrate with SMS/Email service
            message = f"Reminder: You have an appointment with Dr. {appointment.doctor.username} on {appointment.scheduled_date} at {appointment.scheduled_time}"
            
            # Mock sending reminder
            print(f"Sending reminder to {appointment.client.phone_number}: {message}")
            
            appointment.reminder_sent = True
            appointment.save()
            
            return True
        except Appointment.DoesNotExist:
            return False

class InventoryService:
    """
    Pharmacy inventory management
    """
    
    @staticmethod
    def check_low_stock_items() -> List[PharmacyInventory]:
        """
        Get list of items with low stock
        """
        return PharmacyInventory.objects.filter(
            quantity_in_stock__lte=models.F('minimum_stock_level'),
            is_active=True
        ).select_related('drug')
    
    @staticmethod
    def check_expired_items() -> List[PharmacyInventory]:
        """
        Get list of expired items
        """
        return PharmacyInventory.objects.filter(
            expiry_date__lt=timezone.now().date(),
            is_active=True
        ).select_related('drug')
    
    @staticmethod
    def update_stock(inventory_id: int, quantity_change: int, operation: str = 'subtract') -> bool:
        """
        Update stock quantity (for dispensing or restocking)
        """
        try:
            inventory = PharmacyInventory.objects.get(id=inventory_id)
            
            if operation == 'subtract':
                if inventory.quantity_in_stock >= quantity_change:
                    inventory.quantity_in_stock -= quantity_change
                else:
                    return False  # Insufficient stock
            else:  # add
                inventory.quantity_in_stock += quantity_change
            
            inventory.save()
            return True
        except PharmacyInventory.DoesNotExist:
            return False
