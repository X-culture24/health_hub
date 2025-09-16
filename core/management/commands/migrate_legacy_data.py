from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from core.models import (
    HealthFacility, Department, MedicalSpecialty, StaffProfile,
    Client, Appointment, Drug, PharmacyInventory, EnhancedPrescription,
    Payment, TelemedicineSession, Encounter, DrugCategory, DrugManufacturer,
    PaymentMethod, SystemConfiguration
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class Command(BaseCommand):
    help = 'Migrate legacy health system data to Kenya Health System format'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run migration in dry-run mode without making changes',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of records to process in each batch',
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.batch_size = options['batch_size']
        
        if self.dry_run:
            self.stdout.write(
                self.style.WARNING('Running in DRY-RUN mode - no changes will be made')
            )
        
        try:
            with transaction.atomic():
                self.migrate_facilities()
                self.migrate_departments()
                self.migrate_staff_profiles()
                self.migrate_drug_categories()
                self.migrate_payment_methods()
                self.update_existing_data()
                
                if self.dry_run:
                    raise transaction.TransactionManagementError("Dry run - rolling back")
                    
        except transaction.TransactionManagementError:
            if self.dry_run:
                self.stdout.write(
                    self.style.SUCCESS('Dry run completed - no changes made')
                )
            else:
                raise
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Migration failed: {str(e)}')
            )
            raise
        else:
            self.stdout.write(
                self.style.SUCCESS('Migration completed successfully')
            )

    def migrate_facilities(self):
        """Create default health facility if none exists"""
        self.stdout.write('Migrating health facilities...')
        
        if not HealthFacility.objects.exists():
            facility = HealthFacility.objects.create(
                name='Legacy Health Facility',
                facility_type='district_hospital',
                level='level_4',
                county='Nairobi',
                sub_county='Westlands',
                ward='Parklands',
                address='Legacy System Address',
                phone_number='+254700000000',
                email='legacy@facility.com',
                is_active=True,
                bed_capacity=100,
                services_offered=['general_medicine', 'emergency', 'laboratory'],
                operating_hours={
                    'monday': {'open': '08:00', 'close': '17:00'},
                    'tuesday': {'open': '08:00', 'close': '17:00'},
                    'wednesday': {'open': '08:00', 'close': '17:00'},
                    'thursday': {'open': '08:00', 'close': '17:00'},
                    'friday': {'open': '08:00', 'close': '17:00'},
                    'saturday': {'open': '08:00', 'close': '13:00'},
                    'sunday': {'closed': True}
                }
            )
            self.stdout.write(f'Created default facility: {facility.name}')

    def migrate_departments(self):
        """Create default departments"""
        self.stdout.write('Migrating departments...')
        
        facility = HealthFacility.objects.first()
        if not facility:
            self.stdout.write(
                self.style.ERROR('No facility found - cannot create departments')
            )
            return
            
        default_departments = [
            {'name': 'General Medicine', 'code': 'GEN'},
            {'name': 'Emergency', 'code': 'EMR'},
            {'name': 'Pharmacy', 'code': 'PHR'},
            {'name': 'Laboratory', 'code': 'LAB'},
            {'name': 'Administration', 'code': 'ADM'},
        ]
        
        for dept_data in default_departments:
            department, created = Department.objects.get_or_create(
                facility=facility,
                code=dept_data['code'],
                defaults={
                    'name': dept_data['name'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created department: {department.name}')

    def migrate_staff_profiles(self):
        """Create staff profiles for existing users"""
        self.stdout.write('Migrating staff profiles...')
        
        facility = HealthFacility.objects.first()
        department = Department.objects.first()
        
        if not facility or not department:
            self.stdout.write(
                self.style.ERROR('No facility or department found - cannot create staff profiles')
            )
            return
        
        users_without_profiles = User.objects.filter(staffprofile__isnull=True)
        
        for user in users_without_profiles:
            # Determine position based on user type
            position_map = {
                'doctor': 'Medical Doctor',
                'nurse': 'Registered Nurse',
                'pharmacist': 'Pharmacist',
                'admin': 'Administrator',
                'receptionist': 'Receptionist'
            }
            
            position = position_map.get(user.user_type, 'Staff Member')
            
            staff_profile = StaffProfile.objects.create(
                user=user,
                facility=facility,
                department=department,
                employee_id=f'EMP{user.id:04d}',
                position=position,
                is_active=True
            )
            self.stdout.write(f'Created staff profile for: {user.get_full_name()}')

    def migrate_drug_categories(self):
        """Create default drug categories if none exist"""
        self.stdout.write('Migrating drug categories...')
        
        if DrugCategory.objects.count() < 5:  # Basic categories
            categories = [
                'Antibiotics',
                'Analgesics',
                'Cardiovascular',
                'Respiratory',
                'Gastrointestinal',
                'Endocrine',
                'Neurological',
                'Dermatological'
            ]
            
            for category_name in categories:
                category, created = DrugCategory.objects.get_or_create(
                    name=category_name,
                    defaults={'is_active': True}
                )
                if created:
                    self.stdout.write(f'Created drug category: {category.name}')

    def migrate_payment_methods(self):
        """Create default payment methods if none exist"""
        self.stdout.write('Migrating payment methods...')
        
        if PaymentMethod.objects.count() < 3:
            methods = [
                {'name': 'Cash', 'code': 'CASH', 'is_active': True},
                {'name': 'M-Pesa', 'code': 'MPESA', 'is_active': True},
                {'name': 'Insurance', 'code': 'INSURANCE', 'is_active': True},
                {'name': 'Card Payment', 'code': 'CARD', 'is_active': True},
            ]
            
            for method_data in methods:
                method, created = PaymentMethod.objects.get_or_create(
                    code=method_data['code'],
                    defaults=method_data
                )
                if created:
                    self.stdout.write(f'Created payment method: {method.name}')

    def update_existing_data(self):
        """Update existing records to link with new structures"""
        self.stdout.write('Updating existing data relationships...')
        
        facility = HealthFacility.objects.first()
        default_category = DrugCategory.objects.first()
        default_manufacturer = DrugManufacturer.objects.first()
        
        # Update drugs without categories
        if default_category:
            drugs_without_category = Drug.objects.filter(category__isnull=True)
            updated_count = drugs_without_category.update(category=default_category)
            if updated_count:
                self.stdout.write(f'Updated {updated_count} drugs with default category')
        
        # Update drugs without manufacturers
        if not default_manufacturer:
            default_manufacturer = DrugManufacturer.objects.create(
                name='Unknown Manufacturer',
                country='Kenya',
                is_active=True
            )
        
        drugs_without_manufacturer = Drug.objects.filter(manufacturer__isnull=True)
        updated_count = drugs_without_manufacturer.update(manufacturer=default_manufacturer)
        if updated_count:
            self.stdout.write(f'Updated {updated_count} drugs with default manufacturer')
        
        # Update pharmacy inventory without facilities
        if facility:
            inventory_without_facility = PharmacyInventory.objects.filter(facility__isnull=True)
            updated_count = inventory_without_facility.update(facility=facility)
            if updated_count:
                self.stdout.write(f'Updated {updated_count} inventory items with default facility')
        
        # Update appointments without facilities
        if facility:
            appointments_without_facility = Appointment.objects.filter(facility__isnull=True)
            updated_count = appointments_without_facility.update(facility=facility)
            if updated_count:
                self.stdout.write(f'Updated {updated_count} appointments with default facility')
        
        self.stdout.write('Data relationship updates completed')

    def create_system_configuration(self):
        """Create system configuration if it doesn't exist"""
        self.stdout.write('Creating system configuration...')
        
        config, created = SystemConfiguration.objects.get_or_create(
            key='system_initialized',
            defaults={
                'value': 'true',
                'description': 'System initialization status',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('Created system configuration')
        
        # Create other default configurations
        default_configs = [
            {
                'key': 'appointment_slot_duration',
                'value': '30',
                'description': 'Default appointment slot duration in minutes'
            },
            {
                'key': 'pharmacy_low_stock_threshold',
                'value': '10',
                'description': 'Low stock alert threshold for pharmacy items'
            },
            {
                'key': 'payment_timeout_minutes',
                'value': '15',
                'description': 'Payment timeout in minutes'
            }
        ]
        
        for config_data in default_configs:
            config, created = SystemConfiguration.objects.get_or_create(
                key=config_data['key'],
                defaults={
                    'value': config_data['value'],
                    'description': config_data['description'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created configuration: {config.key}')
