# Makefile for Render Docs Agent

.PHONY: help install dev up down logs clean build test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed"

dev: ## Start development servers (without Docker)
	@echo "Starting backend and frontend..."
	@make -j 2 dev-backend dev-frontend

dev-backend: ## Start backend dev server
	cd backend && npm run dev

dev-frontend: ## Start frontend dev server
	cd frontend && npm run dev

up: ## Start all services with Docker Compose
	docker-compose up -d
	@echo "✅ All services started"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"
	@echo "Database: localhost:5432"

down: ## Stop all Docker services
	docker-compose down
	@echo "✅ All services stopped"

logs: ## View Docker logs
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-db: ## View database logs
	docker-compose logs -f database

build: ## Build all Docker images
	docker-compose build

rebuild: ## Rebuild all Docker images (no cache)
	docker-compose build --no-cache

restart: ## Restart all services
	docker-compose restart

restart-backend: ## Restart backend service
	docker-compose restart backend

restart-frontend: ## Restart frontend service
	docker-compose restart frontend

db-migrate: ## Run database migrations
	cd backend && npm run db:migrate

db-init: ## Initialize database with indexes
	cd backend && npm run db:init

db-reset: ## Reset database
	cd backend && npm run db:reset

db-studio: ## Open Prisma Studio
	cd backend && npm run db:studio

clean: ## Clean all build artifacts and dependencies
	@echo "Cleaning..."
	rm -rf backend/node_modules
	rm -rf backend/dist
	rm -rf frontend/node_modules
	rm -rf frontend/.next
	rm -rf frontend/out
	docker-compose down -v
	@echo "✅ Cleaned"

test: ## Run tests
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

lint: ## Run linters
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

format: ## Format code
	@echo "Formatting backend..."
	cd backend && npm run format
	@echo "Formatting frontend..."
	cd frontend && npm run format

setup: install up db-migrate db-init ## Complete setup (install, start services, migrate DB, initialize)
	@echo "✅ Setup complete!"
	@echo "Visit http://localhost:3000 to get started"

