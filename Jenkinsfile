pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = '.'
        GIT_REPO = 'https://github.com/X-culture24/health_hub.git'
        GIT_BRANCH = 'main'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                script {
                    // Clean workspace
                    deleteDir()
                    
                    // Clone the repository
                    git branch: "${GIT_BRANCH}",
                        url: "${GIT_REPO}"
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo 'Setting up environment variables...'
                    sh '''
                        if [ ! -f .env ]; then
                            cp .env.example .env || echo "No .env.example found"
                        fi
                    '''
                }
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo 'Building Django backend with Docker...'
                            sh '''
                                # Build backend image
                                docker build -t kenya-health-backend .
                                
                                # Verify build
                                docker images | grep kenya-health-backend
                            '''
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo 'Building React frontend with Docker...'
                            sh '''
                                # Build frontend image
                                docker build -t kenya-health-frontend ./frontend
                                
                                # Verify build
                                docker images | grep kenya-health-frontend
                            '''
                        }
                    }
                }
                
                stage('Build Support Services') {
                    steps {
                        script {
                            echo 'Preparing support services...'
                            sh '''
                                # Pull required images for database and cache
                                docker pull postgres:13
                                docker pull redis:alpine
                                
                                # Build celery services using backend image
                                docker tag kenya-health-backend kenya-health-celery
                                docker tag kenya-health-backend kenya-health-celery-beat
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Start Test Environment') {
            steps {
                echo 'Starting test environment with Docker...'
                sh '''
                    # Start database and cache services
                    docker network create kenya-health-network || true
                    
                    docker run -d --name test-postgres --network kenya-health-network \
                        -e POSTGRES_DB=kenya_health_test \
                        -e POSTGRES_USER=postgres \
                        -e POSTGRES_PASSWORD=postgres \
                        -p 5432:5432 postgres:13
                    
                    docker run -d --name test-redis --network kenya-health-network \
                        -p 6379:6379 redis:alpine
                    
                    sleep 15
                '''
            }
        }
        
        stage('Backend Tests') {
            steps {
                echo 'Running Django tests with Docker...'
                sh '''
                    # Run Django tests in container
                    docker run --rm --network kenya-health-network \
                        -e DATABASE_URL=postgresql://postgres:postgres@test-postgres:5432/kenya_health_test \
                        -e REDIS_URL=redis://test-redis:6379/0 \
                        -e DJANGO_SETTINGS_MODULE=health_system.settings \
                        kenya-health-backend \
                        sh -c "python manage.py check && python manage.py test --verbosity=2"
                '''
            }
        }
        
        stage('Frontend Tests') {
            steps {
                echo 'Running React tests with Docker...'
                sh '''
                    # Run frontend tests in container
                    docker run --rm kenya-health-frontend \
                        npm test -- --watchAll=false --coverage --passWithNoTests
                '''
            }
        }
        
        stage('Integration Tests') {
            steps {
                echo 'Running integration tests with Docker...'
                sh '''
                    # Start full application stack
                    docker run -d --name test-backend --network kenya-health-network \
                        -e DATABASE_URL=postgresql://postgres:postgres@test-postgres:5432/kenya_health_test \
                        -e REDIS_URL=redis://test-redis:6379/0 \
                        -p 8000:8000 kenya-health-backend
                    
                    docker run -d --name test-frontend --network kenya-health-network \
                        -p 3000:3000 kenya-health-frontend
                    
                    sleep 30
                    
                    # Run migrations and setup
                    docker exec test-backend python manage.py migrate
                    docker exec test-backend python manage.py collectstatic --noinput
                    
                    # Health checks
                    curl -f http://localhost:8000/api/ || exit 1
                    curl -f http://localhost:3000/ || exit 1
                '''
            }
        }
        
        stage('Security Scan') {
            steps {
                echo 'Running security scans with Docker...'
                sh '''
                    # Backend security check
                    docker run --rm kenya-health-backend python manage.py check --deploy
                    
                    # Frontend security audit
                    docker run --rm kenya-health-frontend npm audit --audit-level=high
                '''
            }
        }
        
        stage('Build Production Images') {
            when {
                branch 'main'
            }
            steps {
                echo 'Building production images...'
                sh '''
                    docker compose -f docker-compose.yml build --no-cache
                    docker compose -f docker-compose.yml up -d
                '''
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to staging environment...'
                sh '''
                    docker compose down
                    docker compose up -d
                    sleep 30
                    
                    # Verify deployment
                    curl -f http://localhost:8000/api/health/ || exit 1
                    curl -f http://localhost:3000/ || exit 1
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up Docker containers and resources...'
            sh '''
                # Stop and remove test containers
                docker stop test-backend test-frontend test-postgres test-redis || true
                docker rm test-backend test-frontend test-postgres test-redis || true
                
                # Remove test network
                docker network rm kenya-health-network || true
                
                # Clean up images and system resources
                docker system prune -f
                docker image prune -f
            '''
        }
        
        success {
            echo 'Pipeline completed successfully!'
            emailext (
                subject: "✅ Kenya Health System - Build Success",
                body: "Build #${BUILD_NUMBER} completed successfully!",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        
        failure {
            echo 'Pipeline failed!'
            emailext (
                subject: "❌ Kenya Health System - Build Failed",
                body: "Build #${BUILD_NUMBER} failed. Check console output for details.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        
        unstable {
            echo 'Pipeline completed with warnings!'
        }
    }
}
