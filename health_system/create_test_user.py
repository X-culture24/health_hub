import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import User as CustomUser

# Create a test user
test_user = User.objects.create_user(
    username='testuser',
    password='testpass123',
    email='testuser@example.com'
)

# Create corresponding CustomUser
custom_user = CustomUser.objects.create(
    user=test_user,
    is_doctor=True  # Making this user a doctor for testing purposes
)

print(f"Created test user: {test_user.username}")
print(f"Created custom user with ID: {custom_user.id}") 