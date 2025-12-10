# SentimentSage - Railway Deployment

This is a full-stack application with a React frontend and Flask backend, configured for deployment on Railway.

## Project Structure

```
.
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── ...                 # Other backend files
├── frontend/
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── ...                 # Other frontend files
├── railway.toml            # Railway deployment configuration
├── Procfile                # Process execution commands
├── requirements.txt        # Python dependencies (root level)
├── package.json            # Node.js configuration (root level)
├── runtime.txt             # Python runtime version
└── start.sh                # Application start script
```

## Railway Deployment Configuration

The project is configured with `railway.toml` to:

1. Use Nixpacks builder
2. Install Node.js 18, Python 3.11, and pip
3. Install frontend and backend dependencies
4. Build the React frontend
5. Copy the built files to the backend static directory
6. Start the Flask application

## Environment Variables

Set these environment variables in your Railway project:

- `FLASK_CONFIG=production`
- `SECRET_KEY=your-secret-key`
- `JWT_SECRET_KEY=your-jwt-secret-key`
- `MONGODB_URI=your-mongodb-uri` (or leave unset to use mock database)

## Deployment Process

Railway will automatically:

1. Detect and use the Nixpacks builder
2. Execute the setup phase to install Node.js 18, Python 3.11, and pip
3. Run the install phase to install frontend and backend dependencies
4. Run the build phase to build the React frontend and copy files
5. Start the application using the start command

## Local Development

To run locally:

1. Start the backend:
   ```bash
   cd backend
   python app.py
   ```

2. Start the frontend (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

## Notes

- The Flask backend serves the React frontend build files from the `static` directory
- All non-API routes are handled by serving `index.html` to support client-side routing
- CORS is enabled for all API routes
- The application listens on the PORT environment variable provided by Railway