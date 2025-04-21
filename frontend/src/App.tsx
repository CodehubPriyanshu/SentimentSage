import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { TransitionContext } from "@/components/SmoothLink";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import About from "@/pages/About";
import HowToUse from "@/pages/HowToUse";
import Analyze from "@/pages/Analyze";
import Analysis from "@/pages/Analysis";
import Profile from "@/pages/Profile";
import Features from "@/pages/Features";
import NotFound from "@/pages/NotFound";
import PostCommentAnalysis from "@/pages/PostCommentAnalysis";
import TwitterAnalysis from "@/pages/TwitterAnalysis";
import YoutubeAnalysis from "@/pages/YoutubeAnalysis";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import errorLogger, { LogLevel } from "@/utils/errorLogger";
import NetworkStatusMonitor from "@/components/NetworkStatusMonitor";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import EnhancedNetworkMonitor from "@/components/EnhancedNetworkMonitor";

// Configure React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        errorLogger.error(error, { source: "react-query" });
      },
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        errorLogger.error(error, { source: "react-query-mutation" });
      },
    },
  },
});

const App = () => {
  // State for the current transition type
  const [transitionType, setTransitionType] = useState<
    "fade" | "slide" | "zoom" | "none"
  >("fade");

  // Set up global error handlers
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      errorLogger.error(event.reason, {
        type: "unhandled-rejection",
        message: event.reason?.message || "Unhandled Promise Rejection",
      });
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      errorLogger.error(event.error, {
        type: "uncaught-error",
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Log application start
    errorLogger.info("Application started", {
      version: "1.0.0",
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Handle errors from ErrorBoundary
  const handleErrorBoundaryError = (
    error: Error,
    errorInfo: React.ErrorInfo
  ) => {
    errorLogger.error(error, {
      type: "error-boundary",
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <ErrorBoundary
      componentName="App"
      onError={handleErrorBoundaryError}
      resetOnPropsChange={false}
    >
      <GlobalErrorHandler>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <TransitionContext.Provider
                value={{ transitionType, setTransitionType }}
              >
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <NetworkStatusMonitor />
                  <EnhancedNetworkMonitor />
                  <BrowserRouter>
                    <div className="min-h-screen flex flex-col bg-navy dark:bg-navy light:bg-white transition-colors duration-300">
                      <Navbar />
                      <main className="flex-grow transition-all duration-300">
                        <ErrorBoundary
                          componentName="Routes"
                          onError={handleErrorBoundaryError}
                        >
                          <Routes>
                            <Route
                              path="/"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <Home />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/login"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <Login />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/signup"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <Signup />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/forgot-password"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <ForgotPassword />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/reset-password/:token"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <ResetPassword />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/about"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <About />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/features"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <Features />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/post-comment-analysis"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <PostCommentAnalysis />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/how-to-use"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <HowToUse />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/twitter-analysis"
                              element={
                                <ProtectedRoute>
                                  <PageTransition
                                    transitionType={transitionType}
                                  >
                                    <TwitterAnalysis />
                                  </PageTransition>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/youtube-analysis"
                              element={
                                <ProtectedRoute>
                                  <PageTransition
                                    transitionType={transitionType}
                                  >
                                    <YoutubeAnalysis />
                                  </PageTransition>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/analyze"
                              element={
                                <ProtectedRoute>
                                  <PageTransition
                                    transitionType={transitionType}
                                  >
                                    <Analyze />
                                  </PageTransition>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/analysis"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <Analysis />
                                </PageTransition>
                              }
                            />
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute>
                                  <PageTransition
                                    transitionType={transitionType}
                                  >
                                    <Profile />
                                  </PageTransition>
                                </ProtectedRoute>
                              }
                            />
                            {/* Redirect root to login if not authenticated */}
                            <Route
                              path="*"
                              element={
                                <PageTransition transitionType={transitionType}>
                                  <NotFound />
                                </PageTransition>
                              }
                            />
                          </Routes>
                        </ErrorBoundary>
                      </main>
                      <Footer />
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </TransitionContext.Provider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  );
};

export default App;
