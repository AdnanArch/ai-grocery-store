#!/bin/bash

# AI Grocery Store Setup Script
# This script helps you set up the project for development or production

set -e

echo "🚀 AI Grocery Store Setup Script"
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
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_header "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed."
}

# Check if .env file exists
check_env_file() {
    print_header "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_status ".env file created from template."
            print_warning "Please edit .env file with your actual configuration values."
            echo ""
            echo "Required steps:"
            echo "1. Edit .env file with your database credentials"
            echo "2. Add your JWT secret key"
            echo "3. Configure Stripe API keys"
            echo "4. Set up email credentials"
            echo ""
            read -p "Press Enter after you've configured the .env file..."
        else
            print_error "env.example file not found. Cannot create .env file."
            exit 1
        fi
    else
        print_status ".env file already exists."
    fi
}

# Generate JWT key
generate_jwt_key() {
    print_header "Generating JWT secret key..."
    
    # Check if JWT_KEY is already set in .env
    if grep -q "JWT_KEY=" .env; then
        JWT_CURRENT=$(grep "JWT_KEY=" .env | cut -d'=' -f2)
        if [ "$JWT_CURRENT" != "your_jwt_secret_key_here_make_it_long_and_secure_at_least_256_bits" ]; then
            print_status "JWT key already configured."
            return
        fi
    fi
    
    # Generate a secure JWT key
    JWT_KEY=$(openssl rand -base64 64)
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_KEY=.*/JWT_KEY=$JWT_KEY/" .env
    else
        # Linux
        sed -i "s/JWT_KEY=.*/JWT_KEY=$JWT_KEY/" .env
    fi
    
    print_status "JWT secret key generated and configured."
}

# Check ports availability
check_ports() {
    print_header "Checking port availability..."
    
    PORTS=(3000 8080 5000 3307 8081)
    CONFLICTS=()
    
    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            CONFLICTS+=($port)
        fi
    done
    
    if [ ${#CONFLICTS[@]} -ne 0 ]; then
        print_warning "The following ports are already in use: ${CONFLICTS[*]}"
        print_warning "You may need to stop conflicting services or change ports in .env file."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_status "All required ports are available."
    fi
}

# Build and start services
start_services() {
    print_header "Building and starting services..."
    
    # Stop any existing containers
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Build and start services
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    print_status "Starting services..."
    docker-compose up -d
    
    print_status "Services are starting up..."
    print_status "This may take a few minutes for the first run."
}

# Wait for services to be ready
wait_for_services() {
    print_header "Waiting for services to be ready..."
    
    # Wait for MySQL
    print_status "Waiting for MySQL..."
    timeout=60
    while ! docker-compose exec -T mysql mysqladmin ping -h"localhost" --silent 2>/dev/null; do
        if [ $timeout -le 0 ]; then
            print_error "MySQL failed to start within 60 seconds."
            exit 1
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    print_status "MySQL is ready."
    
    # Wait for Backend
    print_status "Waiting for Backend API..."
    timeout=120
    while ! curl -f http://localhost:8080/api/health 2>/dev/null; do
        if [ $timeout -le 0 ]; then
            print_error "Backend API failed to start within 120 seconds."
            exit 1
        fi
        sleep 3
        timeout=$((timeout-3))
    done
    print_status "Backend API is ready."
    
    # Wait for Frontend
    print_status "Waiting for Frontend..."
    timeout=60
    while ! curl -f http://localhost:3000 2>/dev/null; do
        if [ $timeout -le 0 ]; then
            print_error "Frontend failed to start within 60 seconds."
            exit 1
        fi
        sleep 3
        timeout=$((timeout-3))
    done
    print_status "Frontend is ready."
}

# Show final status
show_status() {
    print_header "Setup Complete!"
    echo ""
    echo "🎉 Your AI Grocery Store is now running!"
    echo ""
    echo "📱 Access your application:"
    echo "   Frontend:     http://localhost:3000"
    echo "   Backend API:  http://localhost:8080"
    echo "   AI Service:   http://localhost:5000"
    echo "   phpMyAdmin:   http://localhost:8081"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop:         docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo "   Status:       docker-compose ps"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Visit http://localhost:3000 to access the application"
    echo "   2. Register a new account"
    echo "   3. Explore the features"
    echo ""
    print_status "Happy coding! 🚀"
}

# Main setup function
main() {
    check_docker
    check_env_file
    generate_jwt_key
    check_ports
    start_services
    wait_for_services
    show_status
}

# Handle script arguments
case "${1:-}" in
    "prod")
        print_header "Setting up for production..."
        export COMPOSE_FILE=docker-compose.prod.yml
        main
        ;;
    "dev"|"")
        print_header "Setting up for development..."
        main
        ;;
    "clean")
        print_header "Cleaning up containers and volumes..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup complete."
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "stop")
        docker-compose down
        ;;
    "restart")
        docker-compose restart
        ;;
    "status")
        docker-compose ps
        ;;
    *)
        echo "Usage: $0 [dev|prod|clean|logs|stop|restart|status]"
        echo ""
        echo "Commands:"
        echo "  dev     - Setup for development (default)"
        echo "  prod    - Setup for production"
        echo "  clean   - Clean up containers and volumes"
        echo "  logs    - Show service logs"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        exit 1
        ;;
esac
