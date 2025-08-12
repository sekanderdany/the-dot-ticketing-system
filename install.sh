#!/bin/bash

# The Dot - Installation and Deployment Script
# This script sets up The Dot microservices application

set -e

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
    echo -e "${BLUE}"
    echo "=================================="
    echo "$1"
    echo "=================================="
    echo -e "${NC}"
}

# Check if running as root
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    # Check for required tools
    local required_tools=("docker" "docker-compose" "kubectl" "helm" "node" "npm")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install the missing tools and run the script again"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node -v | sed 's/v//')
    local required_version="18.0.0"
    
    if ! node -pe "process.exit(require('semver').gte('$node_version', '$required_version') ? 0 : 1)" 2>/dev/null; then
        print_error "Node.js version $node_version is not supported. Minimum required: $required_version"
        exit 1
    fi
    
    print_status "All system requirements met"
}

# Install dependencies for all services
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install service dependencies
    local services=("auth-service" "user-service" "application-service" "ticket-service" "project-service" "comment-service" "reporting-service" "audit-service")
    
    for service in "${services[@]}"; do
        if [ -d "services/$service" ]; then
            print_status "Installing dependencies for $service..."
            cd "services/$service"
            npm install
            
            # Generate Prisma client if schema exists
            if [ -f "prisma/schema.prisma" ]; then
                print_status "Generating Prisma client for $service..."
                npx prisma generate
            fi
            
            cd - > /dev/null
        fi
    done
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd - > /dev/null
    fi
    
    print_status "All dependencies installed successfully"
}

# Setup development environment
setup_development() {
    print_header "Setting Up Development Environment"
    
    # Create environment files
    local services=("auth-service" "user-service" "application-service" "ticket-service" "project-service" "comment-service" "reporting-service" "audit-service")
    
    for service in "${services[@]}"; do
        if [ -d "services/$service" ] && [ -f "services/$service/.env.example" ]; then
            if [ ! -f "services/$service/.env" ]; then
                print_status "Creating .env file for $service..."
                cp "services/$service/.env.example" "services/$service/.env"
            fi
        fi
    done
    
    # Start infrastructure services
    print_status "Starting infrastructure services..."
    docker-compose -f docker-compose.dev.yml up -d postgres redis rabbitmq minio
    
    # Wait for services to be ready
    print_status "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Run database migrations
    for service in "${services[@]}"; do
        if [ -d "services/$service" ] && [ -f "services/$service/prisma/schema.prisma" ]; then
            print_status "Running database migrations for $service..."
            cd "services/$service"
            npx prisma migrate dev --name init || true
            npx prisma db seed || true
            cd - > /dev/null
        fi
    done
    
    print_status "Development environment setup complete"
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"
    
    print_status "Building all Docker images..."
    docker-compose -f docker-compose.dev.yml build
    
    print_status "Docker images built successfully"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    print_header "Deploying to Kubernetes"
    
    # Check if kubectl is configured
    if ! kubectl cluster-info &> /dev/null; then
        print_error "kubectl is not configured. Please configure kubectl to connect to your cluster"
        exit 1
    fi
    
    # Apply Kubernetes manifests
    print_status "Applying Kubernetes manifests..."
    kubectl apply -f k8s/
    
    # Wait for deployments to be ready
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment --all -n the-dot
    
    print_status "Kubernetes deployment completed successfully"
}

# Run tests
run_tests() {
    print_header "Running Tests"
    
    # Run backend tests
    local services=("auth-service" "user-service" "application-service" "ticket-service" "project-service" "comment-service" "reporting-service" "audit-service")
    
    for service in "${services[@]}"; do
        if [ -d "services/$service" ]; then
            print_status "Running tests for $service..."
            cd "services/$service"
            npm test || print_warning "Tests failed for $service"
            cd - > /dev/null
        fi
    done
    
    # Run frontend tests
    if [ -d "frontend" ]; then
        print_status "Running frontend tests..."
        cd frontend
        npm test -- --coverage --watchAll=false || print_warning "Frontend tests failed"
        cd - > /dev/null
    fi
    
    print_status "All tests completed"
}

# Display help
show_help() {
    echo "The Dot - Installation and Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  install     Install dependencies and setup development environment"
    echo "  dev         Start development environment"
    echo "  build       Build Docker images"
    echo "  test        Run all tests"
    echo "  deploy      Deploy to Kubernetes"
    echo "  k8s         Deploy to Kubernetes (alias for deploy)"
    echo "  clean       Clean up development environment"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install     # Install dependencies and setup development"
    echo "  $0 dev         # Start development environment"
    echo "  $0 test        # Run all tests"
    echo "  $0 deploy      # Deploy to Kubernetes"
    echo ""
}

# Start development environment
start_development() {
    print_header "Starting Development Environment"
    
    # Start all services
    print_status "Starting all services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_status "Development environment is running!"
    print_status "Frontend: http://localhost:3000"
    print_status "API Gateway: http://localhost"
    print_status "RabbitMQ Management: http://localhost:15672 (admin/admin123)"
    print_status "MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
    
    # Show logs
    print_status "Showing logs (Ctrl+C to exit)..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Clean up development environment
cleanup_development() {
    print_header "Cleaning Up Development Environment"
    
    print_status "Stopping all services..."
    docker-compose -f docker-compose.dev.yml down -v
    
    print_status "Removing unused Docker resources..."
    docker system prune -f
    
    print_status "Development environment cleaned up"
}

# Main script logic
main() {
    check_privileges
    
    case "${1:-help}" in
        "install")
            check_requirements
            install_dependencies
            setup_development
            ;;
        "dev")
            start_development
            ;;
        "build")
            build_images
            ;;
        "test")
            run_tests
            ;;
        "deploy"|"k8s")
            deploy_kubernetes
            ;;
        "clean")
            cleanup_development
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
