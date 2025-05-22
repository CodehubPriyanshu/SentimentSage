# SentimentSage

![SentimentSage Logo](frontend/public/assets/logo.png)

A comprehensive sentiment analysis application that processes various types of input data including plain text, CSV datasets, YouTube comments, and Twitter/X tweets. The application features high-performance analysis with real-time feedback and progressive loading of results.

## Live Demo

Check out the live demo: [SentimentSage Demo](https://sentimentsage.vercel.app)

## Project Structure

The project is organized into two main directories:

- `frontend/`: Contains the React frontend application built with Vite, TypeScript, and Tailwind CSS
- `backend/`: Contains the Flask backend API with MongoDB database integration

## Features

![HomePage](https://github.com/user-attachments/assets/30768f3e-c41f-4f97-a53f-cafb02f2a44e)

- User authentication (signup, login, profile management)
  ![Screenshot 2025-03-30 093019](https://github.com/user-attachments/assets/2b068cd3-c95b-43f3-8e1c-97e62c070854)
- Text sentiment analysis
  ![DashboardPage](https://github.com/user-attachments/assets/89953998-b4b5-4987-bd5c-240fcb4a9e0a)
- CSV file upload and exploratory data analysis
  ![CSVFileResult](https://github.com/user-attachments/assets/4ed789a4-c170-40ce-9594-a5e5bfd0ce37)
- High-performance YouTube comment analysis with real-time progress tracking
  ![YoutubeResult](https://github.com/user-attachments/assets/dd16f84a-ef49-4ed5-92ff-18ea62da9443)
- Optimized Twitter tweet analysis with parallel processing
  ![TweetResult](https://github.com/user-attachments/assets/359058f1-c570-493e-bac8-f424e49c206f)
- Client-side caching for faster repeat analyses
- Progressive loading of analysis results
- User profile with history of all analyses

## Setup and Deployment

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local or Atlas)
- npm (Node package manager)
- pip (Python package manager)

### Local Development Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/CodehubPriyanshu/SentimentSage.git
   cd SentimentSage
   ```

2. **Install frontend dependencies**:

   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**:

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:

   Create a `.env` file in the `backend/` directory with the following variables:

   ```env
   # Flask configuration
   FLASK_DEBUG=True
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret-key

   # MongoDB configuration
   MONGODB_URI=mongodb://localhost:27017/sage_sentiment
   MONGODB_DB_NAME=sage_sentiment

   # API Keys (optional for development)
   YOUTUBE_API_KEY=your-youtube-api-key
   OPENAI_API_KEY=your-openai-api-key
   TWITTER_API_KEY=your-twitter-api-key
   TWITTER_API_SECRET=your-twitter-api-secret
   TWITTER_ACCESS_TOKEN=your-twitter-access-token
   TWITTER_ACCESS_SECRET=your-twitter-access-secret

   # Email configuration (for password reset)
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   USE_MOCK_EMAIL=True
   ```

   Note: For development, you can leave the API keys empty. The application will use mock data.

5. **Run the application**:

   In one terminal, start the backend:

   ```bash
   cd backend
   python app.py
   ```

   In another terminal, start the frontend:

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Production Deployment

#### Backend Deployment (Render, Heroku, or similar)

1. **Set up environment variables** in your hosting platform with the same variables as in the `.env` file.

2. **Configure the build command**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure the start command**:

   ```bash
   gunicorn app:create_app() --bind 0.0.0.0:$PORT
   ```

4. **Set the root directory** to `backend/`

#### Frontend Deployment (Vercel, Netlify, or similar)

1. **Set up environment variables**:

   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Configure the build command**:

   ```bash
   npm run build
   ```

3. **Set the publish directory** to `dist/`

4. **Set the root directory** to `frontend/`

### Docker Deployment

A `docker-compose.yml` file is included for easy deployment with Docker:

```bash
docker-compose up -d
```

This will start both the frontend and backend services, along with a MongoDB container.

## Technologies Used

This project is built with modern technologies for optimal performance and user experience:

### Frontend

- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **React**: UI component library
- **shadcn-ui**: Beautifully designed components
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Recharts**: Responsive chart components
- **jsPDF**: PDF generation for exporting analysis results

### Backend

- **Flask**: Python web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Flask-JWT-Extended**: Authentication with JSON Web Tokens
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning for sentiment analysis
- **Tweepy**: Twitter/X API integration
- **Google API Client**: YouTube API integration
- **OpenAI API**: Enhanced AI insights (optional)
- **Gunicorn**: WSGI HTTP Server for production deployment

## Performance Optimizations

### Backend Optimizations

- **Parallel Processing**: Multi-threaded processing for sentiment analysis using ThreadPoolExecutor with dynamic worker allocation
- **Caching Mechanism**: Caching for previously analyzed YouTube videos and Twitter handles
- **Thread-Local Storage**: Efficient model loading with thread-local storage to avoid reloading
- **Optimized Algorithms**: NumPy for faster sentiment calculations and defaultdict for efficient data structures
- **Dynamic Batch Processing**: Adaptive batch sizes based on workload for optimal performance
- **Robust Error Handling**: Graceful fallbacks and partial result returns when possible

### Frontend Optimizations

- **Progressive Loading**: Real-time display of partial results while analysis continues
- **Visual Progress Tracking**: Animated progress bars with percentage completion
- **Client-Side Caching**: Instant loading from cache for repeat analyses
- **Optimized State Management**: Efficient React state updates to prevent unnecessary re-renders
- **Performance Metrics**: Timing information to track and display analysis speed

### User Experience Improvements

- **Immediate Feedback**: Show video/user information immediately while analysis continues
- **Step-by-Step Progress**: Visual indicators for each completed analysis step
- **Smooth Transitions**: Animated progress updates for a polished user experience
- **Error Recovery**: Specific error messages and recovery options for different failure scenarios

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Log in a user
- `POST /api/auth/logout`: Log out a user
- `POST /api/auth/refresh`: Refresh access token
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password with token

### Profile

- `GET /api/profile`: Get user profile
- `PUT /api/profile`: Update user profile
- `POST /api/profile/photo`: Upload profile photo
- `POST /api/profile/change-password`: Change password
- `GET /api/profile/analyses`: Get all analyses for the current user

### Analysis

- `POST /api/analyze/text`: Analyze text sentiment
- `POST /api/analyze/csv`: Analyze CSV data
- `POST /api/analyze/twitter`: Analyze Twitter/X user tweets
- `POST /api/analyze/youtube`: Analyze YouTube video comments
- `GET /api/analyze/recent`: Get recent analyses

### Developer

- `POST /api/developer/photo`: Upload developer photo

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Priyanshu Kumar** - [GitHub](https://github.com/CodehubPriyanshu)

## Acknowledgments

- Special thanks to ITM University, Gwalior for supporting this project
- All the open-source libraries and tools that made this project possible
