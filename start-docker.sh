#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to display help
show_help() {
    echo "Usage: ./start-docker.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --dev       Start in development mode"
    echo "  -p, --prod      Start in production mode (default)"
    echo "  -b, --build     Build containers before starting"
    echo "  -h, --help      Show this help message"
    echo ""
}

# Default values
MODE="prod"
BUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dev)
            MODE="dev"
            shift
            ;;
        -p|--prod)
            MODE="prod"
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Start the application based on the selected mode
if [ "$MODE" = "dev" ]; then
    echo "Starting SentimentSage in development mode..."
    if [ "$BUILD" = true ]; then
        docker-compose -f docker-compose.dev.yml up --build
    else
        docker-compose -f docker-compose.dev.yml up
    fi
else
    echo "Starting SentimentSage in production mode..."
    if [ "$BUILD" = true ]; then
        docker-compose up --build
    else
        docker-compose up
    fi
fi
