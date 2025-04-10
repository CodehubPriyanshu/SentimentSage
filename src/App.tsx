
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import About from "@/pages/About";
import HowToUse from "@/pages/HowToUse";
import Analyze from "@/pages/Analyze";
import Profile from "@/pages/Profile";
import Features from "@/pages/Features";
import NotFound from "@/pages/NotFound";
import PostCommentAnalysis from "@/pages/PostCommentAnalysis";
import TwitterAnalysis from "@/pages/TwitterAnalysis";
import YoutubeAnalysis from "@/pages/YoutubeAnalysis";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-navy dark:bg-navy light:bg-white">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/post-comment-analysis" element={<PostCommentAnalysis />} />
                  <Route path="/how-to-use" element={<HowToUse />} />
                  <Route path="/twitter-analysis" element={
                    <ProtectedRoute>
                      <TwitterAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/youtube-analysis" element={
                    <ProtectedRoute>
                      <YoutubeAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/analyze" element={
                    <ProtectedRoute>
                      <Analyze />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  {/* Redirect root to login if not authenticated */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
