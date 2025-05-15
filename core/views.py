from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from .models import User, HealthProgram, Client, Enrollment, Prescription, Metric, UserProfile, Encounter
from django.contrib.auth import get_user_model
from .utils import filter_by_permission
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from dateutil.parser import parse
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
import datetime

# Change the notification URL to localhost
NOTIFICATION_URL = "http://localhost:8000/api/webhook/"  # Local endpoint for testing

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
    Register a new user
    """
    try:
        data = request.data
        required_fields = ['username', 'password', 'employer_id', 'work_email']
        
        # Check required fields
        if not all(data.get(field) for field in required_fields):
            return Response({
                'error': f'Required fields: {", ".join(required_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate role selection
        if not data.get('is_doctor') and not data.get('is_nurse'):
            return Response({
                'error': 'Please select at least one role (Doctor or Nurse)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate email format
        try:
            validate_email(data['work_email'])
        except ValidationError:
            return Response({
                'error': 'Invalid work email format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username already exists
        if User.objects.filter(username=data['username']).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if work_email already exists
        if User.objects.filter(work_email=data['work_email']).exists():
            return Response({
                'error': 'Work email already registered'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if employer_id already exists
        if User.objects.filter(employer_id=data['employer_id']).exists():
            return Response({
                'error': 'Employer ID already registered'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            employer_id=data['employer_id'],
            work_email=data['work_email']
        )
        
        # Set doctor/nurse status
        user.is_doctor = data.get('is_doctor', False)
        user.is_nurse = data.get('is_nurse', False)
        user.save()
        
        # Generate token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'work_email': user.work_email,
                'is_doctor': user.is_doctor,
                'is_nurse': user.is_nurse
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
    # Ensure UserProfile exists for the user
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        from .serializers import UserProfileSerializer
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        from .serializers import UserProfileSerializer
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        
        # Prepare the response data
        client_data = [{
            'id': client.id,
            'first_name': client.first_name,
            'last_name': client.last_name,
            'date_of_birth': client.date_of_birth,
            'gender': client.get_gender_display(),
            'email': client.email,
            'phone_number': client.phone_number
        } for client in clients]
        
        return Response(client_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to search clients'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_list(request):
    clients = Client.objects.all()
    client_data = [{
        'id': client.id,
        'first_name': client.first_name,
        'last_name': client.last_name,
        'date_of_birth': client.date_of_birth,
        'gender': client.get_gender_display(),
        'email': client.email,
        'phone_number': client.phone_number
    } for client in clients]
    return Response(client_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_detail(request, pk):
    client = get_object_or_404(Client, pk=pk)
    return Response({
        'id': client.id,
        'first_name': client.first_name,
        'last_name': client.last_name,
        'date_of_birth': client.date_of_birth,
        'gender': client.get_gender_display(),
        'email': client.email,
        'phone_number': client.phone_number,
        'address': client.address
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_client(request):
    try:
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
            'message': 'Client registered successfully'
        }, status=status.HTTP_201_CREATED)
    except KeyError as e:
        return Response({
            'error': f'Missing required field: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@cache_page(60 * 15)  # Cache for 15 minutes
@vary_on_cookie
def client_profile(request, client_id):
    cache_key = f'client_profile_{client_id}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    client = get_object_or_404(Client, id=client_id)
    
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
            'notes': prescription.notes
        } for prescription in client.prescriptions.all()],
        'metrics': [{
            'name': metric.name,
            'value': metric.value,
            'unit': metric.unit,
            'recorded_by': metric.recorded_by.username if metric.recorded_by else None,
            'recorded_at': metric.recorded_at
        } for metric in client.metrics.all()]
    }
    
    cache.set(cache_key, response_data, 60 * 15)  # Cache for 15 minutes
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_program(request):
    if not request.user.is_doctor and not request.user.is_nurse:
        return Response({
            'error': 'Only medical staff can create programs'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        name = request.data.get('name')
        if not name:
            return Response({
                'error': 'Program name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if program with same name exists
        if HealthProgram.objects.filter(name=name).exists():
            return Response({
                'error': 'A program with this name already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        program = HealthProgram.objects.create(
            name=name,
            description=request.data.get('description', ''),
            created_by=request.user
        )
        
        return Response({
            'id': program.id,
            'name': program.name,
            'description': program.description,
            'created_by': program.created_by.username,
            'created_at': program.created_at
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def program_detail(request, pk):
    program = get_object_or_404(HealthProgram, pk=pk)
    return Response({
        'id': program.id,
        'name': program.name,
        'description': program.description,
        'created_by': program.created_by.username if program.created_by else None,
        'created_at': program.created_at
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_client(request):
    if not request.user.is_doctor and not request.user.is_nurse:
        return Response({'error': 'Only medical staff can enroll clients'}, status=403)
    
    client_id = request.data.get('client_id')
    program_id = request.data.get('program_id')
    
    if not client_id or not program_id:
        return Response({'error': 'client_id and program_id are required'}, status=400)
    
    client = get_object_or_404(Client, id=client_id)
    program = get_object_or_404(HealthProgram, id=program_id)
    
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
def enrollment_list(request):
    enrollments = Enrollment.objects.all()
    enrollment_data = [{
        'id': enrollment.id,
        'client': f"{enrollment.client.first_name} {enrollment.client.last_name}",
        'program': enrollment.program.name,
        'enrolled_by': enrollment.enrolled_by.username if enrollment.enrolled_by else None,
        'enrollment_date': enrollment.enrollment_date,
        'is_active': enrollment.is_active
    } for enrollment in enrollments]
    return Response(enrollment_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrollment_detail(request, pk):
    enrollment = get_object_or_404(Enrollment, pk=pk)
    return Response({
        'id': enrollment.id,
        'client': f"{enrollment.client.first_name} {enrollment.client.last_name}",
        'program': enrollment.program.name,
        'enrolled_by': enrollment.enrolled_by.username if enrollment.enrolled_by else None,
        'enrollment_date': enrollment.enrollment_date,
        'is_active': enrollment.is_active
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not all([current_password, new_password, confirm_password]):
        return Response({
            'error': 'All password fields are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({
            'error': 'New passwords do not match'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.user.check_password(current_password):
        return Response({
            'error': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Password updated successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    report_type = request.GET.get('type')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if not report_type:
        return Response({
            'error': 'Report type is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Base query for date range
    date_filter = {}
    if start_date and end_date:
        date_filter = {
            'enrollment_date__range': [start_date, end_date]
        }
    
    if report_type == 'program_enrollment':
        enrollments = Enrollment.objects.filter(**date_filter)
        
        # Create the PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        # Add title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 750, "Program Enrollment Report")
        p.setFont("Helvetica", 12)
        p.drawString(50, 730, f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        p.drawString(50, 710, f"Period: {start_date} to {end_date}")
        
        # Add summary
        y = 670
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Summary")
        p.setFont("Helvetica", 12)
        y -= 25
        p.drawString(70, y, f"Total Enrollments: {enrollments.count()}")
        y -= 20
        p.drawString(70, y, f"Active Enrollments: {enrollments.filter(is_active=True).count()}")
        y -= 20
        p.drawString(70, y, f"Completed Enrollments: {enrollments.filter(is_active=False).count()}")
        
        # Add program breakdown
        y -= 40
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Program Breakdown")
        p.setFont("Helvetica", 12)
        
        for program in HealthProgram.objects.all():
            y -= 25
            program_enrollments = enrollments.filter(program=program)
            p.drawString(70, y, f"{program.name}:")
            p.drawString(250, y, f"Total: {program_enrollments.count()}")
            p.drawString(350, y, f"Active: {program_enrollments.filter(is_active=True).count()}")
        
        p.showPage()
        p.save()
        
        # Get the value of the buffer
        pdf = buffer.getvalue()
        buffer.close()
        
        # Create the HTTP response
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="enrollment_report.pdf"'
        response.write(pdf)
        
        return response
    else:
        return Response({
            'error': 'Invalid report type'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    if not request.user.is_doctor:
        return Response({
            'error': 'Only doctors can create prescriptions'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
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
            'client': f"{client.first_name} {client.last_name}",
            'medication_name': prescription.medication_name,
            'prescribed_by': request.user.username,
            'start_date': prescription.start_date
        }, status=status.HTTP_201_CREATED)
    except KeyError as e:
        return Response({
            'error': f'Missing required field: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def prescription_list(request):
    """
    Get a list of all prescriptions, filtered by user permissions.
    Doctors and nurses can see all prescriptions.
    Regular users can only see prescriptions they wrote.
    """
    try:
        # Get prescriptions based on user permissions
        prescriptions = filter_by_permission(Prescription.objects.all(), request.user)
        
        # Prepare the response data
        prescription_data = [{
            'id': prescription.id,
            'client': {
                'id': prescription.client.id,
                'first_name': prescription.client.first_name,
                'last_name': prescription.client.last_name,
                'name': f"{prescription.client.first_name} {prescription.client.last_name}"
            },
            'medication_name': prescription.medication_name,
            'dosage': prescription.dosage,
            'frequency': prescription.frequency,
            'start_date': prescription.start_date,
            'end_date': prescription.end_date,
            'notes': prescription.notes,
            'prescribed_by': prescription.prescribed_by.username if prescription.prescribed_by else None,
            'created_at': prescription.created_at
        } for prescription in prescriptions]
        
        return Response(prescription_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_metric(request):
    if not request.user.is_doctor and not request.user.is_nurse:
        return Response({
            'error': 'Only medical staff can record metrics'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        client = get_object_or_404(Client, id=request.data.get('client_id'))
        name = request.data.get('name')
        value = request.data.get('value')
        unit = request.data.get('unit')
        
        if not all([client, name, value, unit]):
            return Response({
                'error': 'client_id, name, value, and unit are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle blood pressure values like "120/80"
        if isinstance(value, str) and '/' in value:
            systolic, diastolic = value.split('/')
            try:
                value = float(systolic)  # Store systolic value
                unit = f"{unit} (systolic/diastolic: {value}/{diastolic})"
            except ValueError:
                return Response({
                    'error': 'Invalid blood pressure value format'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                value = float(value)
            except (ValueError, TypeError):
                return Response({
                    'error': 'Value must be a number'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        metric = Metric.objects.create(
            client=client,
            recorded_by=request.user,
            name=name,
            value=value,
            unit=unit
        )
        
        return Response({
            'id': metric.id,
            'name': metric.name,
            'value': metric.value,
            'unit': metric.unit,
            'client': str(client),
            'recorded_by': request.user.username,
            'recorded_at': metric.recorded_at
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metric_list(request):
    metrics = Metric.objects.all()
    metric_data = [{
        'id': metric.id,
        'client': f"{metric.client.first_name} {metric.client.last_name}",
        'name': metric.name,
        'value': metric.value,
        'unit': metric.unit,
        'recorded_by': metric.recorded_by.username if metric.recorded_by else None,
        'recorded_at': metric.recorded_at
    } for metric in metrics]
    return Response(metric_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metric_detail(request, pk):
    metric = get_object_or_404(Metric, pk=pk)
    return Response({
        'id': metric.id,
        'client': f"{metric.client.first_name} {metric.client.last_name}",
        'name': metric.name,
        'value': metric.value,
        'unit': metric.unit,
        'recorded_by': metric.recorded_by.username if metric.recorded_by else None,
        'recorded_at': metric.recorded_at
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def program_metrics(request):
    programs = HealthProgram.objects.all()
    data = []
    
    for program in programs:
        enrollments = program.enrollment_set.all()
        active_enrollments = enrollments.filter(is_active=True)
        completed_enrollments = enrollments.filter(is_active=False)
        
        program_data = {
            'program': program.name,
            'total_enrollments': enrollments.count(),
            'active_enrollments': active_enrollments.count(),
            'completed_enrollments': completed_enrollments.count(),
            'completion_rate': (completed_enrollments.count() / enrollments.count() * 100) if enrollments.exists() else 0
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
            'utilization_rate': (appointments.filter(status='Completed').count() / appointments.count() * 100) if appointments.exists() else 0
        },
        'staff_utilization': {
            'total_staff': User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True)).count(),
            'active_staff': User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True), is_active=True).count(),
            'utilization_rate': (User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True), is_active=True).count() / User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True)).count() * 100) if User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True)).exists() else 0
        }
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_comprehensive_info(request, client_id):
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=404)

    # Get all enrollments for the client
    enrollments = Enrollment.objects.filter(client=client, is_active=True)
    enrollments_data = [{
        'id': enrollment.id,
        'program': {
            'id': enrollment.program.id,
            'name': enrollment.program.name,
            'description': enrollment.program.description
        },
        'enrolled_by': enrollment.enrolled_by.username if enrollment.enrolled_by else None,
        'enrollment_date': enrollment.enrollment_date,
        'is_active': enrollment.is_active
    } for enrollment in enrollments]

    # Get all prescriptions for the client
    prescriptions = Prescription.objects.filter(client=client)
    prescriptions_data = [{
        'id': prescription.id,
        'medication_name': prescription.medication_name,
        'dosage': prescription.dosage,
        'frequency': prescription.frequency,
        'start_date': prescription.start_date,
        'end_date': prescription.end_date,
        'notes': prescription.notes,
        'prescribed_by': prescription.prescribed_by.username if prescription.prescribed_by else None,
        'created_at': prescription.created_at
    } for prescription in prescriptions]

    # Compile all the data
    response_data = {
        'client': {
            'id': client.id,
            'first_name': client.first_name,
            'last_name': client.last_name,
            'date_of_birth': client.date_of_birth,
            'gender': client.gender,
            'address': client.address,
            'phone_number': client.phone_number,
            'email': client.email,
            'created_at': client.created_at
        },
        'enrollments': enrollments_data,
        'prescriptions': prescriptions_data
    }

    return Response(response_data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_client(request, pk):
    """
    Delete a client. Only doctors can delete clients.
    """
    if not request.user.is_doctor:
        return Response({
            'error': 'Only doctors can delete clients'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        client = get_object_or_404(Client, pk=pk)
        client.delete()
        return Response({
            'message': 'Client deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def program_list(request):
    """
    List all health programs.
    """
    try:
        # Medical staff can see all programs
        if request.user.is_doctor or request.user.is_nurse:
            programs = HealthProgram.objects.all()
        else:
            # Regular users can only see programs they're enrolled in
            programs = HealthProgram.objects.filter(
                enrollments__client=request.user
            ).distinct()

        data = [{
            'id': program.id,
            'name': program.name,
            'description': program.description,
            'created_by': program.created_by.username if program.created_by else None,
            'created_at': program.created_at,
            'total_enrollments': program.enrollments.count(),
            'active_enrollments': program.enrollments.filter(is_active=True).count()
        } for program in programs]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_program(request, pk):
    """
    Delete a health program. Only doctors can delete programs.
    """
    if not request.user.is_doctor:
        return Response({
            'error': 'Only doctors can delete health programs'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        program = get_object_or_404(HealthProgram, pk=pk)
        program.delete()
        return Response({
            'message': 'Health program deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_enrollment(request, pk):
    """
    Delete an enrollment. Only doctors and nurses can delete enrollments.
    """
    if not (request.user.is_doctor or request.user.is_nurse):
        return Response({
            'error': 'Only medical staff can delete enrollments'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        enrollment = get_object_or_404(Enrollment, pk=pk)
        enrollment.delete()
        return Response({
            'message': 'Enrollment deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_metric(request, pk):
    """
    Delete a metric. Only doctors and nurses can delete metrics.
    """
    if not (request.user.is_doctor or request.user.is_nurse):
        return Response({
            'error': 'Only medical staff can delete metrics'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        metric = get_object_or_404(Metric, pk=pk)
        metric.delete()
        return Response({
            'message': 'Metric deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_comprehensive_info_by_name(request, first_name, last_name):
    """
    Get comprehensive information about a client by name, including:
    - Basic client information
    - All enrollments and their programs
    - All prescriptions
    - All appointments
    """
    try:
        client = Client.objects.get(first_name__iexact=first_name, last_name__iexact=last_name)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=404)

    enrollments = Enrollment.objects.filter(client=client, is_active=True)
    enrollments_data = [{
        'id': enrollment.id,
        'program': {
            'id': enrollment.program.id,
            'name': enrollment.program.name,
            'description': enrollment.program.description
        },
        'enrolled_by': enrollment.enrolled_by.username if enrollment.enrolled_by else None,
        'enrollment_date': enrollment.enrollment_date,
        'is_active': enrollment.is_active
    } for enrollment in enrollments]

    prescriptions = Prescription.objects.filter(client=client)
    prescriptions_data = [{
        'id': prescription.id,
        'medication_name': prescription.medication_name,
        'dosage': prescription.dosage,
        'frequency': prescription.frequency,
        'start_date': prescription.start_date,
        'end_date': prescription.end_date,
        'notes': prescription.notes,
        'prescribed_by': prescription.prescribed_by.username if prescription.prescribed_by else None,
        'created_at': prescription.created_at
    } for prescription in prescriptions]

    appointments = Appointment.objects.filter(client=client)
    appointments_data = [{
        'id': appointment.id,
        'scheduled_with': appointment.scheduled_with.username if appointment.scheduled_with else None,
        'scheduled_for': appointment.scheduled_for,
        'reason': appointment.reason,
        'status': appointment.status,
        'notes': appointment.notes,
        'created_at': appointment.created_at
    } for appointment in appointments]

    response_data = {
        'client': {
            'id': client.id,
            'first_name': client.first_name,
            'last_name': client.last_name,
            'date_of_birth': client.date_of_birth,
            'gender': client.gender,
            'address': client.address,
            'phone_number': client.phone_number,
            'email': client.email,
            'created_at': client.created_at
        },
        'enrollments': enrollments_data,
        'prescriptions': prescriptions_data,
        'appointments': appointments_data
    }
    return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_list(request):
    staff = User.objects.filter(Q(is_doctor=True) | Q(is_nurse=True))
    data = [
        {
            'id': user.id,
            'first_name': getattr(user, 'first_name', ''),
            'last_name': getattr(user, 'last_name', ''),
            'username': user.username,
            'role': 'Doctor' if getattr(user, 'is_doctor', False) else 'Nurse'
        }
        for user in staff
    ]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment_quick(request):
    """
    Create an appointment with just client_id and scheduled_for. The staff is the current user.
    """
    client_id = request.data.get('client_id')
    scheduled_for = request.data.get('scheduled_for')
    reason = request.data.get('reason', '')
    notes = request.data.get('notes', '')

    if not client_id or not scheduled_for:
        return Response({'error': 'client_id and scheduled_for are required'}, status=400)

    client = get_object_or_404(Client, id=client_id)
    staff = request.user
    if not (staff.is_doctor or staff.is_nurse):
        return Response({'error': 'Only medical staff can create appointments this way'}, status=403)

    appointment = Appointment.objects.create(
        client=client,
        scheduled_with=staff,
        scheduled_for=scheduled_for,
        reason=reason,
        notes=notes
    )
    return Response({
        'id': appointment.id,
        'client': str(client),
        'scheduled_with': staff.username,
        'scheduled_for': appointment.scheduled_for,
        'reason': appointment.reason,
        'status': appointment.status,
        'notes': appointment.notes,
        'created_at': appointment.created_at
    }, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_encounter(request):
    """
    Create a new healthcare encounter (visit).
    """
    if not (request.user.is_doctor or request.user.is_nurse):
        return Response({'error': 'Only medical staff can create encounters'}, status=403)
    client_id = request.data.get('client_id')
    encounter_type = request.data.get('encounter_type', 'Consultation')
    scheduled_for = request.data.get('scheduled_for')
    notes = request.data.get('notes', '')
    status_ = request.data.get('status', 'Scheduled')
    if not client_id or not scheduled_for:
        return Response({'error': 'client_id and scheduled_for are required'}, status=400)
    client = get_object_or_404(Client, id=client_id)
    encounter = Encounter.objects.create(
        client=client,
        provider=request.user,
        encounter_type=encounter_type,
        scheduled_for=scheduled_for,
        status=status_,
        notes=notes
    )
    return Response({
        'id': encounter.id,
        'client': str(client),
        'provider': request.user.username,
        'encounter_type': encounter.encounter_type,
        'scheduled_for': encounter.scheduled_for,
        'status': encounter.status,
        'notes': encounter.notes,
        'created_at': encounter.created_at
    }, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_encounters(request):
    """
    List all encounters (filtered by user permissions).
    """
    if request.user.is_doctor or request.user.is_nurse:
        encounters = Encounter.objects.all()
    else:
        encounters = Encounter.objects.filter(client__user=request.user)
    data = [{
        'id': e.id,
        'client': str(e.client),
        'provider': e.provider.username,
        'encounter_type': e.encounter_type,
        'scheduled_for': e.scheduled_for,
        'status': e.status,
        'notes': e.notes,
        'created_at': e.created_at
    } for e in encounters]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_encounter(request, pk):
    encounter = get_object_or_404(Encounter, pk=pk)
    return Response({
        'id': encounter.id,
        'client': str(encounter.client),
        'provider': encounter.provider.username,
        'encounter_type': encounter.encounter_type,
        'scheduled_for': encounter.scheduled_for,
        'status': encounter.status,
        'notes': encounter.notes,
        'created_at': encounter.created_at
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_encounter(request, pk):
    """
    Delete an encounter. Only doctors and nurses can delete encounters.
    """
    if not (request.user.is_doctor or request.user.is_nurse):
        return Response({'error': 'Only medical staff can delete encounters'}, status=403)
    try:
        encounter = get_object_or_404(Encounter, pk=pk)
        encounter.delete()
        return Response({'message': 'Encounter deleted successfully'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def webhook_endpoint(request):
    """Test endpoint to receive notifications"""
    print("Received webhook notification:", request.data)  # For testing in console
    return Response({
        'status': 'received',
        'data': request.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def prescription_detail(request, pk):
    """
    Get details of a specific prescription
    """
    try:
        prescription = get_object_or_404(Prescription, pk=pk)
        
        data = {
            'id': prescription.id,
            'client': {
                'id': prescription.client.id,
                'first_name': prescription.client.first_name,
                'last_name': prescription.client.last_name
            },
            'medication_name': prescription.medication_name,
            'dosage': prescription.dosage,
            'frequency': prescription.frequency,
            'duration': prescription.duration,
            'notes': prescription.notes,
            'prescribed_date': prescription.prescribed_date,
            'prescribed_by': {
                'id': prescription.prescribed_by.id,
                'username': prescription.prescribed_by.username
            }
        }
        
        return Response(data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_prescription(request, pk):
    """
    Update a prescription
    """
    try:
        prescription = get_object_or_404(Prescription, pk=pk)
        
        # Only doctors can update prescriptions
        if not request.user.is_doctor:
            return Response(
                {'error': 'Only doctors can update prescriptions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update fields
        if 'medication_name' in request.data:
            prescription.medication_name = request.data['medication_name']
        if 'dosage' in request.data:
            prescription.dosage = request.data['dosage']
        if 'frequency' in request.data:
            prescription.frequency = request.data['frequency']
        if 'duration' in request.data:
            prescription.duration = request.data['duration']
        if 'notes' in request.data:
            prescription.notes = request.data['notes']
            
        prescription.save()
        
        return Response({
            'id': prescription.id,
            'client': {
                'id': prescription.client.id,
                'first_name': prescription.client.first_name,
                'last_name': prescription.client.last_name
            },
            'medication_name': prescription.medication_name,
            'dosage': prescription.dosage,
            'frequency': prescription.frequency,
            'duration': prescription.duration,
            'notes': prescription.notes,
            'prescribed_date': prescription.prescribed_date,
            'prescribed_by': {
                'id': prescription.prescribed_by.id,
                'username': prescription.prescribed_by.username
            }
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
