
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Redirect to home if already authenticated
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Invalid email or password",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy dark:bg-navy light:bg-white">
      <div className="card max-w-md w-full animate-fade-in">
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-2">Login</h1>
        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">Access your sentiment analysis dashboard</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-blue hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue hover:bg-blue-light"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </Button>
          
          <p className="text-center text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
