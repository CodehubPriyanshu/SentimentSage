# SentimentSage Development Setup

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** installed
3. **MongoDB Community Edition** installed and running
4. **npm** or **yarn** package manager

## Initial Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example and modify as needed)
cp .env.example .env
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file (copy from .env.example and modify as needed)
cp .env.example .env
```

## Running the Application

### Option 1: Manual Start (Recommended for Development)

#### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows, you might need to start MongoDB service or run:
mongod --dbpath "C:\data\db"
```

#### Start Backend
```bash
# In backend directory
cd backend

# Make sure virtual environment is activated
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Start the Flask server
python app.py
# Backend will be available at http://localhost:8080
```

#### Start Frontend
```bash
# In frontend directory
cd frontend

# Start Vite development server
npm run dev
# Frontend will be available at http://localhost:3000
```

### Option 2: Automated Start (Windows PowerShell)
```bash
# From the root directory, run:
.\start-dev.ps1
```

## Environment Variables

### Backend (.env)
Key variables to configure:
- `FLASK_CONFIG`: Set to `development` for dev mode
- `MONGODB_URI`: Your MongoDB connection string
- `SECRET_KEY`: Secret key for Flask
- `JWT_SECRET_KEY`: Secret key for JWT tokens

### Frontend (.env)
Key variables to configure:
- `VITE_API_BASE_URL`: Should point to your backend API (http://localhost:8080/api)

## Troubleshooting

### Common Issues

1. **Connection Refused Errors**
   - Make sure backend is running on port 8080
   - Check if MongoDB is running
   - Verify environment variables are set correctly

2. **CORS Errors**
   - Check `CORS_ORIGINS` in backend .env includes http://localhost:3000
   - Verify the backend CORS configuration in `app.py`

3. **500 Internal Server Error**
   - Check backend console logs for detailed error messages
   - Ensure all required environment variables are set
   - Verify MongoDB connection

4. **MongoDB Connection Issues**
   - Make sure MongoDB service is running
   - Check `MONGODB_URI` in backend .env
   - Verify MongoDB credentials if using remote database

### Testing API Endpoints

You can test your API endpoints using curl or Postman:

```bash
# Ping endpoint
curl http://localhost:8080/api/ping

# Signup endpoint
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Development Workflow

1. Make changes to backend/frontend code
2. Both servers support hot reloading
3. Check browser console and backend terminal for errors
4. Test API endpoints as needed

## Building for Production

### Frontend Build
```bash
# In frontend directory
npm run build
```

### Backend Deployment
The backend is configured to work with Railway and other cloud platforms.
Make sure to set appropriate environment variables for production.