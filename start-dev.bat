@echo off
TITLE SentimentSage Development Environment

echo Starting SentimentSage Development Environment...
echo.

REM Check if MongoDB is installed
echo Checking MongoDB installation...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB not found. Please install MongoDB Community Edition.
    echo Download from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
) else (
    echo MongoDB found.
)

REM Start MongoDB
echo Starting MongoDB...
start "MongoDB" cmd /c "mongod --dbpath "%cd%\data\db""

REM Wait for MongoDB to start
timeout /t 5 /nobreak >nul

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt

REM Start backend server
echo Starting backend server on port 8080...
start "Backend" cmd /c "python app.py"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Go back to root and start frontend
cd ..
echo Starting frontend development server on port 3000...
cd frontend
npm run dev

echo.
echo Development environment started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8080
echo.
pause