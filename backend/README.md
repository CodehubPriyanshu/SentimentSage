# Sage Sentiment Spark Backend

This is the backend for the Sage Sentiment Spark application, a sentiment analysis tool that processes various types of input data.

## Structure

The backend is organized as follows:

- `app.py`: Main Flask application entry point
- `config.py`: Configuration settings
- `models/`: Database models
- `routes/`: API routes
- `services/`: Business logic and services
- `utils/`: Utility functions
- `static/`: Static files (including user uploads)
- `migrations/`: Database migrations
- `tests/`: Unit and integration tests

## Features

- User authentication (signup, login, session management)
- Sentiment analysis for:
  - Plain text
  - CSV datasets (with EDA)
  - YouTube comments
  - Twitter tweets
- Data storage in SQLite database
- File uploads (CSV files, profile photos)

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Initialize the database:
   ```
   flask db init
   flask db migrate
   flask db upgrade
   ```

3. Run the application:
   ```
   flask run
   ```

## API Endpoints

- `/api/auth/signup`: Register a new user
- `/api/auth/login`: Log in a user
- `/api/auth/logout`: Log out a user
- `/api/profile`: Get/update user profile
- `/api/analyze/text`: Analyze text sentiment
- `/api/analyze/csv`: Analyze CSV data
- `/api/analyze/youtube`: Analyze YouTube comments
- `/api/analyze/twitter`: Analyze Twitter tweets
- `/api/history`: Get analysis history
