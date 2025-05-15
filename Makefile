.PHONY: help install dev test lint clean build deploy

help:
	@echo "Available commands:"
	@echo "install  - Install dependencies"
	@echo "dev      - Start development environment"
	@echo "test     - Run tests"
	@echo "lint     - Run linting"
	@echo "clean    - Clean up environment"
	@echo "build    - Build for production"
	@echo "deploy   - Deploy to production"

install:
	pip install -r requirements.txt
	cd frontend && npm install

dev:
	docker-compose up --build

test:
	docker-compose exec backend pytest
	docker-compose exec frontend npm test

lint:
	docker-compose exec backend flake8
	docker-compose exec backend black .
	docker-compose exec frontend npm run lint

clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name "*.egg" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name ".coverage" -exec rm -r {} +
	find . -type d -name "htmlcov" -exec rm -r {} +
	rm -rf frontend/build
	rm -rf frontend/node_modules

build:
	docker-compose -f docker-compose.prod.yml build

deploy:
	docker-compose -f docker-compose.prod.yml up -d 