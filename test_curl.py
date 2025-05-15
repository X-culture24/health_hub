import requests
import json
from pprint import pprint

def print_response(response):
    print(f"\nStatus Code: {response.status_code}")
    try:
        pprint(response.json())
    except:
        print(response.text)
    print("-" * 50)

# Base URL
BASE_URL = 'http://127.0.0.1:8000/api'

# 1. Register a doctor
print("\n1. Registering a doctor:")
register_data = {
    "username": "testdoctor",
    "password": "testpass",
    "employer_id": "EMP456",
    "work_email": "testdoctor@example.com",
    "is_doctor": True,
    "is_nurse": False
}
response = requests.post(f"{BASE_URL}/auth/register/", json=register_data)
print_response(response)
token = response.json().get('token')

if token:
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    # 2. Create a client
    print("\n2. Creating a client:")
    client_data = {
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1990-01-01",
        "gender": "M",
        "address": "123 Test St",
        "phone_number": "1234567890",
        "email": "john@example.com"
    }
    response = requests.post(f"{BASE_URL}/clients/register/", headers=headers, json=client_data)
    print_response(response)
    client_id = response.json().get('id')

    # 3. Create a health program
    print("\n3. Creating a health program:")
    program_data = {
        "name": "Test Program",
        "description": "A test health program"
    }
    response = requests.post(f"{BASE_URL}/programs/create/", headers=headers, json=program_data)
    print_response(response)
    program_id = response.json().get('id')

    # 4. Create an enrollment
    print("\n4. Creating an enrollment:")
    enrollment_data = {
        "client_id": client_id,
        "program_id": program_id
    }
    response = requests.post(f"{BASE_URL}/enrollments/create/", headers=headers, json=enrollment_data)
    print_response(response)

    # 5. Create a prescription
    print("\n5. Creating a prescription:")
    prescription_data = {
        "client_id": client_id,
        "medication_name": "Test Med",
        "dosage": "10mg",
        "frequency": "daily",
        "start_date": "2024-04-27",
        "notes": "Test prescription"
    }
    response = requests.post(f"{BASE_URL}/prescriptions/create/", headers=headers, json=prescription_data)
    print_response(response)

    # 6. Record a metric
    print("\n6. Recording a metric:")
    metric_data = {
        "client_id": client_id,
        "name": "Blood Pressure",
        "value": "120/80",
        "unit": "mmHg"
    }
    response = requests.post(f"{BASE_URL}/metrics/record/", headers=headers, json=metric_data)
    print_response(response)

    # 7. Create an appointment
    print("\n7. Creating an appointment:")
    appointment_data = {
        "client_id": client_id,
        "scheduled_with_id": 1,
        "scheduled_for": "2024-05-01T10:00:00Z",
        "reason": "Regular checkup",
        "notes": "First appointment"
    }
    response = requests.post(f"{BASE_URL}/appointments/create/", headers=headers, json=appointment_data)
    print_response(response)

    # 8. Test GET endpoints
    print("\n8. Testing GET endpoints:")
    get_endpoints = [
        "/clients/",
        f"/clients/{client_id}/",
        "/programs/",
        f"/programs/{program_id}/",
        "/enrollments/",
        "/prescriptions/",
        "/metrics/",
        "/appointments/"
    ]
    
    for endpoint in get_endpoints:
        print(f"\nGET {endpoint}:")
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        print_response(response)

    # 9. Generate a report
    print("\n9. Generating a report:")
    response = requests.get(f"{BASE_URL}/reports/?type=client_attendance", headers=headers)
    print_response(response)

    # 10. Get user settings
    print("\n10. Getting user settings:")
    response = requests.get(f"{BASE_URL}/settings/", headers=headers)
    print_response(response)

    # 11. Get program metrics
    print("\n11. Getting program metrics:")
    response = requests.get(f"{BASE_URL}/program-metrics/", headers=headers)
    print_response(response)

    # 12. Get resource utilization
    print("\n12. Getting resource utilization:")
    response = requests.get(f"{BASE_URL}/resource-utilization/", headers=headers)
    print_response(response)

else:
    print("Failed to register and get token") 