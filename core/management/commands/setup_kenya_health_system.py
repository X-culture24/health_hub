"""
Management command to set up the Kenya Health System with initial data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, time
import json

from core.models import (
    HealthFacility, Department, MedicalSpecialty, StaffProfile,
    DrugCategory, DrugManufacturer, Drug, SurgeryType, PaymentMethod,
    SystemConfiguration, HospitalNetwork
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up Kenya Health System with initial data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sample-data',
            action='store_true',
            help='Create sample data for testing',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up Kenya Health System...'))
        
        # Create medical specialties
        self.create_medical_specialties()
        
        # Create drug categories and manufacturers
        self.create_drug_system()
        
        # Create surgery types
        self.create_surgery_types()
        
        # Create payment methods
        self.create_payment_methods()
        
        # Create system configuration
        self.create_system_configuration()
        
        if options['sample_data']:
            self.create_sample_facilities()
            self.create_sample_network()
        
        self.stdout.write(self.style.SUCCESS('Kenya Health System setup completed!'))

    def create_medical_specialties(self):
        """Create medical specialties"""
        specialties = [
            {'name': 'Internal Medicine', 'description': 'General internal medicine'},
            {'name': 'Surgery', 'description': 'General surgery'},
            {'name': 'Pediatrics', 'description': 'Child healthcare'},
            {'name': 'Obstetrics & Gynecology', 'description': 'Women\'s health and childbirth'},
            {'name': 'Orthopedics', 'description': 'Bone and joint disorders'},
            {'name': 'Cardiology', 'description': 'Heart and cardiovascular system'},
            {'name': 'Neurology', 'description': 'Nervous system disorders'},
            {'name': 'Psychiatry', 'description': 'Mental health'},
            {'name': 'Radiology', 'description': 'Medical imaging'},
            {'name': 'Anesthesiology', 'description': 'Anesthesia and pain management'},
            {'name': 'Emergency Medicine', 'description': 'Emergency care'},
            {'name': 'Family Medicine', 'description': 'Primary care for families'},
            {'name': 'Dermatology', 'description': 'Skin disorders'},
            {'name': 'Ophthalmology', 'description': 'Eye care'},
            {'name': 'ENT', 'description': 'Ear, nose, and throat'},
        ]
        
        for specialty_data in specialties:
            specialty, created = MedicalSpecialty.objects.get_or_create(
                name=specialty_data['name'],
                defaults=specialty_data
            )
            if created:
                self.stdout.write(f'Created specialty: {specialty.name}')

    def create_drug_system(self):
        """Create drug categories and manufacturers"""
        # Drug categories
        categories = [
            {'name': 'Antibiotics', 'description': 'Antimicrobial medications'},
            {'name': 'Analgesics', 'description': 'Pain relief medications'},
            {'name': 'Antihypertensives', 'description': 'Blood pressure medications'},
            {'name': 'Antidiabetics', 'description': 'Diabetes medications'},
            {'name': 'Antihistamines', 'description': 'Allergy medications'},
            {'name': 'Cardiovascular', 'description': 'Heart medications'},
            {'name': 'Respiratory', 'description': 'Breathing medications'},
            {'name': 'Gastrointestinal', 'description': 'Digestive system medications'},
            {'name': 'Vaccines', 'description': 'Immunization vaccines'},
            {'name': 'Vitamins & Supplements', 'description': 'Nutritional supplements'},
        ]
        
        for cat_data in categories:
            category, created = DrugCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created drug category: {category.name}')
        
        # Drug manufacturers
        manufacturers = [
            {'name': 'Cosmos Limited', 'country': 'Kenya'},
            {'name': 'Dawa Limited', 'country': 'Kenya'},
            {'name': 'Pharmaceutical Manufacturing Company', 'country': 'Kenya'},
            {'name': 'Beta Healthcare', 'country': 'Kenya'},
            {'name': 'Novartis', 'country': 'Switzerland'},
            {'name': 'Pfizer', 'country': 'USA'},
            {'name': 'GlaxoSmithKline', 'country': 'UK'},
            {'name': 'Cipla', 'country': 'India'},
            {'name': 'Ranbaxy', 'country': 'India'},
            {'name': 'Teva', 'country': 'Israel'},
        ]
        
        for mfr_data in manufacturers:
            manufacturer, created = DrugManufacturer.objects.get_or_create(
                name=mfr_data['name'],
                defaults=mfr_data
            )
            if created:
                self.stdout.write(f'Created manufacturer: {manufacturer.name}')

    def create_surgery_types(self):
        """Create common surgery types"""
        surgeries = [
            {
                'name': 'Appendectomy',
                'description': 'Removal of appendix',
                'complexity_level': 'minor',
                'estimated_duration_minutes': 60,
                'average_cost': 50000.00
            },
            {
                'name': 'Cesarean Section',
                'description': 'Surgical delivery of baby',
                'complexity_level': 'major',
                'estimated_duration_minutes': 90,
                'average_cost': 80000.00
            },
            {
                'name': 'Hernia Repair',
                'description': 'Repair of hernia',
                'complexity_level': 'minor',
                'estimated_duration_minutes': 45,
                'average_cost': 40000.00
            },
            {
                'name': 'Gallbladder Removal',
                'description': 'Cholecystectomy',
                'complexity_level': 'major',
                'estimated_duration_minutes': 120,
                'average_cost': 100000.00
            },
            {
                'name': 'Cataract Surgery',
                'description': 'Removal of cataract from eye',
                'complexity_level': 'minor',
                'estimated_duration_minutes': 30,
                'average_cost': 25000.00
            },
            {
                'name': 'Hip Replacement',
                'description': 'Total hip replacement',
                'complexity_level': 'complex',
                'estimated_duration_minutes': 180,
                'average_cost': 300000.00
            },
        ]
        
        for surgery_data in surgeries:
            surgery, created = SurgeryType.objects.get_or_create(
                name=surgery_data['name'],
                defaults=surgery_data
            )
            if created:
                self.stdout.write(f'Created surgery type: {surgery.name}')

    def create_payment_methods(self):
        """Create payment methods"""
        payment_methods = [
            {'name': 'mpesa', 'is_active': True},
            {'name': 'airtel', 'is_active': True},
            {'name': 'card', 'is_active': True},
            {'name': 'cash', 'is_active': True},
            {'name': 'insurance', 'is_active': True},
            {'name': 'bank_transfer', 'is_active': True},
        ]
        
        for method_data in payment_methods:
            method, created = PaymentMethod.objects.get_or_create(
                name=method_data['name'],
                defaults=method_data
            )
            if created:
                self.stdout.write(f'Created payment method: {method.get_name_display()}')

    def create_system_configuration(self):
        """Create system configuration"""
        configs = [
            {
                'key': 'appointment_slot_duration',
                'value': 30,
                'description': 'Default appointment slot duration in minutes'
            },
            {
                'key': 'working_hours_start',
                'value': '08:00',
                'description': 'Default working hours start time'
            },
            {
                'key': 'working_hours_end',
                'value': '17:00',
                'description': 'Default working hours end time'
            },
            {
                'key': 'low_stock_threshold',
                'value': 10,
                'description': 'Default low stock threshold'
            },
            {
                'key': 'currency',
                'value': 'KES',
                'description': 'Default currency'
            },
            {
                'key': 'country',
                'value': 'Kenya',
                'description': 'Country'
            },
            {
                'key': 'time_zone',
                'value': 'Africa/Nairobi',
                'description': 'Default timezone'
            },
        ]
        
        for config_data in configs:
            config, created = SystemConfiguration.objects.get_or_create(
                key=config_data['key'],
                defaults=config_data
            )
            if created:
                self.stdout.write(f'Created config: {config.key}')

    def create_sample_facilities(self):
        """Create sample health facilities"""
        facilities = [
            {
                'name': 'Kenyatta National Hospital',
                'facility_type': 'national_hospital',
                'facility_level': 'level_6',
                'registration_number': 'KNH001',
                'county': 'Nairobi',
                'sub_county': 'Dagoretti North',
                'ward': 'Kilimani',
                'physical_address': 'Hospital Road, Upper Hill, Nairobi',
                'phone_number': '+254-20-2726300',
                'email': 'info@knh.or.ke',
                'bed_capacity': 1800,
                'operating_hours_start': time(0, 0),
                'operating_hours_end': time(23, 59),
                'is_24_hour': True,
                'emergency_services': True,
                'maternity_services': True,
                'surgery_services': True,
                'laboratory_services': True,
                'pharmacy_services': True,
                'radiology_services': True,
                'dental_services': True,
            },
            {
                'name': 'Moi Teaching and Referral Hospital',
                'facility_type': 'national_hospital',
                'facility_level': 'level_6',
                'registration_number': 'MTRH001',
                'county': 'Uasin Gishu',
                'sub_county': 'Eldoret East',
                'ward': 'Eldoret East',
                'physical_address': 'Nandi Road, Eldoret',
                'phone_number': '+254-53-2033471',
                'email': 'info@mtrh.go.ke',
                'bed_capacity': 900,
                'operating_hours_start': time(0, 0),
                'operating_hours_end': time(23, 59),
                'is_24_hour': True,
                'emergency_services': True,
                'maternity_services': True,
                'surgery_services': True,
                'laboratory_services': True,
                'pharmacy_services': True,
                'radiology_services': True,
                'dental_services': True,
            },
            {
                'name': 'Nairobi West Hospital',
                'facility_type': 'private_hospital',
                'facility_level': 'level_5',
                'registration_number': 'NWH001',
                'county': 'Nairobi',
                'sub_county': 'Lang\'ata',
                'ward': 'Mugumo-ini',
                'physical_address': 'Maiyan Road, Nairobi West',
                'phone_number': '+254-20-3877000',
                'email': 'info@nairobiwest.com',
                'bed_capacity': 150,
                'operating_hours_start': time(0, 0),
                'operating_hours_end': time(23, 59),
                'is_24_hour': True,
                'emergency_services': True,
                'maternity_services': True,
                'surgery_services': True,
                'laboratory_services': True,
                'pharmacy_services': True,
                'radiology_services': True,
                'dental_services': True,
            },
        ]
        
        for facility_data in facilities:
            facility, created = HealthFacility.objects.get_or_create(
                registration_number=facility_data['registration_number'],
                defaults=facility_data
            )
            if created:
                self.stdout.write(f'Created facility: {facility.name}')
                
                # Create departments for each facility
                self.create_departments_for_facility(facility)

    def create_departments_for_facility(self, facility):
        """Create departments for a facility"""
        departments = [
            {'name': 'Emergency Department', 'department_type': 'emergency'},
            {'name': 'Surgery Department', 'department_type': 'surgery'},
            {'name': 'Internal Medicine', 'department_type': 'internal_medicine'},
            {'name': 'Pediatrics', 'department_type': 'pediatrics'},
            {'name': 'Obstetrics & Gynecology', 'department_type': 'obstetrics_gynecology'},
            {'name': 'Orthopedics', 'department_type': 'orthopedics'},
            {'name': 'Radiology', 'department_type': 'radiology'},
            {'name': 'Laboratory', 'department_type': 'laboratory'},
            {'name': 'Pharmacy', 'department_type': 'pharmacy'},
            {'name': 'Outpatient', 'department_type': 'outpatient'},
        ]
        
        for dept_data in departments:
            dept_data['facility'] = facility
            department, created = Department.objects.get_or_create(
                facility=facility,
                department_type=dept_data['department_type'],
                defaults=dept_data
            )
            if created:
                self.stdout.write(f'  Created department: {department.name}')

    def create_sample_network(self):
        """Create a sample hospital network"""
        network_data = {
            'name': 'Kenya National Hospital Network',
            'description': 'Network of major hospitals in Kenya for inter-doctor collaboration',
            'is_active': True
        }
        
        network, created = HospitalNetwork.objects.get_or_create(
            name=network_data['name'],
            defaults=network_data
        )
        
        if created:
            # Add all facilities to the network
            facilities = HealthFacility.objects.all()
            network.member_facilities.set(facilities)
            self.stdout.write(f'Created hospital network: {network.name}')
