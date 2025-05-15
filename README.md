# Health Hub System

A comprehensive healthcare management system built with Django REST Framework and React.

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 15+
- Docker and Docker Compose (for containerized setup)

## Local Development Setup

### Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv env
source env/bin/activate  # On Windows: .\env\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL database:
```bash
# Create database
createdb healthhub

# Configure database settings in health_system/settings.py or use environment variables:
export DB_NAME=healthhub
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the Django development server:
```bash
python manage.py runserver
```
The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
npm install
```

3. Start the development server:
```bash
npm start
```
The frontend will be available at http://localhost:3000

## Docker Setup

The application can be run using Docker and Docker Compose, which will set up all services (frontend, backend, and database) automatically.

### Prerequisites
- Docker
- Docker Compose

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd health-hub
```

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

This will:
- Start PostgreSQL database on port 5432
- Start Django backend on port 8000
- Start React frontend on port 3000

To stop the services:
```bash
docker-compose down
```

To remove all data (including database volumes):
   ```bash
docker-compose down -v
   ```

### Accessing the Application

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs/

## Environment Variables

### Backend Environment Variables
```
DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_SECRET_KEY=your-secret-key-here
DB_NAME=healthhub
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
```

### Frontend Environment Variables
```
REACT_APP_API_URL=http://localhost:8000
NODE_ENV=development
```

## Project Structure

```
health-hub/
├── frontend/                # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── health_system/          # Django project settings
├── core/                   # Main Django application
├── requirements.txt        # Python dependencies
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Backend Dockerfile
└── frontend/Dockerfile    # Frontend Dockerfile
```

## Available API Endpoints

- `/api/auth/login/` - User authentication
- `/api/auth/register/` - User registration
- `/api/clients/` - Client management
- `/api/programs/` - Health programs
- `/api/prescriptions/` - Prescription management
- `/api/reports/` - Report generation

## Development Guidelines

1. Always create feature branches from `main`
2. Follow PEP 8 style guide for Python code
3. Use ESLint and Prettier for JavaScript/React code
4. Write tests for new features
5. Update documentation when adding new features

## Troubleshooting

### Common Issues

1. Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db
```

2. Frontend Build Issues
```bash
# Clean install dependencies
cd frontend
rm -rf node_modules
npm install
```

3. Backend Migration Issues
```bash
# Reset migrations
docker-compose exec backend python manage.py migrate --fake-initial
```

## License

[MIT License](LICENSE)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
