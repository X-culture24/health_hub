import random
from django.contrib.auth.models import User
from core.models import Treatment, Achievement
from faker import Faker
from django.utils import timezone
from datetime import timedelta

fake = Faker()

def create_sample_users(num_users=10):
    """Create sample users with different roles"""
    users = []
    roles = ['patient', 'doctor', 'nurse']
    
    for _ in range(num_users):
        username = fake.user_name()
        email = fake.email()
        password = 'testpass123'  # Development only
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=fake.first_name(),
            last_name=fake.last_name()
        )
        user.profile.role = random.choice(roles)
        user.profile.phone = fake.phone_number()
        user.profile.save()
        users.append(user)
    
    return users

def create_sample_treatments(users, num_treatments=30):
    """Create sample treatments with realistic medical data"""
    treatment_types = [
        'Consultation', 'Follow-up', 'Vaccination', 
        'Physical Therapy', 'Mental Health Session'
    ]
    
    for _ in range(num_treatments):
        patient = random.choice([u for u in users if u.profile.role == 'patient'])
        doctor = random.choice([u for u in users if u.profile.role == 'doctor'])
        
        treatment_date = fake.date_time_between(
            start_date='-1y',
            end_date='+6m',
            tzinfo=timezone.get_current_timezone()
        )
        
        Treatment.objects.create(
            patient=patient,
            doctor=doctor,
            treatment_type=random.choice(treatment_types),
            description=fake.text(max_nb_chars=200),
            scheduled_date=treatment_date,
            status=random.choice(['scheduled', 'completed', 'cancelled']),
            notes=fake.text(max_nb_chars=500) if random.choice([True, False]) else ''
        )

def create_achievements():
    """Create achievement templates"""
    achievements = [
        {
            'name': 'Health Pioneer',
            'description': 'Complete your first treatment',
            'points': 100,
            'icon': '🌟'
        },
        {
            'name': 'Consistency Champion',
            'description': 'Complete 5 treatments on time',
            'points': 500,
            'icon': '🏆'
        },
        {
            'name': 'Wellness Warrior',
            'description': 'Maintain perfect attendance for 3 months',
            'points': 1000,
            'icon': '⚔️'
        },
        # Add more achievements as needed
    ]
    
    for achievement in achievements:
        Achievement.objects.create(**achievement)

def run_seeder():
    """Main function to run all seeders"""
    print("🌱 Starting database seeding...")
    
    print("Creating users...")
    users = create_sample_users()
    
    print("Creating treatments...")
    create_sample_treatments(users)
    
    print("Creating achievements...")
    create_achievements()
    
    print("✅ Seeding completed successfully!")

if __name__ == "__main__":
    run_seeder() 