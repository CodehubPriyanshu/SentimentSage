# Sage Sentiment Spark Frontend

This is the frontend for the Sage Sentiment Spark application, a sentiment analysis tool that processes various types of input data.

## Structure

The frontend is organized as follows:

- `public/`: Static assets
- `src/`: Source code
  - `components/`: Reusable UI components
  - `hooks/`: Custom React hooks
  - `lib/`: Utility libraries
  - `pages/`: Application pages
  - `utils/`: Utility functions
  - `App.tsx`: Main application component
  - `index.tsx`: Application entry point

## Features

- User authentication (signup, login)
- Text sentiment analysis
- CSV file upload and analysis
- YouTube comment analysis
- Twitter tweet analysis
- User profile management
- Responsive design

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Pages

- `/`: Home page
- `/login`: Login page
- `/signup`: Signup page
- `/analysis`: Text and CSV analysis
- `/twitter-analysis`: Twitter sentiment analysis
- `/youtube-analysis`: YouTube sentiment analysis
- `/profile`: User profile page
