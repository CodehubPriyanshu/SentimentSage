# SentimentSage - Full-Stack Sentiment Analysis Platform

A comprehensive full-stack application for sentiment analysis and data visualization, built with modern web technologies and machine learning capabilities.

## 🎯 Overview

SentimentSage is a powerful sentiment analysis platform that allows users to analyze text sentiment from various sources including:

- **Text Analysis** - Direct text input sentiment analysis
- **CSV File Analysis** - Bulk sentiment analysis from CSV datasets
- **Twitter Analysis** - Social media sentiment tracking
- **YouTube Analysis** - Video comment sentiment analysis
- **Real-time Processing** - Live sentiment analysis with streaming updates

## 🏗️ Architecture

This project follows a modern full-stack architecture with clear separation of concerns:

```
SentimentSage/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # Python Flask API with ML capabilities
├── vercel.json        # Deployment configuration
└── README.md          # This file
```

## 🚀 Technologies Used

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Recharts** - Data visualization and charts

### Backend
- **Flask** - Lightweight Python web framework
- **MongoDB** - NoSQL database for data storage
- **JWT Authentication** - Secure user authentication
- **Scikit-learn** - Machine learning for sentiment analysis
- **Pandas & NumPy** - Data manipulation and analysis
- **Gunicorn** - WSGI HTTP Server for production

### Optional Integrations
- **OpenAI API** - Advanced AI-powered insights
- **Twitter API** - Social media data collection
- **YouTube API** - Video comment analysis
- **Google APIs** - Additional data sources

## 🛠️ Quick Start

### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.8+** (for backend)
- **MongoDB** (local or cloud instance)
- **Git** (for version control)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SentimentSage
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

### 3. Setup Backend
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
The backend API will be available at `http://localhost:5000`

### 4. Environment Configuration

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
FLASK_CONFIG=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/sage_sentiment
CORS_ORIGINS=http://localhost:5173
```

## 📁 Project Structure

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── lib/           # Configuration files
├── public/            # Static assets
├── dist/              # Build output
└── package.json       # Dependencies and scripts
```

### Backend (`/backend`)
```
backend/
├── routes/            # API route blueprints
├── models/            # Database models
├── utils/             # Backend utilities
├── static/            # File uploads and static files
├── app.py             # Main Flask application
├── config.py          # Configuration settings
└── requirements.txt   # Python dependencies
```

## 🚀 Deployment

### Frontend (Vercel)
The project is configured for Vercel deployment with the frontend as the build root:

1. Connect your repository to Vercel
2. Vercel will automatically detect the configuration
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Backend (Multiple Options)
- **Render** (Recommended for ML workloads)
- **Railway** (Easy deployment)
- **Google Cloud Run** (Containerized deployment)
- **Heroku** (Traditional PaaS)

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
python app.py        # Start development server
python -m pytest    # Run tests
```

## 🌟 Features

### Core Features
- **Multi-source Analysis** - Text, CSV, Twitter, YouTube
- **Real-time Processing** - Live updates and streaming
- **User Authentication** - Secure JWT-based auth
- **Data Visualization** - Interactive charts and graphs
- **Export Capabilities** - PDF reports and data export
- **Responsive Design** - Works on all device sizes

### Advanced Features
- **AI-Powered Insights** - Enhanced analysis with OpenAI
- **Batch Processing** - Handle large datasets efficiently
- **Historical Tracking** - Save and compare analyses
- **Custom Models** - Extensible ML pipeline
- **API Integration** - RESTful API for external use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript conventions for frontend
- Follow PEP 8 style guide for backend
- Add tests for new features
- Update documentation as needed

## 📝 API Documentation

The backend provides a RESTful API with the following main endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/analyze/text` - Text sentiment analysis
- `POST /api/analyze/csv` - CSV file analysis
- `POST /api/analyze/twitter` - Twitter analysis
- `POST /api/analyze/youtube` - YouTube analysis
- `GET /api/profile/analyses` - Get user's analysis history

## 🔒 Security

- JWT-based authentication
- CORS protection
- Input validation and sanitization
- Secure file upload handling
- Environment-based configuration
- Rate limiting (configurable)

## 📊 Performance

- **Frontend**: Code splitting, lazy loading, optimized bundles
- **Backend**: Efficient database queries, caching, async processing
- **Deployment**: CDN, compression, auto-scaling

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS_ORIGINS includes frontend URL
2. **Database Connection**: Verify MongoDB connection string
3. **API Timeouts**: Check network connectivity and server status
4. **Build Errors**: Ensure all dependencies are installed

### Getting Help

- Check the `DEPLOYMENT.md` guide for deployment issues
- Review the frontend README for development setup
- Check backend logs for API errors
- Open an issue for bugs or feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for accessible sentiment analysis tools
- Thanks to the open-source community for amazing libraries and tools

---

**Ready to analyze sentiment like never before!** 🚀