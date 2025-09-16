#!/bin/bash

# Kenya Health System Setup Script
# This script sets up the complete Kenya Health System environment

set -e

echo "🏥 Kenya Health System Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_header "Checking Dependencies"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed ✓"
}

# Create necessary directories
create_directories() {
    print_header "Creating Directory Structure"
    
    mkdir -p data/logs
    mkdir -p data/postgres/backups
    mkdir -p media/uploads
    mkdir -p static/admin
    
    print_status "Directory structure created ✓"
}

# Setup environment file
setup_environment() {
    print_header "Setting Up Environment"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_status "Environment file created from template"
        print_warning "Please edit .env file with your actual configuration values"
    else
        print_status "Environment file already exists"
    fi
}

# Build and start services
start_services() {
    print_header "Building and Starting Services"
    
    print_status "Building Docker images..."
    docker-compose build
    
    print_status "Starting services..."
    docker-compose up -d db redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Start remaining services
    docker-compose up -d
    
    print_status "All services started ✓"
}

# Run database migrations and setup
setup_database() {
    print_header "Setting Up Database"
    
    print_status "Running database migrations..."
    docker-compose exec backend python manage.py migrate
    
    print_status "Setting up Kenya Health System data..."
    docker-compose exec backend python manage.py setup_kenya_health_system --sample-data
    
    print_status "Creating superuser..."
    docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
from core.models import StaffProfile, HealthFacility
User = get_user_model()
if not User.objects.filter(email='admin@kenyahealth.system').exists():
    admin = User.objects.create_superuser(
        email='admin@kenyahealth.system',
        password='KenyaHealth2024!',
        first_name='System',
        last_name='Administrator',
        user_type='admin'
    )
    # Create admin staff profile
    facility = HealthFacility.objects.first()
    if facility:
        StaffProfile.objects.create(
            user=admin,
            facility=facility,
            employee_id='ADMIN001',
            position='System Administrator',
            is_active=True
        )
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"
    
    print_status "Database setup completed ✓"
}

# Install frontend dependencies and build
setup_frontend() {
    print_header "Setting Up Frontend"
    
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        docker-compose exec frontend npm install
        
        print_status "Frontend setup completed ✓"
    else
        print_warning "Frontend directory not found. Skipping frontend setup."
    fi
}

# Display final information
display_info() {
    print_header "Setup Complete!"
    
    echo -e "\n${GREEN}🎉 Kenya Health System is now running!${NC}\n"
    
    echo "📱 Access Points:"
    echo "  • Backend API: http://localhost:8000"
    echo "  • Frontend App: http://localhost:3000"
    echo "  • Admin Panel: http://localhost:8000/admin"
    echo "  • API Documentation: http://localhost:8000/swagger/"
    
    echo -e "\n🔐 Default Admin Credentials:"
    echo "  • Email: admin@kenyahealth.system"
    echo "  • Password: KenyaHealth2024!"
    
    echo -e "\n🛠️  Useful Commands:"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Restart services: docker-compose restart"
    echo "  • Access backend shell: docker-compose exec backend python manage.py shell"
    
    echo -e "\n📊 Services Status:"
    docker-compose ps
    
    echo -e "\n${YELLOW}⚠️  Important Notes:${NC}"
    echo "  • Update .env file with your actual configuration"
    echo "  • Configure payment providers (M-Pesa, Airtel)"
    echo "  • Set up email and SMS services"
    echo "  • Review security settings for production"
    
    echo -e "\n${GREEN}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    check_dependencies
    create_directories
    setup_environment
    start_services
    setup_database
    setup_frontend
    display_info
}

# Handle script interruption
trap 'print_error "Setup interrupted. Run docker-compose down to clean up."; exit 1' INT

# Run main function
main "$@"
