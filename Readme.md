<!-- Header section -->
<div align="center">
  <img src="frontend/public/assets/logo.png" alt="SentimentSage Logo" width="120" height="120">
  
  # SentimentSage
  
  ### AI-Powered Sentiment Analysis Platform
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Python](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/)
  [![React](https://img.shields.io/badge/react-18%2B-blue)](https://reactjs.org/)
  [![Flask](https://img.shields.io/badge/flask-2.3%2B-blue)](https://flask.palletsprojects.com/)
  
  Analyze sentiments in text, social media posts, and customer feedback with cutting-edge AI.
</div>

## 🌟 Features

- **Multi-Platform Analysis**: Analyze text, CSV files, Twitter accounts, and YouTube comments
- **Advanced AI Models**: Powered by OpenAI GPT and Hugging Face transformers
- **Real-time Processing**: Get instant sentiment analysis results
- **Interactive Visualizations**: Beautiful charts and graphs for data insights
- **User Authentication**: Secure signup, login, and profile management
- **History Tracking**: Save and revisit your previous analyses
- **Export Capabilities**: Export results as PDF reports

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB Community Edition
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SentimentSa
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

#### Option 1: Manual Start (Recommended for Development)

1. Start MongoDB service
2. Start Backend:
   ```bash
   cd backend
   python app.py
   ```
3. Start Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

#### Option 2: Automated Start Scripts

On Windows:
- PowerShell: `.\start-dev.ps1`
- Command Prompt: `start-dev.bat`

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Health Check: http://localhost:8080/api/ping

## 🛠️ Development Guide

See [README-DEV.md](README-DEV.md) for detailed development setup and troubleshooting.

## 📁 Project Structure

```
SentimentSage/
├── backend/              # Flask API server
│   ├── api/             # Main application module
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── middleware/      # Custom middleware
│   └── config.py        # Configuration
├── frontend/            # React frontend
│   ├── src/             # Source code
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── data/                # Local database storage
    └── db/              # MongoDB data files
```

## 🔧 Configuration

### Backend Environment Variables (.env)
- `FLASK_CONFIG`: development/production
- `MONGODB_URI`: MongoDB connection string
- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT secret key
- API keys for external services (optional)

### Frontend Environment Variables (.env)
- `VITE_API_BASE_URL`: Backend API URL

## 🔑 Environment Variables Guide

A fully documented master copy of every variable lives in `.env` at the project root (it is git-ignored, so it never gets committed). The backend reads `backend/.env` and the frontend reads `frontend/.env` — copy the relevant values into each.

### Where each file lives
| File | Who reads it | Content |
|------|-------------|---------|
| `backend/.env` | Flask backend (`backend/db/mongo_client.py`) | MongoDB, JWT, API keys, AI, email, CORS |
| `frontend/.env` | Vite frontend at build time | `VITE_API_BASE_URL` |
| `.env` (root) | Reference copy only | Everything, fully explained |

### How to get each value

| Variable | Required? | Where to get it |
|----------|-----------|-----------------|
| `SECRET_KEY` / `JWT_SECRET_KEY` | Yes | Any long random string: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `MONGODB_URI` | Yes | Local: `mongodb://localhost:27017/sage_sentiment`. Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → create free cluster → **Connect** → **Connect your application** → copy string (replace `<username>:<password>`) |
| `YOUTUBE_API_KEY` | No | [Google Cloud Console](https://console.cloud.google.com/) → create project → **Enable APIs & Services** → enable **YouTube Data API v3** → **Credentials** → **Create Credentials** → **API key** |
| `OPENAI_API_KEY` | No | [OpenAI Platform](https://platform.openai.com/) → **API keys** → **Create new secret key** (needs paid account/credits for live calls) |
| `HUGGINGFACE_API_KEY` | No | [Hugging Face](https://huggingface.co/) → **Settings** → **Access Tokens** → **New token** |
| `TWITTER_*` keys | No | [X Developer Platform](https://developer.x.com/) → create a Project + App → copy API Key/Secret and Access Token/Secret (note: X requires paid tiers) |
| `SMTP_USERNAME` | No* | Your Gmail address |
| `SMTP_PASSWORD` | No* | Gmail **App Password** (not your login password): [myaccount.google.com](https://myaccount.google.com/) → **Security** → enable 2-Step Verification → **App passwords** → choose Mail/Other → copy 16-char code |
| `CORS_ORIGINS` | Yes | Comma-separated list of every frontend URL (e.g. `http://localhost:5173,https://your-app.vercel.app`) |

> \* Only needed if `USE_MOCK_EMAIL=False`. While developing, keep `USE_MOCK_EMAIL=True` and emails are logged instead of sent.

### Setup steps
1. Copy the root `.env` to `backend/.env`: `cp .env backend/.env` (Windows: `copy .env backend\.env`)
2. Edit `backend/.env` and fill in the values from the table above.
3. Create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8080/api`.
4. **Never** commit `.env` files — they are already ignored via `.gitignore`.

## 🌐 API Documentation

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Analysis
- `POST /api/analyze/text` - Analyze text sentiment
- `POST /api/analyze/csv` - Analyze CSV file
- `POST /api/analyze/twitter` - Analyze Twitter account
- `POST /api/analyze/youtube` - Analyze YouTube video

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/analyses` - Get user's saved analyses

## 📊 Data Visualization

The platform provides interactive charts including:
- Sentiment distribution pie charts
- Time-series sentiment trends
- Word clouds of frequently used terms
- Comparative analysis between datasets

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Rate limiting (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Hugging Face for transformer models
- MongoDB for database solutions
- All contributors to this project

## 📞 Support

For support, please open an issue on GitHub or contact the development team.