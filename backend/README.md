# SentimentSage Backend

A Python Flask backend API for sentiment analysis, user management, and data processing with machine learning capabilities.

## 🚀 Technologies Used

- **Flask** - Lightweight WSGI web application framework
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping
- **Flask-JWT-Extended** - JWT token authentication
- **Pandas & NumPy** - Data manipulation and analysis
- **Scikit-learn** - Machine learning library
- **Transformers** - Hugging Face transformers for NLP
- **PyTorch** - Deep learning framework
- **OpenAI API** - GPT integration for advanced analysis
- **Tweepy** - Twitter API integration
- **Google APIs** - Google services integration

## 📁 Project Structure

```
backend/
├── api/               # API endpoint definitions
├── models/            # Database models
├── routes/            # Route blueprints
│   ├── auth.py       # Authentication routes
│   ├── analysis.py   # Sentiment analysis routes
│   ├── profile.py    # User profile routes
│   └── developer.py  # Developer tools routes
├── utils/             # Utility functions
├── middleware/        # Custom middleware
├── migrations/        # Database migrations
├── static/            # Static files and uploads
├── db/               # Database files
├── app.py            # Main application entry point
├── config.py         # Configuration settings
└── requirements.txt  # Python dependencies
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- pip package manager
- Virtual environment (recommended)

### Local Development Setup

1. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # Flask Configuration
   FLASK_CONFIG=development
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key
   
   # Database
   DATABASE_URL=sqlite:///sentiment_sage.db
   
   # CORS Origins (for frontend)
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   
   # API Keys (optional - for advanced features)
   OPENAI_API_KEY=your-openai-api-key
   TWITTER_BEARER_TOKEN=your-twitter-bearer-token
   GOOGLE_API_KEY=your-google-api-key
   
   # Upload Configuration
   MAX_CONTENT_LENGTH=16777216  # 16MB
   UPLOAD_FOLDER=static/uploads
   ```

4. **Initialize Database**
   ```bash
   python app.py
   ```

5. **Start Development Server**
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000`

## 🚀 Deployment Options

### Option 1: Render (Recommended for ML workloads)

Render is ideal for Python backends with ML dependencies due to generous resource limits.

1. **Prepare for Render**
   Create `render.yaml` in backend directory:
   ```yaml
   services:
     - type: web
       name: sentimentsage-backend
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: gunicorn app:app
       envVars:
         - key: FLASK_CONFIG
           value: production
         - key: SECRET_KEY
           generateValue: true
         - key: JWT_SECRET_KEY
           generateValue: true
         - key: DATABASE_URL
           fromDatabase:
             name: sentimentsage-db
             property: connectionString
   
   databases:
     - name: sentimentsage-db
       databaseName: sentimentsage
       user: sentimentsage
   ```

2. **Deploy to Render**
   - Push backend code to GitHub
   - Connect repository to Render
   - Set environment variables in Render dashboard
   - Deploy automatically

### Option 2: Railway

Railway offers excellent Python support and automatic deployments.

1. **Prepare for Railway**
   Create `railway.toml`:
   ```toml
   [build]
   builder = "NIXPACKS"
   
   [deploy]
   startCommand = "gunicorn app:app"
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

2. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

### Option 3: Google Cloud Run

Ideal for containerized deployments with auto-scaling.

1. **Create Dockerfile** (already exists):
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   
   COPY . .
   
   CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
   ```

2. **Deploy to Cloud Run**
   ```bash
   # Build and push to Google Container Registry
   gcloud builds submit --tag gcr.io/PROJECT_ID/sentimentsage-backend
   
   # Deploy to Cloud Run
   gcloud run deploy sentimentsage-backend \
     --image gcr.io/PROJECT_ID/sentimentsage-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 4: Heroku

1. **Prepare for Heroku**
   Create `Procfile`:
   ```
   web: gunicorn app:app
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create sentimentsage-backend
   heroku config:set FLASK_CONFIG=production
   git push heroku main
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FLASK_CONFIG` | Environment (development/production) | Yes |
| `SECRET_KEY` | Flask secret key | Yes |
| `JWT_SECRET_KEY` | JWT token secret | Yes |
| `DATABASE_URL` | Database connection string | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `TWITTER_BEARER_TOKEN` | Twitter API token | No |
| `GOOGLE_API_KEY` | Google API key | No |

### Database Configuration

The application supports multiple database backends:
- **SQLite** (development): `sqlite:///sentiment_sage.db`
- **PostgreSQL** (production): `postgresql://user:pass@host:port/db`
- **MySQL** (production): `mysql://user:pass@host:port/db`

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Analysis
- `POST /api/analysis/text` - Analyze text sentiment
- `POST /api/analysis/file` - Analyze file content
- `GET /api/analysis/history` - Get analysis history
- `DELETE /api/analysis/{id}` - Delete analysis

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/photo` - Upload profile photo

### Developer Tools
- `GET /api/developer/stats` - Get system statistics
- `POST /api/developer/test` - Test endpoints

## 🧪 Testing

### Run Tests
```bash
# Unit tests
python -m pytest tests/

# Integration tests
python -m pytest tests/integration/

# Coverage report
python -m pytest --cov=. tests/
```

### Manual Testing
```bash
# Test API endpoints
python test_password_change.py
python test_twitter_save.py
python check_db.py
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password encryption
- **CORS Protection** - Configurable CORS origins
- **Input Validation** - Request data validation
- **Error Handling** - Secure error responses
- **File Upload Security** - Safe file handling

## 📊 Performance Optimization

### For Production Deployment:

1. **Reduce Dependencies** (if size is an issue):
   ```bash
   # Create minimal requirements.txt
   pip freeze | grep -E "(flask|pandas|numpy|scikit-learn)" > requirements-minimal.txt
   ```

2. **Use Gunicorn** for production:
   ```bash
   gunicorn --workers 4 --bind 0.0.0.0:8080 app:app
   ```

3. **Enable Caching**:
   - Redis for session storage
   - Database query caching
   - API response caching

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   pip install -r requirements.txt
   export PYTHONPATH="${PYTHONPATH}:$(pwd)"
   ```

2. **Database Issues**
   ```bash
   # Reset database
   rm -f db/sentiment_sage.db
   python app.py
   ```

3. **Memory Issues (ML Models)**
   - Use smaller model variants
   - Implement model caching
   - Consider model serving services

4. **Deployment Size Limits**
   - Remove unused dependencies
   - Use Docker multi-stage builds
   - Consider serverless alternatives for specific functions

## 🔗 Frontend Integration

### CORS Configuration
Update `CORS_ORIGINS` to include your frontend URL:
```env
CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:5173
```

### API Base URL
Frontend should use:
- Development: `http://localhost:5000/api`
- Production: `https://your-backend-domain.com/api`

## 📝 Contributing

1. Follow PEP 8 style guidelines
2. Add proper error handling and logging
3. Include docstrings for all functions
4. Write tests for new features
5. Update API documentation

## 📄 License

This project is licensed under the MIT License.