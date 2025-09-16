# Health Hub - Advanced Healthcare Management System 🏥

A comprehensive, modern healthcare management system with AI-powered virtual pharmacist, payment integration, telemedicine capabilities, and advanced appointment scheduling. Built with Django REST Framework and React + Vite.

## 🚀 New Features

### ✅ Virtual Pharmacist
- AI-powered drug interaction checking
- Prescription safety validation
- Drug recommendations based on symptoms
- Contraindication warnings

### ✅ Enhanced Appointment System
- Advanced scheduling with time slots
- Telemedicine integration
- Automated reminders
- Multiple appointment types

### ✅ Payment Integration
- M-Pesa integration
- Airtel Money support
- Multiple payment methods (Card, Cash, Insurance)
- Payment history tracking

### ✅ Pharmacy Inventory Management
- Stock level monitoring
- Expiry date tracking
- Low stock alerts
- Batch management

### ✅ Admin Dashboard
- Comprehensive analytics
- User management
- System monitoring
- Report generation

### ✅ Modern Architecture
- React + Vite frontend (replacing react-scripts)
- Enhanced Django backend
- Celery for background tasks
- Redis for caching
- Docker containerization

## Prerequisites

- Docker and Docker Compose (recommended)
- Python 3.9+ (for local development)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)

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

## 🚀 Quick Start (Recommended)

1. **Setup the system:**
   ```bash
   ./setup_system.sh
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin
   - API Documentation: http://localhost:8000/api/docs/

4. **Default Admin Credentials:**
   - Username: `admin`
   - Password: `admin123`
   - Email: `admin@healthhub.com`

## 🐳 Docker Services

The system runs with the following containerized services:

- **backend**: Django application server
- **frontend-vite**: React + Vite development server
- **db**: PostgreSQL database
- **redis**: Redis cache and message broker
- **celery**: Background task worker
- **celery-beat**: Periodic task scheduler

### Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up --build -d

# Stop services
docker-compose down

# Remove all data (including database)
docker-compose down -v

# View logs
docker-compose logs -f [service-name]

# Execute commands in containers
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py setup_initial_data
```

## 🔧 Environment Variables

### Backend Environment Variables
```bash
# Database
DB_NAME=system
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
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
AIRTEL_CLIENT_ID=your_id
AIRTEL_CLIENT_SECRET=your_secret

# Notifications
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_password
```

### Frontend Environment Variables
```bash
VITE_API_URL=http://localhost:8000
NODE_ENV=development
```

## 📁 Project Structure

```
health-hub/
├── frontend-vite/          # React + Vite frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── main.tsx        # Entry point
│   ├── public/
│   ├── vite.config.ts      # Vite configuration
│   └── package.json
├── health_system/          # Django project settings
│   ├── settings.py         # Enhanced settings
│   ├── celery.py          # Celery configuration
│   └── urls.py
├── core/                   # Main Django application
│   ├── models.py          # Enhanced models
│   ├── services.py        # Business logic services
│   ├── api_views.py       # Enhanced API views
│   ├── serializers.py     # API serializers
│   ├── tasks.py           # Celery tasks
│   ├── admin.py           # Admin interface
│   └── management/        # Management commands
├── requirements.txt        # Python dependencies
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Backend Dockerfile
├── setup_system.sh        # Setup script
└── README_OPTIMIZED.md    # Detailed documentation
```

## 📊 Enhanced API Endpoints

### Authentication
- `POST /api/auth/token/` - User authentication
- `POST /api/auth/register/` - User registration
- `GET /api/auth/user/` - User profile

### Virtual Pharmacist
- `POST /api/pharmacy/interactions/` - Check drug interactions
- `POST /api/pharmacy/recommendations/` - Get drug recommendations
- `POST /api/pharmacy/validate/` - Validate prescription safety

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/{doctor_id}/{date}/slots/` - Available slots
- `PUT /api/appointments/{id}/status/` - Update appointment status

### Payments
- `POST /api/payments/initiate/` - Initiate payment
- `POST /api/payments/{provider}/callback/` - Payment callback
- `GET /api/payments/history/{client_id}/` - Payment history

### Pharmacy Inventory
- `GET /api/inventory/` - Pharmacy inventory
- `GET /api/inventory/alerts/` - Stock alerts
- `POST /api/inventory/{id}/stock/` - Update stock

### Enhanced Prescriptions
- `GET /api/prescriptions/enhanced/` - List prescriptions
- `POST /api/prescriptions/enhanced/` - Create prescription
- `PUT /api/prescriptions/{id}/dispense/` - Dispense prescription

### Dashboard
- `GET /api/dashboard/analytics/` - Dashboard analytics

### Legacy Endpoints
- `/api/clients/` - Client management
- `/api/programs/` - Health programs
- `/api/reports/` - Report generation

## 🔧 Key Features & Services

### VirtualPharmacistService
- Drug interaction checking
- Prescription safety validation
- Symptom-based recommendations

### PaymentService
- M-Pesa STK Push integration
- Airtel Money processing
- Payment callback handling

### AppointmentService
- Slot availability checking
- Automated scheduling
- Reminder notifications

### InventoryService
- Stock level monitoring
- Expiry tracking
- Automated alerts

## 📱 Frontend Features (React + Vite)

- Modern TypeScript setup
- Material-UI components
- React Query for data fetching
- React Hook Form for forms
- Framer Motion animations
- Hot module replacement
- Fast build times with Vite

## 🔒 Security Features

- Token-based authentication
- CORS configuration
- Input validation
- SQL injection protection
- XSS prevention
- Secure payment processing

## 📈 Background Tasks

- Appointment reminders
- Prescription expiry checks
- Inventory alerts
- Payment status updates
- Daily report generation

## 🔧 Local Development Setup

For local development without Docker:

### Backend Setup
```bash
# Create virtual environment
python -m venv env
source env/bin/activate  # Windows: .\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
createdb healthhub
export DB_NAME=healthhub
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost

# Run migrations
python manage.py migrate
python manage.py setup_initial_data

# Start server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend
cd frontend-vite

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🐛 Troubleshooting

### Docker Issues
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart services
docker-compose restart [service-name]

# Clean rebuild
docker-compose down -v
docker-compose up --build
```

### Database Issues
```bash
# Reset database
docker-compose exec backend python manage.py flush
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py setup_initial_data
```

### Frontend Issues
```bash
# Clean install
cd frontend-vite
rm -rf node_modules
npm install
```

## 🚀 Production Deployment

1. Update environment variables for production
2. Configure payment provider credentials
3. Set up SSL certificates
4. Configure email/SMS services
5. Run migrations and collect static files
6. Set up monitoring and logging

## 📞 Support

For technical support or feature requests:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Health Hub System - Advanced Healthcare Management** 🏥

*Built with ❤️ for modern healthcare providers*
