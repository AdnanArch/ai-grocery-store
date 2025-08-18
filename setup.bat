@echo off
setlocal enabledelayedexpansion

echo 🚀 AI Grocery Store Setup Script
echo ==================================

REM Check if Docker is installed
echo [SETUP] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [INFO] Docker and Docker Compose are installed.

REM Check if .env file exists
echo [SETUP] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file not found. Creating from template...
    if exist "env.example" (
        copy "env.example" ".env" >nul
        echo [INFO] .env file created from template.
        echo [WARNING] Please edit .env file with your actual configuration values.
        echo.
        echo Required steps:
        echo 1. Edit .env file with your database credentials
        echo 2. Add your JWT secret key
        echo 3. Configure Stripe API keys
        echo 4. Set up email credentials
        echo.
        pause
    ) else (
        echo [ERROR] env.example file not found. Cannot create .env file.
        pause
        exit /b 1
    )
) else (
    echo [INFO] .env file already exists.
)

REM Generate JWT key if needed
echo [SETUP] Generating JWT secret key...
for /f "tokens=2 delims==" %%a in ('findstr "JWT_KEY=" .env') do set JWT_CURRENT=%%a
if "!JWT_CURRENT!"=="your_jwt_secret_key_here_make_it_long_and_secure_at_least_256_bits" (
    REM Generate a secure JWT key (simplified for Windows)
    set JWT_KEY=!RANDOM!!RANDOM!!RANDOM!!RANDOM!!RANDOM!!RANDOM!!RANDOM!!RANDOM!
    powershell -Command "(Get-Content .env) -replace 'JWT_KEY=.*', 'JWT_KEY=!JWT_KEY!' | Set-Content .env"
    echo [INFO] JWT secret key generated and configured.
) else (
    echo [INFO] JWT key already configured.
)

REM Check ports availability
echo [SETUP] Checking port availability...
set CONFLICTS=
for %%p in (3000 8080 5000 3307 8081) do (
    netstat -an | find "%%p" | find "LISTENING" >nul
    if not errorlevel 1 (
        set CONFLICTS=!CONFLICTS! %%p
    )
)

if not "!CONFLICTS!"=="" (
    echo [WARNING] The following ports are already in use:!CONFLICTS!
    echo [WARNING] You may need to stop conflicting services or change ports in .env file.
    set /p CONTINUE="Continue anyway? (y/N): "
    if /i not "!CONTINUE!"=="y" exit /b 1
) else (
    echo [INFO] All required ports are available.
)

REM Build and start services
echo [SETUP] Building and starting services...

echo [INFO] Stopping existing containers...
docker-compose down --remove-orphans >nul 2>&1

echo [INFO] Building Docker images...
docker-compose build --no-cache

echo [INFO] Starting services...
docker-compose up -d

echo [INFO] Services are starting up...
echo [INFO] This may take a few minutes for the first run.

REM Wait for services to be ready
echo [SETUP] Waiting for services to be ready...

echo [INFO] Waiting for MySQL...
set TIMEOUT=60
:mysql_wait
docker-compose exec -T mysql mysqladmin ping -h"localhost" --silent >nul 2>&1
if errorlevel 1 (
    if !TIMEOUT! leq 0 (
        echo [ERROR] MySQL failed to start within 60 seconds.
        pause
        exit /b 1
    )
    timeout /t 2 /nobreak >nul
    set /a TIMEOUT-=2
    goto mysql_wait
)
echo [INFO] MySQL is ready.

echo [INFO] Waiting for Backend API...
set TIMEOUT=120
:backend_wait
curl -f http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    if !TIMEOUT! leq 0 (
        echo [ERROR] Backend API failed to start within 120 seconds.
        pause
        exit /b 1
    )
    timeout /t 3 /nobreak >nul
    set /a TIMEOUT-=3
    goto backend_wait
)
echo [INFO] Backend API is ready.

echo [INFO] Waiting for Frontend...
set TIMEOUT=60
:frontend_wait
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    if !TIMEOUT! leq 0 (
        echo [ERROR] Frontend failed to start within 60 seconds.
        pause
        exit /b 1
    )
    timeout /t 3 /nobreak >nul
    set /a TIMEOUT-=3
    goto frontend_wait
)
echo [INFO] Frontend is ready.

REM Show final status
echo [SETUP] Setup Complete!
echo.
echo 🎉 Your AI Grocery Store is now running!
echo.
echo 📱 Access your application:
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:8080
echo    AI Service:   http://localhost:5000
echo    phpMyAdmin:   http://localhost:8081
echo.
echo 🔧 Useful commands:
echo    View logs:    docker-compose logs -f
echo    Stop:         docker-compose down
echo    Restart:      docker-compose restart
echo    Status:       docker-compose ps
echo.
echo 📚 Next steps:
echo    1. Visit http://localhost:3000 to access the application
echo    2. Register a new account
echo    3. Explore the features
echo.
echo [INFO] Happy coding! 🚀
pause
