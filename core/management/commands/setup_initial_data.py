"""
Management command to set up initial data for Health Hub System
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import PaymentMethod, Drug
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up initial data for Health Hub System'

    def handle(self, *args, **options):
        self.stdout.write('Setting up initial data...')
        
        # Create superuser if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@healthhub.com',
                password='admin123',
                first_name='System',
                last_name='Administrator',
                is_doctor=True,
                is_staff=True,
                employer_id='EMP001',
                work_email='admin@healthhub.com'
            )
            self.stdout.write(f'Created admin user: {admin_user.username}')
        
        # Create payment methods
        payment_methods = [
            {'name': 'mpesa', 'is_active': True},
            {'name': 'airtel', 'is_active': True},
            {'name': 'card', 'is_active': True},
            {'name': 'cash', 'is_active': True},
            {'name': 'insurance', 'is_active': True},
        ]
        
        for method_data in payment_methods:
            method, created = PaymentMethod.objects.get_or_create(
                name=method_data['name'],
                defaults={'is_active': method_data['is_active']}
            )
            if created:
                self.stdout.write(f'Created payment method: {method.get_name_display()}')
        
        # Create sample drugs
        sample_drugs = [
            {
                'name': 'Paracetamol',
                'generic_name': 'Acetaminophen',
                'brand_name': 'Panadol',
                'description': 'Pain reliever and fever reducer',
                'dosage_forms': ['tablet', 'syrup', 'injection'],
                'strength_options': ['500mg', '1000mg'],
                'contraindications': 'Severe liver disease',
                'side_effects': 'Rare: liver damage with overdose',
                'drug_interactions': [],
                'pregnancy_category': 'B',
                'requires_prescription': False,
                'is_controlled_substance': False
            },
            {
                'name': 'Amoxicillin',
                'generic_name': 'Amoxicillin',
                'brand_name': 'Augmentin',
                'description': 'Antibiotic for bacterial infections',
                'dosage_forms': ['capsule', 'tablet', 'syrup'],
                'strength_options': ['250mg', '500mg', '875mg'],
                'contraindications': 'Penicillin allergy',
                'side_effects': 'Nausea, diarrhea, allergic reactions',
                'drug_interactions': [],
                'pregnancy_category': 'B',
                'requires_prescription': True,
                'is_controlled_substance': False
            },
            {
                'name': 'Ibuprofen',
                'generic_name': 'Ibuprofen',
                'brand_name': 'Advil',
                'description': 'Anti-inflammatory pain reliever',
                'dosage_forms': ['tablet', 'capsule', 'syrup'],
                'strength_options': ['200mg', '400mg', '600mg'],
                'contraindications': 'Stomach ulcers, kidney disease',
                'side_effects': 'Stomach upset, dizziness',
                'drug_interactions': [],
                'pregnancy_category': 'C',
                'requires_prescription': False,
                'is_controlled_substance': False
            }
        ]
        
        for drug_data in sample_drugs:
            drug, created = Drug.objects.get_or_create(
                name=drug_data['name'],
                defaults=drug_data
            )
            if created:
                self.stdout.write(f'Created drug: {drug.name}')
        
        self.stdout.write(self.style.SUCCESS('Initial data setup completed successfully!'))
        self.stdout.write('')
        self.stdout.write('Admin credentials:')
        self.stdout.write('Username: admin')
        self.stdout.write('Password: admin123')
        self.stdout.write('Email: admin@healthhub.com')
