import requests
import json
from datetime import date, datetime, timedelta

BASE_URL = 'http://localhost:8000'

def test_endpoints():
    # 1. Get authentication token
    auth_response = requests.post(
        f'{BASE_URL}/api-token-auth/',
        json={'username': 'admin', 'password': 'admin123'}
    )
    print("\nAuth Response:", auth_response.text)
    
    if auth_response.status_code != 200:
        print("Authentication failed!")
        return
    
    token = auth_response.json()['token']
    headers = {'Authorization': f'Token {token}'}
    
    # 2. Create a health program
    program_data = {
        'name': 'COVID-19 Vaccination',
        'description': 'COVID-19 vaccination program'
    }
    response = requests.post(
        f'{BASE_URL}/core/programs/create/',
        json=program_data,
        headers=headers
    )
    print("\nCreate Program Response:", response.text)
    
    # 3. Register a client
    client_data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'date_of_birth': '1990-01-01',
        'gender': 'M',
        'phone_number': '1234567890',
        'email': 'john@example.com'
    }
    response = requests.post(
        f'{BASE_URL}/core/clients/register/',
        json=client_data,
        headers=headers
    )
    print("\nRegister Client Response:", response.text)
    client_id = response.json()['id']
    
    # 4. Enroll client in program
    enroll_data = {
        'client_id': client_id,
        'program_name': 'COVID-19 Vaccination'
    }
    response = requests.post(
        f'{BASE_URL}/core/enrollments/create/',
        json=enroll_data,
        headers=headers
    )
    print("\nEnroll Client Response:", response.text)
    
    # 5. Search clients
    response = requests.get(
        f'{BASE_URL}/core/clients/search/?q=John',
        headers=headers
    )
    print("\nSearch Clients Response:", response.text)
    
    # 6. View client profile
    response = requests.get(
        f'{BASE_URL}/core/clients/{client_id}/',
        headers=headers
    )
    print("\nClient Profile Response:", response.text)
    
    # 7. Create prescription
    prescription_data = {
        'client_id': client_id,
        'medication_name': 'Paracetamol',
        'dosage': '500mg',
        'frequency': 'Twice daily',
        'start_date': date.today().isoformat()
    }
    response = requests.post(
        f'{BASE_URL}/core/prescriptions/create/',
        json=prescription_data,
        headers=headers
    )
    print("\nCreate Prescription Response:", response.text)
    
    # 8. Record metric
    metric_data = {
        'client_id': client_id,
        'name': 'Blood Pressure',
        'value': 120,
        'unit': 'mmHg'
    }
    response = requests.post(
        f'{BASE_URL}/core/metrics/record/',
        json=metric_data,
        headers=headers
    )
    print("\nRecord Metric Response:", response.text)
    
    # 9. Create appointment
    appointment_data = {
        'client_id': client_id,
        'scheduled_with_id': 1,  # admin user id
        'scheduled_for': (datetime.now() + timedelta(days=1)).isoformat(),
        'reason': 'Regular checkup'
    }
    response = requests.post(
        f'{BASE_URL}/core/appointments/create/',
        json=appointment_data,
        headers=headers
    )
    print("\nCreate Appointment Response:", response.text)

if __name__ == '__main__':
    test_endpoints() 