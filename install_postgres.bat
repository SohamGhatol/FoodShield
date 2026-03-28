@echo off
echo ==========================================
echo       PostgreSQL Installer Helper
echo ==========================================
echo.

:: 1. Check if psql is already installed
where psql >nul 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] PostgreSQL is already installed!
    echo.
    psql --version
    echo.
    echo detailed connection info:
    echo Host: localhost
    echo Port: 5432
    echo User: postgres
    echo.
    pause
    exit /b
)

echo [INFO] PostgreSQL is NOT detected throughout system PATH.
echo.
echo ==========================================
echo       Installation Instructions
echo ==========================================
echo.
echo 1. Download the installer from:
echo    https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe
echo.
echo 2. Run the installer.
echo    [IMPORTANT] When asked for a password, enter: 'postgres' (or remember what you type!)
echo.
echo 3. Keep the default port as 5432.
echo.
echo 4. After installing, re-run this script to verify.
echo.
start https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
pause
