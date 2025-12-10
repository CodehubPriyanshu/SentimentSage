# Railway Deployment Guide

This guide explains how to deploy the SentimentSage application to Railway.

## Prerequisites

1. A Railway account (https://railway.app/)
2. Node.js and npm installed locally (for building the frontend)
3. Python 3.8+ installed locally

## Deployment Steps

1. **Connect to Railway:**
   - Go to your Railway dashboard
   - Click "New Project" and select "Deploy from GitHub"
   - Connect your repository

2. **Configure Environment Variables:**
   In the Railway dashboard, go to your project settings and add these environment variables:
   ```
   FLASK_CONFIG=production
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   MONGODB_URI=your-mongodb-uri-here
   ```

3. **Automatic Build and Deploy:**
   Railway will automatically:
   - Install Python dependencies from `requirements.txt`
   - Run the build script to install Node.js dependencies and build the React frontend
   - Start the Flask application on the port specified by Railway

## Directory Structure for Deployment

```
/backend
  ├── app.py
  ├── requirements.txt
  ├── dist/           # Built React frontend files
  ├── static/
  ├── templates/
/frontend
  ├── dist/           # Temporary build directory
  ├── src/
  ├── package.json
  └── ... (other frontend files)
Procfile
railway.toml
```

## Custom Domain (Optional)

To use a custom domain:
1. In the Railway dashboard, go to your project settings
2. Navigate to the "Domains" section
3. Add your custom domain
4. Follow Railway's instructions to configure DNS

## Troubleshooting

If you encounter issues:
1. Check the build logs in the Railway dashboard
2. Ensure all environment variables are set correctly
3. Verify that your MongoDB connection is working
4. Check that the frontend builds successfully locally by running:
   ```
   cd frontend
   npm install
   npm run build
   ```

## Local Development vs Production

The application uses different configurations for development and production:
- Development uses local databases and debug mode
- Production uses environment variables and disables debug mode

For any issues, please check the Railway logs for detailed error messages.