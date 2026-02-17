@echo off
echo ==========================================
echo       FoodShield Setup & Run Script
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install it from https://nodejs.org/
    pause
    exit /b
)

:: Check for Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed! Please install JDK 21.
    pause
    exit /b
)

echo [1/3] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b
)

echo [2/3] Building Backend (Skipping tests for speed)...
cd ../backend
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo [WARNING] Backend build failed. Ensure Maven is installed and configured.
    echo Proceeding with Frontend only for now...
)

echo.
echo ==========================================
echo       Starting FoodShield...
echo ==========================================
echo.
echo Starting Frontend on http://localhost:5173...
cd ../frontend
npm run dev
