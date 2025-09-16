"""
Enhanced API views for Health Hub System
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
import json

from .models import (
    Appointment, Drug, PharmacyInventory, EnhancedPrescription,
    Payment, PaymentMethod, TelemedicineSession, Client,
    HealthFacility, Department, StaffProfile, ShiftBooking,
    DoctorAvailability, SurgerySchedule, SurgeryType, OperatingRoom,
    VirtualPharmacist, PatientInsurance, MedicalHistory
)
from .services import (
    VirtualPharmacistService, PaymentService, AppointmentService, InventoryService
)
from .serializers import (
    AppointmentSerializer, DrugSerializer, PharmacyInventorySerializer,
    EnhancedPrescriptionSerializer, PaymentSerializer, HealthFacilitySerializer,
    DepartmentSerializer, StaffProfileSerializer, ShiftBookingSerializer,
    DoctorAvailabilitySerializer, SurgeryScheduleSerializer, SurgeryTypeSerializer,
    OperatingRoomSerializer, VirtualPharmacistSerializer, PatientInsuranceSerializer,
    MedicalHistorySerializer
)

# Appointment Management APIs
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointments_api(request):
    """
    List appointments or create new appointment
    """
    if request.method == 'GET':
        appointments = Appointment.objects.filter(
            doctor=request.user
        ).select_related('client', 'doctor').order_by('-scheduled_date', '-scheduled_time')
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        try:
            appointment = AppointmentService.schedule_appointment(
                client_id=request.data['client_id'],
                doctor_id=request.user.id,
                appointment_data=request.data
            )
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_slots(request, doctor_id, date):
    """
    Get available appointment slots for a doctor on a specific date
    """
    try:
        slots = AppointmentService.get_available_slots(doctor_id, date)
        return Response({'available_slots': slots})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, appointment_id):
    """
    Update appointment status
    """
    try:
        appointment = get_object_or_404(Appointment, id=appointment_id)
        appointment.status = request.data.get('status')
        appointment.notes = request.data.get('notes', appointment.notes)
        appointment.save()
        
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Virtual Pharmacist APIs
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_drug_interactions(request):
    """
    Check for drug interactions
    """
    try:
        drug_ids = request.data.get('drug_ids', [])
        result = VirtualPharmacistService.check_drug_interactions(drug_ids)
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_drug_recommendations(request):
    """
    Get drug recommendations based on symptoms
    """
    try:
        client_id = request.data.get('client_id')
        symptoms = request.data.get('symptoms', '')
        
        recommendations = VirtualPharmacistService.get_drug_recommendations(client_id, symptoms)
        return Response({'recommendations': recommendations})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_prescription(request):
    """
    Validate prescription safety
    """
    try:
        prescription_data = request.data
        safety_check = VirtualPharmacistService.check_prescription_safety(prescription_data)
        return Response(safety_check)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Pharmacy Inventory APIs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pharmacy_inventory(request):
    """
    Get pharmacy inventory with filters
    """
    inventory = PharmacyInventory.objects.filter(is_active=True).select_related('drug')
    
    # Apply filters
    if request.GET.get('low_stock'):
        inventory = inventory.filter(quantity_in_stock__lte=models.F('minimum_stock_level'))
    
    if request.GET.get('expired'):
        inventory = inventory.filter(expiry_date__lt=timezone.now().date())
    
    if request.GET.get('search'):
        search_term = request.GET.get('search')
        inventory = inventory.filter(drug__name__icontains=search_term)
    
    serializer = PharmacyInventorySerializer(inventory, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_inventory_stock(request, inventory_id):
    """
    Update inventory stock levels
    """
    try:
        quantity_change = request.data.get('quantity_change')
        operation = request.data.get('operation', 'subtract')
        
        success = InventoryService.update_stock(inventory_id, quantity_change, operation)
        
        if success:
            inventory = get_object_or_404(PharmacyInventory, id=inventory_id)
            serializer = PharmacyInventorySerializer(inventory)
            return Response(serializer.data)
        else:
            return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_alerts(request):
    """
    Get inventory alerts (low stock and expired items)
    """
    low_stock = InventoryService.check_low_stock_items()
    expired = InventoryService.check_expired_items()
    
    return Response({
        'low_stock_items': PharmacyInventorySerializer(low_stock, many=True).data,
        'expired_items': PharmacyInventorySerializer(expired, many=True).data,
        'low_stock_count': low_stock.count(),
        'expired_count': expired.count()
    })

# Enhanced Prescription APIs
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def enhanced_prescriptions(request):
    """
    List or create enhanced prescriptions
    """
    if request.method == 'GET':
        prescriptions = EnhancedPrescription.objects.filter(
            prescribed_by=request.user
        ).select_related('client', 'drug').order_by('-created_at')
        
        # Filter by client if specified
        client_id = request.GET.get('client_id')
        if client_id:
            prescriptions = prescriptions.filter(client_id=client_id)
        
        # Filter by status
        status_filter = request.GET.get('status')
        if status_filter:
            prescriptions = prescriptions.filter(status=status_filter)
        
        serializer = EnhancedPrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        try:
            # Check prescription safety first
            safety_check = VirtualPharmacistService.check_prescription_safety(request.data)
            
            prescription_data = request.data.copy()
            prescription_data['prescribed_by'] = request.user.id
            prescription_data['interaction_warnings'] = safety_check.get('warnings', [])
            
            serializer = EnhancedPrescriptionSerializer(data=prescription_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def dispense_prescription(request, prescription_id):
    """
    Mark prescription as dispensed and update inventory
    """
    try:
        prescription = get_object_or_404(EnhancedPrescription, id=prescription_id)
        
        if prescription.is_dispensed:
            return Response({'error': 'Prescription already dispensed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find inventory item with sufficient stock
        inventory_item = PharmacyInventory.objects.filter(
            drug=prescription.drug,
            quantity_in_stock__gte=prescription.quantity_prescribed,
            is_active=True
        ).first()
        
        if not inventory_item:
            return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update inventory
        success = InventoryService.update_stock(
            inventory_item.id, 
            prescription.quantity_prescribed, 
            'subtract'
        )
        
        if success:
            prescription.is_dispensed = True
            prescription.dispensed_date = timezone.now()
            prescription.dispensed_by = request.user
            prescription.save()
            
            serializer = EnhancedPrescriptionSerializer(prescription)
            return Response(serializer.data)
        else:
            return Response({'error': 'Failed to update inventory'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Payment APIs
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """
    Initiate payment process
    """
    try:
        client_id = request.data.get('client_id')
        amount = float(request.data.get('amount'))
        purpose = request.data.get('purpose')
        payment_method = request.data.get('payment_method')
        phone_number = request.data.get('phone_number')
        appointment_id = request.data.get('appointment_id')
        
        # Create payment record
        payment = PaymentService.create_payment_record(
            client_id, amount, purpose, payment_method, appointment_id
        )
        
        # Initiate payment based on method
        if payment_method == 'mpesa':
            result = PaymentService.initiate_mpesa_payment(
                phone_number, amount, payment.transaction_id
            )
        elif payment_method == 'airtel':
            result = PaymentService.initiate_airtel_payment(
                phone_number, amount, payment.transaction_id
            )
        else:
            return Response({'error': 'Unsupported payment method'}, status=status.HTTP_400_BAD_REQUEST)
        
        if result.get('success'):
            payment.external_transaction_id = result.get('transaction_id')
            payment.status = 'processing'
            payment.save()
            
            return Response({
                'payment_id': payment.id,
                'transaction_id': payment.transaction_id,
                'status': 'processing',
                'message': 'Payment initiated successfully'
            })
        else:
            payment.status = 'failed'
            payment.save()
            return Response({'error': 'Payment initiation failed'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_callback(request, provider):
    """
    Handle payment callbacks from providers
    """
    try:
        if provider == 'mpesa':
            # Handle M-Pesa callback
            callback_data = request.data
            transaction_id = callback_data.get('Body', {}).get('stkCallback', {}).get('MerchantRequestID')
            result_code = callback_data.get('Body', {}).get('stkCallback', {}).get('ResultCode')
            
            status_map = {'0': 'completed', '1': 'failed'}
            payment_status = status_map.get(str(result_code), 'failed')
            
        elif provider == 'airtel':
            # Handle Airtel callback
            callback_data = request.data
            transaction_id = callback_data.get('transaction_id')
            payment_status = callback_data.get('status', '').lower()
            
        else:
            return Response({'error': 'Unknown provider'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update payment status
        success = PaymentService.process_payment_callback(
            transaction_id, payment_status
        )
        
        if success:
            return Response({'message': 'Callback processed successfully'})
        else:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request, client_id):
    """
    Get payment history for a client
    """
    try:
        payments = Payment.objects.filter(
            client_id=client_id
        ).select_related('payment_method', 'appointment').order_by('-created_at')
        
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Drug Management APIs
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def drugs_api(request):
    """
    List drugs or add new drug
    """
    if request.method == 'GET':
        drugs = Drug.objects.all().order_by('name')
        
        # Search functionality
        search = request.GET.get('search')
        if search:
            drugs = drugs.filter(name__icontains=search)
        
        serializer = DrugSerializer(drugs, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = DrugSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Dashboard Analytics APIs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """
    Get dashboard analytics data
    """
    try:
        today = timezone.now().date()
        
        # Today's appointments
        todays_appointments = Appointment.objects.filter(
            scheduled_date=today,
            doctor=request.user
        ).count()
        
        # Pending prescriptions
        pending_prescriptions = EnhancedPrescription.objects.filter(
            prescribed_by=request.user,
            is_dispensed=False,
            status='active'
        ).count()
        
        # Low stock alerts
        low_stock_count = InventoryService.check_low_stock_items().count()
        
        # Recent payments
        recent_payments = Payment.objects.filter(
            created_at__date=today,
            status='completed'
        ).count()
        
        return Response({
            'todays_appointments': todays_appointments,
            'pending_prescriptions': pending_prescriptions,
            'low_stock_alerts': low_stock_count,
            'recent_payments': recent_payments,
            'date': today.isoformat()
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
