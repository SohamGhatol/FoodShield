@echo off
echo ==========================================
echo       FoodShield GitHub Uploader
echo ==========================================
echo.

:: 1. Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is NOT installed or not in your PATH.
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo After installing, restart your computer or terminal and run this script again.
    echo.
    pause
    exit /b
)

:: 2. Get Repository URL from User
echo [IMPORTANT] You must create an empty repository on GitHub first.
echo Go to https://github.com/new and create a repository named 'FoodShield'.
set repo_url=https://github.com/SohamGhatol/FoodShield.git
echo Repository URL set to: %repo_url%

:: 3. Run Git Commands
echo.
echo [1/6] Initializing Git...
call git init

echo [2/6] Adding files...
call git add .

echo [3/6] Committing changes...
call git commit -m "Initial commit of FoodShield Enterprise Platform"

echo [4/6] Renaming branch to main...
call git branch -M main

echo [5/6] Adding remote origin...
call git remote remove origin >nul 2>nul
call git remote add origin %repo_url%

echo [6/6] Pushing to GitHub...
call git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. 
    echo Possible reasons:
    echo  - You are not logged in (a login window might have popped up).
    echo  - The repository URL is incorrect.
    echo  - The repository is not empty.
    echo.
) else (
    echo.
    echo [SUCCESS] Project uploaded to GitHub successfully!
)

pause
