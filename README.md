# SentimentSage Frontend

A modern React + TypeScript + Vite frontend application for sentiment analysis and data visualization.

## 🚀 Technologies Used

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation
- **Recharts** - Data visualization and charts
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   └── lib/           # Configuration and setup
├── public/            # Static assets
├── dist/              # Build output (generated)
└── package.json       # Dependencies and scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SentimentSage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   # For production, update this to your backend URL
   # VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🏗️ Build and Deployment

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

This project is optimized for Vercel deployment:

1. **Connect to Vercel**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import the project in Vercel dashboard
   - Vercel will automatically detect the Vite configuration

2. **Environment Variables**
   Set the following in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

3. **Deploy**
   - Vercel will automatically build and deploy on every push to main branch
   - Build command: `npm run build`
   - Output directory: `dist`

### Other Deployment Options

- **Netlify**: Works out of the box with Vite
- **GitHub Pages**: Use `npm run build` and deploy the `dist` folder
- **AWS S3 + CloudFront**: Upload `dist` folder contents

## 🔧 Development

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
```

### Type Checking
TypeScript is configured for strict type checking. The build will fail if there are type errors.

## 🔗 Backend Integration

This frontend is designed to work with the SentimentSage Python backend. 

### API Configuration
- Update `VITE_API_BASE_URL` in your environment variables
- The frontend expects the backend to be available at `/api` endpoints
- CORS is handled by the backend configuration

### Backend Repository
The backend should be deployed separately. See the `backend/` directory for deployment instructions.

## 🎨 UI Components

This project uses Shadcn/ui components which are:
- Fully customizable
- Accessible by default
- Built with Radix UI primitives
- Styled with Tailwind CSS

### Adding New Components
```bash
npx shadcn-ui@latest add [component-name]
```

## 🔍 Features

- **Responsive Design** - Works on all device sizes
- **Dark/Light Mode** - Theme switching capability
- **Type Safety** - Full TypeScript coverage
- **Modern UI** - Clean and professional interface
- **Performance Optimized** - Fast loading and smooth interactions
- **Error Handling** - Comprehensive error boundaries and validation

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript errors: `npm run build`

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` is correctly set
   - Check if backend is running and accessible
   - Verify CORS configuration on backend

3. **Development Server Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

## 📝 Contributing

1. Follow the existing code style and TypeScript conventions
2. Add proper error handling for all API calls
3. Include proper TypeScript types for all new features
4. Test your changes thoroughly before submitting

## 📄 License

This project is licensed under the MIT License.