from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import User, HealthProgram, Client, Enrollment, Prescription, Metric, Appointment, UserSettings, UserProfile
from .utils import filter_by_permission
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .serializers import ClientSerializer, UserProfileSerializer

@swagger_auto_schema(
    method='post',
    operation_description="Create a new health program",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['name'],
        properties={
            'name': openapi.Schema(type=openapi.TYPE_STRING, description='Program name'),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description='Program description'),
        },
    ),
    responses={201: "Program created successfully", 400: "Invalid input"}
)
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

@swagger_auto_schema(
    method='post',
    operation_description="Register a new client",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['first_name', 'last_name', 'date_of_birth', 'gender'],
        properties={
            'first_name': openapi.Schema(type=openapi.TYPE_STRING),
            'last_name': openapi.Schema(type=openapi.TYPE_STRING),
            'date_of_birth': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
            'gender': openapi.Schema(type=openapi.TYPE_STRING, enum=['M', 'F', 'O']),
            'address': openapi.Schema(type=openapi.TYPE_STRING),
            'phone_number': openapi.Schema(type=openapi.TYPE_STRING),
            'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
        },
    ),
    responses={201: "Client registered successfully", 400: "Invalid input"}
)
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

@swagger_auto_schema(
    method='get',
    operation_description="Search for clients",
    manual_parameters=[
        openapi.Parameter('q', openapi.IN_QUERY, description="Search query", type=openapi.TYPE_STRING),
    ],
    responses={200: "List of matching clients", 400: "Invalid search query"}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_clients(request):
    """
    Search clients by name
    """
    search_query = request.GET.get('q', '').strip()
    
    if not search_query or len(search_query) < 2:
        return Response([], status=status.HTTP_200_OK)
    
    try:
        # Split search query into words for more flexible matching
        search_terms = search_query.split()
        
        # Start with all clients
        clients = Client.objects.all()
        
        # Filter by each search term
        for term in search_terms:
            clients = clients.filter(
                Q(first_name__icontains=term) | 
                Q(last_name__icontains=term) |
                Q(id__icontains=term)
            )
        
        # Serialize the results
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to search clients'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@method_decorator(cache_page(60 * 15), name='dispatch')  # Cache for 15 minutes
@method_decorator(vary_on_cookie, name='dispatch')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_profile(request, client_id):
    cache_key = f'client_profile_{client_id}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    client = get_object_or_404(Client, id=client_id)
    # Rate limiting check
    rate_limit_key = f'rate_limit_{request.user.id}'
    current_count = cache.get(rate_limit_key, 0)
    
    if current_count >= 100:  # 100 requests per hour
        return Response(
            {'error': 'Rate limit exceeded. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    cache.set(rate_limit_key, current_count + 1, 3600)  # Reset after 1 hour
    
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
        } for enrollment in client.enrollments.all()],
        'prescriptions': [{
            'medication_name': prescription.medication_name,
            'dosage': prescription.dosage,
            'frequency': prescription.frequency,
            'start_date': prescription.start_date,
            'end_date': prescription.end_date,
            'prescribed_by': prescription.prescribed_by.username if prescription.prescribed_by else None,
            'notes': prescription.notes,
            'created_at': prescription.created_at
        } for prescription in client.prescriptions.all()],
        'metrics': [{
            'name': metric.name,
            'value': metric.value,
            'unit': metric.unit,
            'recorded_by': metric.recorded_by.username if metric.recorded_by else None,
            'recorded_at': metric.recorded_at
        } for metric in client.metrics.all()],
        'appointments': [{
            'scheduled_with': appointment.scheduled_with.username,
            'scheduled_for': appointment.scheduled_for,
            'reason': appointment.reason,
            'status': appointment.status,
            'notes': appointment.notes,
            'created_at': appointment.created_at
        } for appointment in client.appointments.all()]
    }
    
    cache.set(cache_key, response_data, 60 * 15)  # Cache for 15 minutes
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
    
    # Verify that scheduled_with is a medical staff member
    if not scheduled_with.is_doctor and not scheduled_with.is_nurse:
        return Response({'error': 'Appointments can only be scheduled with medical staff'}, status=400)
    
    appointment = Appointment.objects.create(
        client=client,
        scheduled_with=scheduled_with,
        scheduled_for=request.data['scheduled_for'],
        reason=request.data.get('reason', ''),
        notes=request.data.get('notes', '')
    )
    
    return Response({
        'id': appointment.id,
        'client': str(client),
        'scheduled_with': scheduled_with.username,
        'scheduled_for': appointment.scheduled_for,
        'reason': appointment.reason,
        'status': appointment.status,
        'created_at': appointment.created_at
    }, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    report_type = request.GET.get('type')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if not report_type:
        return Response({'error': 'Report type is required'}, status=400)
    
    # Base query for date range
    date_filter = {}
    if start_date and end_date:
        date_filter = {
            'created_at__range': [start_date, end_date]
        }
    
    if report_type == 'client_attendance':
        appointments = Appointment.objects.filter(**date_filter)
        data = {
            'total_appointments': appointments.count(),
            'completed_appointments': appointments.filter(status='Completed').count(),
            'cancelled_appointments': appointments.filter(status='Cancelled').count(),
            'no_shows': appointments.filter(status='No Show').count(),
        }
    
    elif report_type == 'program_enrollment':
        enrollments = Enrollment.objects.filter(**date_filter)
        data = {
            'total_enrollments': enrollments.count(),
            'active_enrollments': enrollments.filter(is_active=True).count(),
            'completed_enrollments': enrollments.filter(is_active=False).count(),
            'program_breakdown': [
                {
                    'program': program.name,
                    'count': enrollments.filter(program=program).count()
                }
                for program in HealthProgram.objects.all()
            ]
        }
    
    elif report_type == 'prescription_usage':
        prescriptions = Prescription.objects.filter(**date_filter)
        data = {
            'total_prescriptions': prescriptions.count(),
            'active_prescriptions': prescriptions.filter(end_date__isnull=True).count(),
            'completed_prescriptions': prescriptions.filter(end_date__isnull=False).count(),
            'medication_breakdown': [
                {
                    'medication': med,
                    'count': prescriptions.filter(medication_name=med).count()
                }
                for med in prescriptions.values_list('medication_name', flat=True).distinct()
            ]
        }
    
    elif report_type == 'revenue_analysis':
        # Assuming we have a Payment model
        payments = Payment.objects.filter(**date_filter)
        data = {
            'total_revenue': sum(p.amount for p in payments),
            'revenue_by_program': [
                {
                    'program': program.name,
                    'revenue': sum(p.amount for p in payments.filter(program=program))
                }
                for program in HealthProgram.objects.all()
            ],
            'revenue_by_month': [
                {
                    'month': month,
                    'revenue': sum(p.amount for p in payments.filter(created_at__month=month))
                }
                for month in range(1, 13)
            ]
        }
    
    elif report_type == 'staff_performance':
        staff = User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True))
        data = {
            'staff_metrics': [
                {
                    'staff_member': user.username,
                    'appointments': Appointment.objects.filter(scheduled_with=user, **date_filter).count(),
                    'prescriptions': Prescription.objects.filter(prescribed_by=user, **date_filter).count(),
                    'metrics_recorded': Metric.objects.filter(recorded_by=user, **date_filter).count(),
                }
                for user in staff
            ]
        }
    
    else:
        return Response({'error': 'Invalid report type'}, status=400)
    
    return Response(data)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    if request.method == 'GET':
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        return Response({
            'notifications': settings.notifications,
            'email_alerts': settings.email_alerts,
            'dark_mode': settings.dark_mode,
            'language': settings.language,
            'timezone': settings.timezone,
            'date_format': settings.date_format,
        })
    
    elif request.method == 'PUT':
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        allowed_fields = ['notifications', 'email_alerts', 'dark_mode', 'language', 'timezone', 'date_format']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(settings, field, request.data[field])
        
        settings.save()
        return Response({'message': 'Settings updated successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not all([current_password, new_password, confirm_password]):
        return Response({'error': 'All password fields are required'}, status=400)
    
    if new_password != confirm_password:
        return Response({'error': 'New passwords do not match'}, status=400)
    
    if not request.user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, status=400)
    
    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Password updated successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def program_metrics(request):
    programs = HealthProgram.objects.all()
    data = []
    
    for program in programs:
        enrollments = Enrollment.objects.filter(program=program)
        metrics = Metric.objects.filter(client__enrollment__program=program)
        
        program_data = {
            'program': program.name,
            'total_enrollments': enrollments.count(),
            'active_enrollments': enrollments.filter(is_active=True).count(),
            'completion_rate': (enrollments.filter(is_active=False).count() / enrollments.count() * 100) if enrollments.count() > 0 else 0,
            'average_metrics': {
                metric_name: metrics.filter(name=metric_name).aggregate(Avg('value'))['value__avg']
                for metric_name in metrics.values_list('name', flat=True).distinct()
            }
        }
        data.append(program_data)
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resource_utilization(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    date_filter = {}
    if start_date and end_date:
        date_filter = {
            'created_at__range': [start_date, end_date]
        }
    
    appointments = Appointment.objects.filter(**date_filter)
    enrollments = Enrollment.objects.filter(**date_filter)
    
    data = {
        'appointment_utilization': {
            'total_slots': appointments.count(),
            'utilized_slots': appointments.filter(status='Completed').count(),
            'utilization_rate': (appointments.filter(status='Completed').count() / appointments.count() * 100) if appointments.count() > 0 else 0,
        },
        'program_utilization': {
            'total_capacity': sum(program.max_participants for program in HealthProgram.objects.all()),
            'current_enrollments': enrollments.filter(is_active=True).count(),
            'utilization_rate': (enrollments.filter(is_active=True).count() / sum(program.max_participants for program in HealthProgram.objects.all()) * 100) if HealthProgram.objects.exists() else 0,
        },
        'staff_utilization': {
            'total_staff': User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True)).count(),
            'active_staff': User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True), is_active=True).count(),
            'utilization_rate': (User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True), is_active=True).count() / User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True)).count() * 100) if User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True)).exists() else 0,
        }
    }
    
    return Response(data)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'is_doctor': getattr(user, 'is_doctor', False),
            'is_nurse': getattr(user, 'is_nurse', False)
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Simplified user registration
    """
    try:
        data = request.data
        required_fields = ['username', 'password']
        
        # Check only username and password
        if not all(data.get(field) for field in required_fields):
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create basic user
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data.get('email', ''),
        )
        
        # Create profile with minimal info
        profile = UserProfile.objects.create(
            user=user,
            work_email=data.get('work_email', ''),
            employer_id=data.get('employer_id', ''),
            is_doctor=data.get('is_doctor', False),
            is_nurse=data.get('is_nurse', False)
        )
        
        # Generate token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'is_doctor': profile.is_doctor,
                'is_nurse': profile.is_nurse
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    GET: Retrieve the user's profile
    PUT: Update the user's profile
    """
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_medical_staff(request):
    """
    Retrieve a list of all medical staff (doctors and nurses)
    """
    medical_staff = UserProfile.objects.filter(
        is_doctor=True) | UserProfile.objects.filter(is_nurse=True
    )
    serializer = UserProfileSerializer(medical_staff, many=True)
    return Response(serializer.data)