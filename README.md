# Sage Sentiment Spark

A comprehensive sentiment analysis application that processes various types of input data including plain text, CSV datasets, YouTube comments, and Twitter tweets. The application features high-performance analysis with real-time feedback and progressive loading of results.

## Project Structure

The project is organized into two main directories:

- `frontend/`: Contains the React frontend application
- `backend/`: Contains the Flask backend API

## Features

- User authentication (signup, login, profile management)
- Text sentiment analysis
- CSV file upload and exploratory data analysis
- High-performance YouTube comment analysis with real-time progress tracking
- Optimized Twitter tweet analysis with parallel processing
- Client-side caching for faster repeat analyses
- Progressive loading of analysis results
- User profile with history of all analyses

## Setup

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- pip (Python package manager)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/CodehubPriyanshu/sage-sentiment-spark.git
   cd sage-sentiment-spark
   ```

2. Install dependencies:

   ```bash
   npm run install:all
   ```

   This will install both frontend and backend dependencies.

### Configuration

1. Create a `.env` file in the `backend/` directory with the following variables:

   ```env
   FLASK_DEBUG=True
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret-key
   YOUTUBE_API_KEY=your-youtube-api-key
   OPENAI_API_KEY=your-openai-api-key
   TWITTER_API_KEY=your-twitter-api-key
   TWITTER_API_SECRET=your-twitter-api-secret
   TWITTER_ACCESS_TOKEN=your-twitter-access-token
   TWITTER_ACCESS_SECRET=your-twitter-access-secret
   ```

   Note: For development, you can leave the API keys empty. The application will use mock data.

### Running the Application

1. Start both frontend and backend:

   ```bash
   npm start
   ```

2. Or run them separately:

   ```bash
   npm run start:frontend
   npm run start:backend
   ```

3. Access the application at:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:5000`

## Technologies Used

This project is built with:

### Frontend

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- Recharts for data visualization

### Backend

- Flask
- SQLite
- Flask-JWT-Extended for authentication
- Pandas for data analysis
- Scikit-learn for machine learning
- Tweepy for Twitter API integration
- Google API Client for YouTube API integration

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
- `GET /api/auth/me`: Get current user information

### Profile

- `GET /api/profile`: Get user profile
- `PUT /api/profile`: Update user profile
- `POST /api/profile/photo`: Upload profile photo
- `GET /api/profile/analyses`: Get all analyses for the current user

### Analysis

- `POST /api/analyze/text`: Analyze text sentiment
- `POST /api/analyze/csv`: Analyze CSV data
- `POST /api/analyze/twitter`: Analyze Twitter user tweets
- `POST /api/analyze/youtube`: Analyze YouTube video comments
