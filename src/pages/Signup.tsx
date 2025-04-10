
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';

const benefits = [
  "Analyze social media comments",
  "Save sentiment results",
  "Export detailed reports"
];

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreed: false
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
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.fullName
      );
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully. Please check your email to confirm your account.",
        });
        navigate('/login');
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
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-2">Create an account</h1>
        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">Start analyzing social media sentiment</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              className="input-field"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          
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
              placeholder="Create a password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-3 pt-2">
            <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 mb-2">With SentimentSage, you can:</p>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Checkbox 
                  id={`benefit-${index}`} 
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <Label htmlFor={`benefit-${index}`} className="text-gray-300 dark:text-gray-300 light:text-gray-600 font-normal">
                  {benefit}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="agreed" 
              checked={formData.agreed}
              onCheckedChange={(checked) => 
                handleCheckboxChange('agreed', checked as boolean)
              }
            />
            <Label htmlFor="agreed" className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 font-normal">
              I agree to the <Link to="/terms" className="text-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue hover:underline">Privacy Policy</Link>
            </Label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue hover:bg-blue-light"
            disabled={loading || !formData.agreed}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
          
          <p className="text-center text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
