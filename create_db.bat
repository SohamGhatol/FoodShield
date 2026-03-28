@echo off
set "PG_PATH=C:\Program Files\PostgreSQL\18\bin"
set "PGPASSWORD=postgres"

echo ==========================================
echo       FoodShield Database Creator
echo ==========================================
echo.
echo Using PostgreSQL at: %PG_PATH%

"%PG_PATH%\psql.exe" -U postgres -c "SELECT 1" >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Default password 'postgres' failed.
    echo Please enter your PostgreSQL password below:
    set /p PGPASSWORD=Password: 
)

echo.
echo Creating database 'foodshield_db'...
"%PG_PATH%\createdb.exe" -U postgres foodshield_db

if %errorlevel% equ 0 (
    echo [SUCCESS] Database created!
) else (
    echo [INFO] Database might already exist or creation failed.
)

pause
