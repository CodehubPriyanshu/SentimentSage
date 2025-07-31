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
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # Base UI components (Shadcn/ui)
│   │   ├── ErrorBoundary.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── pages/         # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Analyze.tsx
│   │   └── ...
│   ├── hooks/         # Custom React hooks
│   │   ├── useAuth.tsx
│   │   ├── useTheme.tsx
│   │   └── ...
│   ├── utils/         # Utility functions
│   │   ├── api.ts     # API client
│   │   ├── errorHandler.ts
│   │   └── ...
│   ├── types/         # TypeScript type definitions
│   └── lib/           # Configuration and setup
├── public/            # Static assets
├── dist/              # Build output (generated)
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js 18+** 
- **npm** or **yarn** package manager

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   Or with yarn:
   ```bash
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
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

## 🏗️ Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run dev --host   # Start dev server accessible from network
```

### Building
```bash
npm run build        # Build for production
npm run build:dev    # Build for development environment
```

### Preview & Testing
```bash
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run lint:fix     # Fix ESLint issues automatically
```

## 🔧 Development

### Code Quality
The project uses ESLint and TypeScript for code quality:

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Automatically fix linting issues
```

### Type Checking
TypeScript is configured for strict type checking. The build will fail if there are type errors.

### Hot Module Replacement (HMR)
Vite provides fast HMR for instant feedback during development.

## 🎨 UI Components

This project uses **Shadcn/ui** components which are:
- Fully customizable
- Accessible by default
- Built with Radix UI primitives
- Styled with Tailwind CSS

### Adding New Components
```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

### Component Usage
```tsx
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

function MyComponent() {
  return (
    <Dialog>
      <Button variant="default">Click me</Button>
    </Dialog>
  )
}
```

## 🔗 Backend Integration

### API Configuration
The frontend communicates with the backend through the API client located at `src/utils/api.ts`.

**Environment Variables:**
- `VITE_API_BASE_URL` - Backend API base URL

**API Client Features:**
- Automatic error handling
- Request/response interceptors
- Authentication token management
- Timeout handling
- Retry logic

### Authentication
The app uses JWT-based authentication:

```tsx
import { useAuth } from "@/hooks/useAuth"

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  // Use authentication state
}
```

### Making API Calls
```tsx
import { authApi, analysisApi } from "@/utils/api"

// Authentication
const result = await authApi.login(email, password)

// Analysis
const analysis = await analysisApi.analyzeText(text)
```

## 🎯 Features

### Core Features
- **Responsive Design** - Works on all device sizes
- **Dark/Light Mode** - Theme switching capability
- **Type Safety** - Full TypeScript coverage
- **Modern UI** - Clean and professional interface
- **Performance Optimized** - Fast loading and smooth interactions
- **Error Handling** - Comprehensive error boundaries and validation

### Pages & Components
- **Home** - Landing page with feature overview
- **Authentication** - Login, signup, password reset
- **Analysis** - Text, CSV, Twitter, YouTube analysis
- **Profile** - User profile and analysis history
- **Dashboard** - Data visualization and insights

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

3. **Build Configuration**
   Vercel automatically detects:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Other Deployment Options

- **Netlify**: Works out of the box with Vite
- **GitHub Pages**: Use `npm run build` and deploy the `dist` folder
- **AWS S3 + CloudFront**: Upload `dist` folder contents
- **Docker**: Use the included Dockerfile

### Docker Deployment
```bash
# Build the image
docker build -t sentimentsage-frontend .

# Run the container
docker run -p 3000:80 sentimentsage-frontend
```

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### TypeScript Configuration
- **tsconfig.json** - Main TypeScript configuration
- **tsconfig.app.json** - Application-specific settings
- **tsconfig.node.json** - Node.js environment settings

### Tailwind Configuration (`tailwind.config.ts`)
Custom theme configuration with:
- Custom colors and spacing
- Dark mode support
- Component-specific styles
- Responsive breakpoints

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

3. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` is correctly set
   - Check if backend is running and accessible
   - Verify CORS configuration on backend

4. **Development Server Issues**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run dev
   ```

5. **Styling Issues**
   ```bash
   # Rebuild Tailwind CSS
   npm run build
   ```

### Performance Optimization

1. **Bundle Analysis**
   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

2. **Code Splitting**
   Use dynamic imports for large components:
   ```tsx
   const LazyComponent = lazy(() => import('./LazyComponent'))
   ```

3. **Image Optimization**
   - Use WebP format when possible
   - Implement lazy loading for images
   - Optimize image sizes

## 📊 Monitoring & Analytics

### Error Tracking
The app includes comprehensive error handling:
- Error boundaries for React components
- Global error handlers for unhandled promises
- API error handling with user-friendly messages

### Performance Monitoring
- Built-in performance metrics
- Network status monitoring
- Loading states and progress indicators

## 🔒 Security

### Best Practices Implemented
- **XSS Protection** - Input sanitization and validation
- **CSRF Protection** - Token-based authentication
- **Secure Headers** - Content Security Policy
- **Environment Variables** - Sensitive data protection

### Authentication Security
- JWT token storage in localStorage
- Automatic token refresh
- Secure logout functionality
- Protected routes

## 📝 Contributing

### Development Workflow
1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

### Code Style
- Follow TypeScript conventions
- Use Prettier for code formatting
- Follow React best practices
- Write meaningful commit messages

### Adding New Features
1. Create components in appropriate directories
2. Add proper TypeScript types
3. Include error handling
4. Update documentation

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

### Tools
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding!** 🚀