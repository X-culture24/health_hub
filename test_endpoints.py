import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_register():
    url = f"{BASE_URL}/auth/register/"
    data = {
        "username": "testdoctor",
        "password": "testpass",
        "employer_id": "EMP123",
        "work_email": "doctor@example.com",
        "is_doctor": True,
        "is_nurse": False
    }
    response = requests.post(url, json=data)
    print("Register Response:", response.status_code)
    print(response.text)
    if response.status_code == 201:
        return response.json()['token']
    return None

def test_endpoints(token):
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    # Test client creation
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
    print("\nCreate Client Response:", response.status_code)
    print(response.text)
    
    if response.status_code == 201:
        client_id = response.json()['id']
        
        # Test program creation
        program_data = {
            "name": "Test Program",
            "description": "A test health program"
        }
        response = requests.post(f"{BASE_URL}/programs/create/", headers=headers, json=program_data)
        print("\nCreate Program Response:", response.status_code)
        print(response.text)
        
        if response.status_code == 201:
            program_id = response.json()['id']
            
            # Test enrollment
            enrollment_data = {
                "client_id": client_id,
                "program_id": program_id
            }
            response = requests.post(f"{BASE_URL}/enrollments/create/", headers=headers, json=enrollment_data)
            print("\nCreate Enrollment Response:", response.status_code)
            print(response.text)
            
            # Test prescription creation
            prescription_data = {
                "client_id": client_id,
                "medication_name": "Test Med",
                "dosage": "10mg",
                "frequency": "daily",
                "start_date": "2024-04-27",
                "notes": "Test prescription"
            }
            response = requests.post(f"{BASE_URL}/prescriptions/create/", headers=headers, json=prescription_data)
            print("\nCreate Prescription Response:", response.status_code)
            print(response.text)
            
            # Test metric recording
            metric_data = {
                "client_id": client_id,
                "name": "Blood Pressure",
                "value": "120/80",
                "unit": "mmHg"
            }
            response = requests.post(f"{BASE_URL}/metrics/record/", headers=headers, json=metric_data)
            print("\nRecord Metric Response:", response.status_code)
            print(response.text)
            
            # Test appointment creation
            appointment_data = {
                "client_id": client_id,
                "scheduled_with_id": 1,  # Assuming the doctor's ID is 1
                "scheduled_for": "2024-05-01T10:00:00Z",
                "reason": "Regular checkup",
                "notes": "First appointment"
            }
            response = requests.post(f"{BASE_URL}/appointments/create/", headers=headers, json=appointment_data)
            print("\nCreate Appointment Response:", response.status_code)
            print(response.text)
            
            # Test GET endpoints
            endpoints = [
                "/clients/",
                f"/clients/{client_id}/",
                "/programs/",
                f"/programs/{program_id}/",
                "/enrollments/",
                "/prescriptions/",
                "/metrics/",
                "/appointments/"
            ]
            
            print("\nTesting GET endpoints:")
            for endpoint in endpoints:
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
                print(f"GET {endpoint} Response:", response.status_code)
                if response.status_code != 200:
                    print(response.text)
            
            # Test report generation
            response = requests.get(f"{BASE_URL}/reports/?type=client_attendance", headers=headers)
            print("\nGenerate Report Response:", response.status_code)
            print(response.text)
            
            # Test user settings
            response = requests.get(f"{BASE_URL}/settings/", headers=headers)
            print("\nGet User Settings Response:", response.status_code)
            print(response.text)
            
            # Test program metrics
            response = requests.get(f"{BASE_URL}/program-metrics/", headers=headers)
            print("\nGet Program Metrics Response:", response.status_code)
            print(response.text)
            
            # Test resource utilization
            response = requests.get(f"{BASE_URL}/resource-utilization/", headers=headers)
            print("\nGet Resource Utilization Response:", response.status_code)
            print(response.text)

if __name__ == "__main__":
    # First register a test doctor
    token = test_register()
    if token:
        print("\nSuccessfully registered and got token")
        test_endpoints(token)
    else:
        print("\nFailed to register user") 