# Development Startup Script for Windows PowerShell
Write-Host "Starting SentimentSage Development Environment..." -ForegroundColor Green

# Check if MongoDB is installed and running
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version
    Write-Host "MongoDB found:" -ForegroundColor Green
    Write-Host $mongoVersion -ForegroundColor Cyan
    
    # Start MongoDB in background
    Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
    Start-Process -FilePath "mongod" -ArgumentList "--dbpath", "$pwd\data\db" -WindowStyle Minimized
    Start-Sleep -Seconds 3
} catch {
    Write-Host "MongoDB not found or failed to start. Please install MongoDB Community Edition." -ForegroundColor Red
    Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

# Install backend dependencies if needed
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path ".\backend"
pip install -r requirements.txt

# Start backend server
Write-Host "Starting backend server on port 8080..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "python" -ArgumentList "app.py" -PassThru -WindowStyle Minimized

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Go back to root and start frontend
Set-Location -Path ".."
Write-Host "Starting frontend development server on port 3000..." -ForegroundColor Yellow
Set-Location -Path ".\frontend"
npm run dev

# Cleanup
Write-Host "Shutting down services..." -ForegroundColor Yellow
Stop-Process -Id $backend.Id -Force