@echo off
setlocal enabledelayedexpansion

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Default values
set MODE=prod
set BUILD=false

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse_args
if "%~1"=="-d" set MODE=dev
if "%~1"=="--dev" set MODE=dev
if "%~1"=="-p" set MODE=prod
if "%~1"=="--prod" set MODE=prod
if "%~1"=="-b" set BUILD=true
if "%~1"=="--build" set BUILD=true
if "%~1"=="-h" goto :show_help
if "%~1"=="--help" goto :show_help
shift
goto :parse_args
:end_parse_args

REM Start the application based on the selected mode
if "%MODE%"=="dev" (
    echo Starting SentimentSage in development mode...
    if "%BUILD%"=="true" (
        docker-compose -f docker-compose.dev.yml up --build
    ) else (
        docker-compose -f docker-compose.dev.yml up
    )
) else (
    echo Starting SentimentSage in production mode...
    if "%BUILD%"=="true" (
        docker-compose up --build
    ) else (
        docker-compose up
    )
)

exit /b 0

:show_help
echo Usage: start-docker.bat [OPTIONS]
echo.
echo Options:
echo   -d, --dev       Start in development mode
echo   -p, --prod      Start in production mode (default)
echo   -b, --build     Build containers before starting
echo   -h, --help      Show this help message
echo.
exit /b 0
