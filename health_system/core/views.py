
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import HealthProgram, Client, Enrollment, Prescription, Metric, Appointment
from .utils import filter_by_permission

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_program(request):
    if not request.user.is_doctor and not request.user.is_nurse:
        return Response({'error': 'Only medical staff can create programs'}, status=403)
    
    name = request.data.get('name')
    description = request.data.get('description', '')
    
    if not name:
        return Response({'error': 'Program name is required'}, status=400)
    
    program = HealthProgram.objects.create(
        name=name,
        description=description,
        created_by=request.user
    )
    
    return Response({
        'id': program.id,
        'name': program.name,
        'description': program.description,
        'created_by': program.created_by.username,
        'created_at': program.created_at
    }, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_client(request):
    required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender']
    for field in required_fields:
        if field not in request.data:
            return Response({'error': f'{field} is required'}, status=400)
    
    client = Client.objects.create(
        first_name=request.data['first_name'],
        last_name=request.data['last_name'],
        date_of_birth=request.data['date_of_birth'],
        gender=request.data['gender'],
        address=request.data.get('address', ''),
        phone_number=request.data.get('phone_number', ''),
        email=request.data.get('email', '')
    )
    
    return Response({
        'id': client.id,
        'full_name': str(client),
        'date_of_birth': client.date_of_birth,
        'gender': client.get_gender_display(),
        'address': client.address,
        'phone_number': client.phone_number,
        'email': client.email
    }, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_client(request):
    if not request.user.is_doctor and not request.user.is_nurse:
        return Response({'error': 'Only medical staff can enroll clients'}, status=403)
    
    client_id = request.data.get('client_id')
    program_name = request.data.get('program_name')
    
    if not client_id or not program_name:
        return Response({'error': 'client_id and program_name are required'}, status=400)
    
    client = get_object_or_404(Client, id=client_id)
    program = get_object_or_404(HealthProgram, name=program_name)
    
    enrollment, created = Enrollment.objects.get_or_create(
        client=client,
        program=program,
        defaults={'enrolled_by': request.user}
    )
    
    if not created:
        return Response({'error': 'Client is already enrolled in this program'}, status=400)
    
    return Response({
        'client': str(client),
        'program': str(program),
        'enrolled_by': request.user.username,
        'enrollment_date': enrollment.enrollment_date
    }, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_clients(request):
    query = request.GET.get('q', '')
    
    if not query:
        return Response({'error': 'Search query is required'}, status=400)
    
    clients = Client.objects.filter(
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query) |
        Q(phone_number__icontains=query) |
        Q(email__icontains=query)
    )
    
    results = [{
        'id': client.id,
        'full_name': str(client),
        'date_of_birth': client.date_of_birth,
        'gender': client.get_gender_display(),
        'phone_number': client.phone_number,
        'email': client.email
    } for client in clients]
    
    return Response(results)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_profile(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    
    enrollments = Enrollment.objects.filter(client=client, is_active=True)
    prescriptions = Prescription.objects.filter(client=client)
    metrics = Metric.objects.filter(client=client)
    appointments = Appointment.objects.filter(client=client)
    
    response_data = {
        'client': {
            'id': client.id,
            'first_name': client.first_name,
            'last_name': client.last_name,
            'date_of_birth': client.date_of_birth,
            'gender': client.get_gender_display(),
            'address': client.address,
            'phone_number': client.phone_number,
            'email': client.email
        },
        'enrollments': [{
            'program': enrollment.program.name,
            'enrolled_by': enrollment.enrolled_by.username if enrollment.enrolled_by else None,
            'enrollment_date': enrollment.enrollment_date,
            'is_active': enrollment.is_active
        } for enrollment in enrollments],
        'prescriptions': [{
            'medication_name': prescription.medication_name,
            'dosage': prescription.dosage,
            'frequency': prescription.frequency,
            'start_date': prescription.start_date,
            'end_date': prescription.end_date,
            'prescribed_by': prescription.prescribed_by.username if prescription.prescribed_by else None,
            'notes': prescription.notes,
            'created_at': prescription.created_at
        } for prescription in prescriptions],
        'metrics': [{
            'name': metric.name,
            'value': metric.value,
            'unit': metric.unit,
            'recorded_by': metric.recorded_by.username if metric.recorded_by else None,
            'recorded_at': metric.recorded_at
        } for metric in metrics],
        'appointments': [{
            'scheduled_with': appointment.scheduled_with.username,
            'scheduled_for': appointment.scheduled_for,
            'reason': appointment.reason,
            'status': appointment.status,
            'notes': appointment.notes,
            'created_at': appointment.created_at
        } for appointment in appointments]
    }
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    if not request.user.is_doctor:
        return Response({'error': 'Only doctors can create prescriptions'}, status=403)
    
    required_fields = ['client_id', 'medication_name', 'dosage', 'frequency', 'start_date']
    for field in required_fields:
        if field not in request.data:
            return Response({'error': f'{field} is required'}, status=400)
    
    client = get_object_or_404(Client, id=request.data['client_id'])
    
    prescription = Prescription.objects.create(
        client=client,
        prescribed_by=request.user,
        medication_name=request.data['medication_name'],
        dosage=request.data['dosage'],
        frequency=request.data['frequency'],
        start_date=request.data['start_date'],
        end_date=request.data.get('end_date'),
        notes=request.data.get('notes', '')
    )
    
    return Response({
        'id': prescription.id,
        'medication_name': prescription.medication_name,
        'client': str(client),
        'prescribed_by': request.user.username,
        'start_date': prescription.start_date
    }, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_metric(request):
    if not request.user.is_doctor and not request.user.is_nurse:
        return Response({'error': 'Only medical staff can record metrics'}, status=403)
    
    required_fields = ['client_id', 'name', 'value', 'unit']
    for field in required_fields:
        if field not in request.data:
            return Response({'error': f'{field} is required'}, status=400)
    
    client = get_object_or_404(Client, id=request.data['client_id'])
    
    metric = Metric.objects.create(
        client=client,
        recorded_by=request.user,
        name=request.data['name'],
        value=request.data['value'],
        unit=request.data['unit']
    )
    
    return Response({
        'id': metric.id,
        'name': metric.name,
        'value': metric.value,
        'unit': metric.unit,
        'client': str(client),
        'recorded_by': request.user.username,
        'recorded_at': metric.recorded_at
    }, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    required_fields = ['client_id', 'scheduled_with_id', 'scheduled_for']
    for field in required_fields:
        if field not in request.data:
            return Response({'error': f'{field} is required'}, status=400)
    
    client = get_object_or_404(Client, id=request.data['client_id'])
    scheduled_with = get_object_or_404(User, id=request.data['scheduled_with_id'])
    
    appointment = Appointment.objects.create(
        client=client,
        scheduled_with=scheduled_with,
        scheduled_for=request.data['scheduled_for'],
        reason=request.data.get('reason', ''),
        status=request.data.get('status', 'Scheduled'),
        notes=request.data.get('notes', '')
    )
    
    return Response({
        'id': appointment.id,
        'client': str(client),
        'scheduled_with': scheduled_with.username,
        'scheduled_for': appointment.scheduled_for,
        'status': appointment.status
    }, status=201)