
import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

// Mock authentication checking
// In a real app, you would use Firebase/Auth0 to check if the user is authenticated
const isAuthenticated = (): boolean => {
  // For demonstration purposes, this returns true
  // In a real app, this would check the auth state
  return true;
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    toast({
      title: "Authentication Required",
      description: "Please log in to access this page",
      variant: "destructive",
    });
    
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
