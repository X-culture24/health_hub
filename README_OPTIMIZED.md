# Health Hub - Optimized Healthcare Management System

A comprehensive healthcare management system with enhanced features including virtual pharmacist, appointment scheduling, payment integration, and telemedicine capabilities.

## 🚀 New Features Added

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
- Multiple payment methods
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

## 🛠️ Quick Start with Docker

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

## 📊 Key Models & Features

### Enhanced Models
- **Appointment**: Advanced scheduling with telemedicine support
- **Drug**: Comprehensive drug database with interactions
- **PharmacyInventory**: Stock management with alerts
- **EnhancedPrescription**: Safety checks and dispensing tracking
- **Payment**: Multi-provider payment processing
- **TelemedicineSession**: Video consultation management

### API Endpoints
```
# Virtual Pharmacist
POST /api/pharmacy/interactions/     # Check drug interactions
POST /api/pharmacy/recommendations/  # Get drug recommendations
POST /api/pharmacy/validate/         # Validate prescription

# Appointments
GET  /api/appointments/              # List appointments
POST /api/appointments/              # Create appointment
GET  /api/appointments/{id}/{date}/slots/  # Available slots

# Payments
POST /api/payments/initiate/         # Initiate payment
POST /api/payments/{provider}/callback/    # Payment callback
GET  /api/payments/history/{client_id}/    # Payment history

# Inventory
GET  /api/inventory/                 # Pharmacy inventory
GET  /api/inventory/alerts/          # Stock alerts
POST /api/inventory/{id}/stock/      # Update stock

# Dashboard
GET  /api/dashboard/analytics/       # Dashboard data
```

## 🔧 Services Architecture

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

## 🐳 Docker Services

- **backend**: Django application server
- **frontend**: React + Vite development server
- **db**: PostgreSQL database
- **redis**: Redis cache and message broker
- **celery**: Background task worker
- **celery-beat**: Periodic task scheduler

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

## 🚀 Production Deployment

1. Update environment variables
2. Configure payment provider credentials
3. Set up SSL certificates
4. Configure email/SMS services
5. Run migrations and collect static files

## 🔧 Environment Variables

```bash
# Database
DB_NAME=system
DB_USER=system
DB_PASSWORD=system123
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

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

## 📞 Support

For technical support or feature requests, contact the development team.

---

**Health Hub System - Optimized for modern healthcare management** 🏥
