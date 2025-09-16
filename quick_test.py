#!/usr/bin/env python3
"""
Quick test script for Kenya Health System
Tests Django application for common errors and issues
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.test.utils import get_runner
from django.conf import settings

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
    django.setup()

def test_imports():
    """Test if all modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        from core import models, views, serializers, admin
        print("✅ Core modules imported successfully")
    except ImportError as e:
        print(f"❌ Import error in core modules: {e}")
        return False
    
    try:
        from core.models import (
            HealthFacility, Department, StaffProfile, 
            ShiftBooking, SurgerySchedule, VirtualPharmacist
        )
        print("✅ New models imported successfully")
    except ImportError as e:
        print(f"❌ Import error in new models: {e}")
        return False
    
    return True

def test_models():
    """Test model creation and validation"""
    print("🔍 Testing models...")
    
    try:
        from core.models import HealthFacility, Department, User
        
        # Test model creation (without saving to DB)
        facility = HealthFacility(
            name="Test Facility",
            facility_type="health_center",
            level="level_3",
            county="Test County",
            sub_county="Test Sub-County",
            ward="Test Ward",
            address="Test Address",
            phone_number="+254700000000",
            email="test@facility.com",
            bed_capacity=50
        )
        
        # Test model validation
        facility.full_clean()
        print("✅ Model validation passed")
        
    except Exception as e:
        print(f"❌ Model error: {e}")
        return False
    
    return True

def test_urls():
    """Test URL configuration"""
    print("🔍 Testing URL configuration...")
    
    try:
        from django.urls import reverse
        from django.test import Client
        
        # Test basic URL patterns
        urls_to_test = [
            'admin:index',
        ]
        
        for url_name in urls_to_test:
            try:
                url = reverse(url_name)
                print(f"✅ URL '{url_name}' resolved to: {url}")
            except Exception as e:
                print(f"❌ URL error for '{url_name}': {e}")
        
    except Exception as e:
        print(f"❌ URL configuration error: {e}")
        return False
    
    return True

def test_settings():
    """Test Django settings"""
    print("🔍 Testing Django settings...")
    
    try:
        from django.conf import settings
        
        # Check critical settings
        critical_settings = [
            'SECRET_KEY', 'DATABASES', 'INSTALLED_APPS',
            'MIDDLEWARE', 'ROOT_URLCONF', 'TEMPLATES'
        ]
        
        for setting in critical_settings:
            if hasattr(settings, setting):
                print(f"✅ Setting '{setting}' is configured")
            else:
                print(f"❌ Missing setting: {setting}")
                return False
        
        # Check if our app is installed
        if 'core' in settings.INSTALLED_APPS:
            print("✅ Core app is in INSTALLED_APPS")
        else:
            print("❌ Core app not in INSTALLED_APPS")
            return False
            
    except Exception as e:
        print(f"❌ Settings error: {e}")
        return False
    
    return True

def test_management_commands():
    """Test custom management commands"""
    print("🔍 Testing management commands...")
    
    try:
        from django.core.management import get_commands
        commands = get_commands()
        
        custom_commands = [
            'setup_kenya_health_system',
            'migrate_legacy_data'
        ]
        
        for cmd in custom_commands:
            if cmd in commands:
                print(f"✅ Management command '{cmd}' is available")
            else:
                print(f"❌ Management command '{cmd}' not found")
        
    except Exception as e:
        print(f"❌ Management commands error: {e}")
        return False
    
    return True

def test_serializers():
    """Test API serializers"""
    print("🔍 Testing serializers...")
    
    try:
        from core.serializers import (
            HealthFacilitySerializer, DepartmentSerializer,
            StaffProfileSerializer, ShiftBookingSerializer
        )
        
        # Test serializer instantiation
        serializers = [
            HealthFacilitySerializer,
            DepartmentSerializer,
            StaffProfileSerializer,
            ShiftBookingSerializer
        ]
        
        for serializer_class in serializers:
            serializer = serializer_class()
            print(f"✅ Serializer '{serializer_class.__name__}' instantiated successfully")
        
    except Exception as e:
        print(f"❌ Serializer error: {e}")
        return False
    
    return True

def run_django_checks():
    """Run Django system checks"""
    print("🔍 Running Django system checks...")
    
    try:
        from django.core.management import call_command
        from io import StringIO
        
        # Capture output
        out = StringIO()
        call_command('check', stdout=out)
        output = out.getvalue()
        
        if "System check identified no issues" in output:
            print("✅ Django system checks passed")
            return True
        else:
            print(f"❌ Django system check issues:\n{output}")
            return False
            
    except Exception as e:
        print(f"❌ Django check error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Kenya Health System Quick Test")
    print("=" * 40)
    
    # Setup Django
    setup_django()
    
    # Run tests
    tests = [
        test_imports,
        test_settings,
        test_models,
        test_urls,
        test_serializers,
        test_management_commands,
        run_django_checks,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()  # Add spacing between tests
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            print()
    
    # Summary
    print("=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The application appears to be working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
