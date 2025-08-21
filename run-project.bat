@echo off
setlocal enabledelayedexpansion
echo.
echo ========================================
echo   AI Grocery Store - Project Runner
echo ========================================
echo.

:: Check if Docker is running
echo [INFO] Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

:: Check if Docker Compose is available
echo [INFO] Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not available. Please install Docker Compose.
    pause
    exit /b 1
)

:: Check for port conflicts
echo [INFO] Checking for port conflicts...
netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 3000 is already in use. Stopping conflicting services...
    taskkill /f /im node.exe >nul 2>&1
)

netstat -an | findstr ":8080" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 8080 is already in use. Stopping conflicting services...
    taskkill /f /im java.exe >nul 2>&1
)

netstat -an | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 5000 is already in use. Stopping conflicting services...
    taskkill /f /im python.exe >nul 2>&1
)

:: Check if containers exist and ask user about cleanup
echo [INFO] Checking for existing containers...
docker-compose ps --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Found existing containers. Choose cleanup level:
    echo 1. Standard cleanup (stop and remove containers)
    echo 2. Full cleanup (stop, remove containers, and clean Docker system)
    echo 3. Skip cleanup (keep existing containers)
    echo.
    set /p cleanup_choice="Enter your choice (1-3): "
    
    if "!cleanup_choice!"=="1" (
        echo [INFO] Performing standard cleanup...
        docker-compose down --remove-orphans
    ) else if "!cleanup_choice!"=="2" (
        echo [INFO] Performing full cleanup...
        docker-compose down --remove-orphans --volumes
        docker system prune -f
    ) else (
        echo [INFO] Skipping cleanup, keeping existing containers...
    )
) else (
    echo [INFO] No existing containers found, proceeding with fresh build...
)

:: Build and start all services with optimization
echo [INFO] Building and starting all services...
docker-compose up --build -d --no-deps

:: Check if services started successfully
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services. Check the logs above for errors.
    echo [INFO] Common solutions:
    echo   - Make sure Docker Desktop is running
    echo   - Check if ports are already in use
    echo   - Try running: docker-compose down --remove-orphans
    pause
    exit /b 1
)

:: Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 15 /nobreak >nul

:: Display service status
echo.
echo [SUCCESS] All services started successfully!
echo.
echo ========================================
echo   Service URLs
echo ========================================
echo Frontend:     http://localhost:3000
echo Backend API:  http://localhost:8080/api
echo AI Service:   http://localhost:5000
echo phpMyAdmin:   http://localhost:8081
echo.
echo ========================================
echo   Database Access
echo ========================================
echo Host:     localhost
echo Port:     3307 (Changed from 3306 to avoid conflicts)
echo Database: grocerystore
echo Username: root
echo Password: admin
echo.
echo ========================================
echo   Testing Instructions
echo ========================================
echo 1. Open http://localhost:3000 in your browser
echo 2. Register a new account or login
echo 3. Browse products and test the application
echo 4. Use Stripe test cards for payments:
echo    - Success: 4242 4242 4242 4242
echo    - Decline: 4000 0000 0000 0002
echo.
echo ========================================
echo   Useful Commands
echo ========================================
echo View logs:        docker-compose logs -f
echo Stop services:    docker-compose down
echo Restart services: docker-compose restart
echo Check status:     docker-compose ps
echo.
echo [INFO] Press Ctrl+C to stop all services
echo.

:: Keep the window open and show logs
docker-compose logs -f
