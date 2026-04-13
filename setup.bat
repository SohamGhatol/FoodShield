@echo off
echo ==========================================
echo       FoodShield Setup ^& Run Script
echo ==========================================
echo.
echo [INFO] FoodShield consists of multiple services (Frontend, Backend, DB, ML).
echo To start all services, Docker is required.
echo.

:: Check if Docker is running
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is NOT running or not installed.
    echo Please start Docker Desktop and run this script again.
    pause
    exit /b
)

echo Calling run_docker.bat to build and start all containers...
call run_docker.bat

