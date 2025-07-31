# SentimentSage Deployment Guide

This guide will help you deploy the SentimentSage full-stack application with the frontend on Vercel and the backend on a separate platform.

## 🏗️ Project Structure

```
SentimentSage/
├── src/                    # Frontend React application
├── public/                 # Static assets
├── backend/               # Python Flask backend
├── dist/                  # Frontend build output
├── package.json           # Frontend dependencies
├── vercel.json           # Vercel configuration
├── .env                  # Frontend environment variables
└── README.md             # Frontend documentation
```

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account

### Steps

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect the Vite configuration

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Build command: `npm run build`
   - Output directory: `dist`

## 🐍 Backend Deployment Options

### Option 1: Render (Recommended)

**Why Render?**
- Excellent Python support
- Generous resource limits for ML workloads
- Free tier available
- Automatic deployments

**Steps:**

1. **Prepare Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Create render.yaml** (already included)

3. **Deploy to Render**
   - Push backend code to a separate repository or use the same repo
   - Connect to [Render](https://render.com)
   - Create a new Web Service
   - Connect your repository
   - Set root directory to `backend`
   - Render will use the `render.yaml` configuration

4. **Configure Environment Variables**
   In Render dashboard, set:
   ```
   FLASK_CONFIG=production
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   CORS_ORIGINS=https://your-frontend-domain.vercel.app
   MONGODB_URI=your-mongodb-connection-string
   ```

5. **Database Setup**
   - Use Render's PostgreSQL add-on, or
   - Use MongoDB Atlas (recommended)
   - Update `MONGODB_URI` in environment variables

### Option 2: Railway

**Steps:**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Configure Environment Variables**
   ```bash
   railway variables set FLASK_CONFIG=production
   railway variables set SECRET_KEY=your-secret-key
   railway variables set CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```

### Option 3: Google Cloud Run

**Steps:**

1. **Build and Push Container**
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/PROJECT_ID/sentimentsage-backend
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy sentimentsage-backend \
     --image gcr.io/PROJECT_ID/sentimentsage-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 4: Heroku

**Steps:**

1. **Create Heroku App**
   ```bash
   cd backend
   heroku create sentimentsage-backend
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set FLASK_CONFIG=production
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account

2. **Create Cluster**
   - Create a new cluster (free tier available)
   - Choose a region close to your backend deployment

3. **Configure Access**
   - Create a database user
   - Add your backend deployment IP to whitelist (or use 0.0.0.0/0 for all IPs)

4. **Get Connection String**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Set as `MONGODB_URI` environment variable

## 🔗 Connecting Frontend and Backend

1. **Update Frontend Environment**
   In Vercel dashboard, update:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

2. **Update Backend CORS**
   In your backend deployment, set:
   ```
   CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173
   ```

3. **Test Connection**
   - Deploy both frontend and backend
   - Test API calls from frontend to backend
   - Check browser network tab for CORS issues

## 🔧 Environment Variables Reference

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (.env)
```env
# Flask Configuration
FLASK_CONFIG=production
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
MONGODB_DB_NAME=sage_sentiment

# CORS
CORS_ORIGINS=https://your-frontend-domain.vercel.app

# Optional API Keys
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
```

## 🧪 Testing Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Check that the application loads
   - Test navigation between pages

2. **Test Backend**
   - Visit `https://your-backend-url.com/api/ping`
   - Should return `{"status": "ok"}`

3. **Test Integration**
   - Try logging in from frontend
   - Test API calls
   - Check browser console for errors

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGINS` includes your frontend domain
   - Check that both HTTP and HTTPS are configured if needed

2. **Environment Variables Not Loading**
   - Verify environment variables are set in deployment platform
   - Check variable names match exactly (case-sensitive)

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check database user permissions
   - Ensure IP whitelist includes deployment server

4. **Build Failures**
   - Check that all dependencies are in requirements.txt
   - Verify Python version compatibility
   - Check for syntax errors in code

5. **API Timeout Issues**
   - Increase timeout limits in deployment platform
   - Optimize heavy operations (ML models)
   - Consider using background tasks for long operations

## 📊 Performance Optimization

### Frontend
- Enable gzip compression (automatic on Vercel)
- Use CDN for static assets (automatic on Vercel)
- Implement code splitting for large bundles

### Backend
- Use gunicorn with multiple workers
- Implement caching for expensive operations
- Use database indexing for queries
- Consider using Redis for session storage

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to git
   - Use strong, unique secret keys
   - Rotate keys regularly

2. **CORS Configuration**
   - Only allow necessary origins
   - Don't use wildcard (*) in production

3. **Database Security**
   - Use strong database passwords
   - Limit database user permissions
   - Enable database encryption

4. **API Security**
   - Implement rate limiting
   - Use HTTPS only
   - Validate all input data

## 📈 Monitoring and Maintenance

1. **Set up monitoring**
   - Use platform-specific monitoring tools
   - Monitor API response times
   - Track error rates

2. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging environment

3. **Backup strategy**
   - Regular database backups
   - Test backup restoration
   - Document recovery procedures

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain** (Optional)
   - Configure custom domain in Vercel
   - Update CORS settings accordingly

2. **SSL Certificate**
   - Automatic on Vercel and most platforms
   - Verify HTTPS is working

3. **Analytics** (Optional)
   - Add Google Analytics
   - Monitor user behavior
   - Track application performance

4. **CI/CD Pipeline**
   - Set up automatic deployments
   - Add testing pipeline
   - Implement staging environment

## 📞 Support

If you encounter issues:

1. Check the logs in your deployment platform
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check the browser console for frontend errors
5. Review the deployment platform documentation

Remember to test thoroughly in a staging environment before deploying to production!