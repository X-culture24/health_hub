from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, HealthProgram, Client, Enrollment

class HealthSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.doctor = User.objects.create_user(
            username='doctor',
            password='testpass123',
            is_doctor=True
        )
        self.client.force_authenticate(user=self.doctor)

    def test_create_program(self):
        url = reverse('create_program')
        data = {'name': 'TB Program', 'description': 'Tuberculosis treatment program'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(HealthProgram.objects.count(), 1)
        self.assertEqual(HealthProgram.objects.get().name, 'TB Program')

    def test_register_client(self):
        url = reverse('register_client')
        data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'date_of_birth': '1990-01-01',
            'gender': 'M',
            'address': '123 Main St',
            'phone_number': '1234567890',
            'email': 'john@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Client.objects.get().first_name, 'John')

    def test_enroll_client(self):
        # Create a program and client first
        program = HealthProgram.objects.create(name='HIV Program')
        client = Client.objects.create(
            first_name='Jane',
            last_name='Doe',
            date_of_birth='1990-01-01',
            gender='F'
        )
        
        url = reverse('enroll_client')
        data = {
            'client_id': client.id,
            'program_name': program.name
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enrollment.objects.count(), 1)
        self.assertEqual(Enrollment.objects.get().client, client)
        self.assertEqual(Enrollment.objects.get().program, program)

    def test_search_clients(self):
        # Create some clients
        Client.objects.create(
            first_name='John',
            last_name='Doe',
            date_of_birth='1990-01-01',
            gender='M'
        )
        Client.objects.create(
            first_name='Jane',
            last_name='Smith',
            date_of_birth='1990-01-01',
            gender='F'
        )
        
        url = reverse('search_clients')
        response = self.client.get(url, {'q': 'John'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['first_name'], 'John')

    def test_client_profile(self):
        # Create a client with some enrollments
        client = Client.objects.create(
            first_name='John',
            last_name='Doe',
            date_of_birth='1990-01-01',
            gender='M'
        )
        program = HealthProgram.objects.create(name='HIV Program')
        Enrollment.objects.create(client=client, program=program)
        
        url = reverse('client_profile', args=[client.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['client']['first_name'], 'John')
        self.assertEqual(len(response.data['enrollments']), 1)
        self.assertEqual(response.data['enrollments'][0]['program'], 'HIV Program')
