#!/bin/bash

echo "Setting up Health Hub System..."

# Create directories if they don't exist
mkdir -p data/logs
mkdir -p data/postgres/backups
mkdir -p media
mkdir -p staticfiles

# Set permissions
chmod +x wait-for-db.sh

echo "Health Hub System setup complete!"
echo ""
echo "To start the system:"
echo "1. Run: docker-compose up --build"
echo "2. Access frontend at: http://localhost:3000"
echo "3. Access backend API at: http://localhost:8000"
echo "4. Access admin panel at: http://localhost:8000/admin"
echo ""
echo "Default admin credentials will be created during first run."
