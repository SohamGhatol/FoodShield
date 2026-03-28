@echo off
echo ==========================================
echo       FoodShield Docker Launcher
echo ==========================================
echo.

:: Check if Docker is running
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is NOT running. Please start Docker Desktop.
    pause
    exit /b
)

echo [1/3] Cleaning up old containers...
docker-compose down

echo [2/3] Building and Starting Containers...
echo (This requires internet and might take a few minutes for the first time)
echo.

docker-compose up --build -d

if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose failed.
    pause
    exit /b
)

echo.
echo [SUCCESS] Application Started!
echo ------------------------------------------
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo Database: localhost:5433 (User: postgres, Pass: password)
echo ------------------------------------------
echo.
echo Logs are following below (Press Ctrl+C to stop logs):
echo.
docker-compose logs -f
