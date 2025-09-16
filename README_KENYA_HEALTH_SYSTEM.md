# Kenya Health System - Comprehensive Healthcare Management Platform 🏥🇰🇪

A scalable, comprehensive healthcare management system designed specifically for health facilities across Kenya. This system supports everything from small dispensaries to major national hospitals, with advanced features for inter-doctor collaboration, surgery management, and virtual pharmacy services.

## 🚀 Key Features

### 🏥 Multi-Facility Support
- **Any Health Facility**: Supports all levels from Level 1 (Community) to Level 6 (National Hospitals)
- **Facility Types**: National hospitals, county hospitals, private clinics, dispensaries, health centers
- **Geographic Coverage**: Complete county, sub-county, and ward mapping for Kenya
- **Services Tracking**: Emergency, maternity, surgery, laboratory, pharmacy, radiology, dental services

### 👨‍⚕️ Inter-Doctor Hospital System
- **Doctor Availability**: Doctors can set availability across multiple hospitals
- **Shift Booking**: Hospitals can book doctors for shifts with transparent pricing
- **Cross-Hospital Collaboration**: Seamless doctor sharing between network hospitals
- **Rating System**: Performance tracking and feedback for visiting doctors
- **Real-time Scheduling**: Conflict detection and automated scheduling

### 🔪 Advanced Surgery Management
- **Surgery Scheduling**: Complete operating room and surgeon scheduling
- **Multi-Surgeon Support**: Primary surgeon and assisting surgeons coordination
- **Equipment Tracking**: Operating room equipment and availability management
- **Pre/Post-Op Management**: Comprehensive surgical workflow tracking
- **Cost Management**: Estimated vs actual costs with insurance integration

### 💊 Virtual Pharmacy System
- **AI-Powered Consultations**: Drug interaction checking and recommendations
- **Inventory Management**: Real-time stock tracking with expiry monitoring
- **Prescription Safety**: Automated safety validation and contraindication warnings
- **Drug Categories**: Comprehensive drug classification and manufacturer tracking
- **Dispensing Workflow**: Complete prescription to dispensing workflow

### 📋 Enhanced Patient Management
- **Comprehensive Medical History**: Allergies, chronic conditions, family history
- **Insurance Integration**: NHIF and private insurance support
- **Appointment System**: Advanced scheduling with telemedicine support
- **Payment Integration**: M-Pesa, Airtel Money, and multiple payment methods

### 📊 System Scalability
- **Audit Logging**: Complete system activity tracking
- **Configuration Management**: System-wide settings and customization
- **Role-Based Access**: Granular permissions for different staff types
- **Multi-Tenant Architecture**: Support for multiple facilities in one instance

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React + Vite  │    │  Django + DRF   │    │   PostgreSQL    │
│    Frontend     │◄──►│     Backend     │◄──►│    Database     │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │     Celery      │◄──►│      Redis      │
                    │  Background     │    │     Cache       │
                    │     Tasks       │    │   Port: 6379    │
                    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.9+ (for local development)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)

### 1. Setup the System
```bash
# Clone and navigate to the project
cd /home/lawrence/kenya_health_system

# Make setup script executable
chmod +x setup_system.sh

# Run setup
./setup_system.sh
```

### 2. Start All Services
```bash
# Start with Docker Compose (Recommended)
docker-compose up --build

# Or start in background
docker-compose up --build -d
```

### 3. Initialize Kenya Health System
```bash
# Run the setup command
docker-compose exec backend python manage.py setup_kenya_health_system --sample-data

# Create migrations for new models
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### 4. Access the System
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs/

## 📁 Enhanced Project Structure

```
kenya_health_system/
├── core/                           # Main Django application
│   ├── models.py                   # Enhanced models for Kenya health system
│   ├── admin.py                    # Comprehensive admin interface
│   ├── api_views.py               # Enhanced API endpoints
│   ├── serializers.py             # API serializers
│   ├── services.py                # Business logic services
│   ├── tasks.py                   # Celery background tasks
│   └── management/
│       └── commands/
│           └── setup_kenya_health_system.py  # System setup command
├── frontend-vite/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── contexts/             # React contexts
│   │   ├── pages/                # Page components
│   │   └── services/             # API services
│   └── vite.config.ts
├── health_system/                 # Django project settings
│   ├── settings.py               # Enhanced settings
│   ├── celery.py                 # Celery configuration
│   └── urls.py
├── docker-compose.yml             # Docker services configuration
├── requirements.txt               # Python dependencies
└── README_KENYA_HEALTH_SYSTEM.md # This file
```

## 🏥 Health Facility Levels (Kenya Standard)

| Level | Type | Description | Bed Capacity |
|-------|------|-------------|--------------|
| Level 1 | Community | Community health services | 0 |
| Level 2 | Dispensary | Basic outpatient services | 0-10 |
| Level 3 | Health Centre | Outpatient + limited inpatient | 10-30 |
| Level 4 | Sub-County Hospital | Comprehensive services | 30-100 |
| Level 5 | County Hospital | Referral hospital | 100-300 |
| Level 6 | National Hospital | Specialized referral | 300+ |

## 👥 Staff Types Supported

- **Medical Staff**: Doctors, Nurses, Clinical Officers
- **Specialized Staff**: Pharmacists, Lab Technicians, Radiographers
- **Support Staff**: Physiotherapists, Nutritionists, Social Workers
- **Administrative Staff**: Administrators, Receptionists
- **Service Staff**: Security, Cleaners, Drivers

## 📊 API Endpoints

### Health Facility Management
- `GET/POST /api/facilities/` - Health facilities
- `GET/POST /api/departments/` - Hospital departments
- `GET/POST /api/staff/` - Staff profiles

### Inter-Doctor System
- `GET/POST /api/doctor-availability/` - Doctor availability slots
- `GET/POST /api/shift-bookings/` - Shift bookings
- `PUT /api/shift-bookings/{id}/status/` - Update booking status

### Surgery Management
- `GET/POST /api/surgeries/` - Surgery schedules
- `GET /api/operating-rooms/available/` - Available operating rooms
- `PUT /api/surgeries/{id}/status/` - Update surgery status

### Virtual Pharmacy
- `POST /api/virtual-pharmacist/consultation/` - AI consultations
- `POST /api/pharmacy/interactions/` - Drug interaction checks
- `GET /api/inventory/alerts/` - Stock alerts

### Enhanced Patient Management
- `GET/POST /api/patient-insurance/` - Insurance information
- `GET/POST/PUT /api/medical-history/{client_id}/` - Medical history

### Payment System
- `POST /api/payments/initiate/` - Initiate payments
- `POST /api/payments/{provider}/callback/` - Payment callbacks
- `GET /api/payments/history/{client_id}/` - Payment history

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_NAME=kenya_health_system
DB_USER=system
DB_PASSWORD=system123
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Django
DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_SECRET_KEY=your-secret-key-here

# Payment Providers
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
AIRTEL_CLIENT_ID=your_id
AIRTEL_CLIENT_SECRET=your_secret

# Notifications
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_password
```

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Configure payment provider credentials
3. Set up SSL certificates
4. Configure email/SMS services
5. Run migrations and collect static files
6. Set up monitoring and logging

### Docker Services
- **backend**: Django application server
- **frontend-vite**: React + Vite development server
- **db**: PostgreSQL database
- **redis**: Redis cache and message broker
- **celery**: Background task worker
- **celery-beat**: Periodic task scheduler

## 🔒 Security Features

- **Authentication**: Token-based authentication with JWT
- **Authorization**: Role-based access control
- **Data Protection**: Input validation and SQL injection protection
- **Audit Trail**: Complete system activity logging
- **Payment Security**: Secure payment processing with encryption

## 📈 Background Tasks

- **Appointment Reminders**: Automated SMS/email reminders
- **Inventory Alerts**: Low stock and expiry notifications
- **Payment Processing**: Asynchronous payment handling
- **Report Generation**: Automated report generation
- **Data Cleanup**: Periodic data maintenance

## 🧪 Testing

```bash
# Run backend tests
docker-compose exec backend python manage.py test

# Run frontend tests
docker-compose exec frontend-vite npm test

# Run all tests
./run_tests.sh
```

## 📞 Support

For technical support or feature requests:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Kenya Health System - Comprehensive Healthcare Management Platform** 🏥🇰🇪

*Built with ❤️ for healthcare providers across Kenya*

## 🎯 Next Steps

1. **Start the system**: `docker-compose up --build`
2. **Initialize data**: `python manage.py setup_kenya_health_system --sample-data`
3. **Create admin user**: `python manage.py createsuperuser`
4. **Access admin panel**: http://localhost:8000/admin
5. **Start managing your health facility!**
