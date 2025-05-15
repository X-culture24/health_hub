from django.core.management.base import BaseCommand
from django.core.management import call_command
from utils.dev_tools.seed_data import run_seeder
import os
import time

class Command(BaseCommand):
    help = 'Sets up development environment with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('🚀 Setting up development environment...')
        
        # Wait for database
        self.stdout.write('Waiting for database...')
        time.sleep(3)  # Simple wait for database
        
        # Run migrations
        self.stdout.write('Running migrations...')
        call_command('migrate')
        
        # Create superuser
        self.stdout.write('Creating superuser...')
        try:
            call_command('createsuperuser', 
                        interactive=False,
                        username='admin',
                        email='admin@example.com',
                        password='adminpass123')
        except Exception as e:
            self.stdout.write(f'Superuser already exists or {str(e)}')
        
        # Seed data
        self.stdout.write('Seeding development data...')
        run_seeder()
        
        # Collect static
        self.stdout.write('Collecting static files...')
        call_command('collectstatic', '--noinput')
        
        self.stdout.write(self.style.SUCCESS('✨ Development environment ready!')) 