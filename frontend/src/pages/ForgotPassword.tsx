import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { authApi } from "@/utils/api";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.forgotPassword(email);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to send reset email",
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        setResetToken(result.reset_token || "");
        toast({
          title: "Success",
          description: "Password reset instructions sent to your email",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (resetToken) {
      navigate(`/reset-password/${resetToken}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy dark:bg-navy light:bg-white transition-colors duration-300">
      <div className="card max-w-md w-full animate-fade-in">
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-2">
          Forgot Password
        </h1>
        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
          {emailSent
            ? "Check your email for the verification code"
            : "Enter your email to receive a password reset link"}
        </p>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue hover:bg-blue-light transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Instructions"}
            </Button>

            <div className="flex justify-center mt-4">
              <Link
                to="/login"
                className="text-blue hover:underline flex items-center text-sm"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-12 w-12 text-blue" />
                </div>
                <h3 className="text-lg font-medium text-white dark:text-white light:text-navy mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                  We've sent a verification code to:
                </p>
                <p className="text-blue font-medium mt-1">{email}</p>
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-4 p-3 bg-navy-dark rounded-md">
                    <p className="text-yellow-400 text-sm font-medium">
                      Development Mode
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      In development mode, emails are not actually sent. Use the
                      following information to test:
                    </p>
                    <div className="mt-2 p-2 bg-navy rounded-md">
                      <p className="text-gray-300 text-sm">
                        OTP:{" "}
                        <span className="text-yellow-400 font-mono">
                          123456
                        </span>{" "}
                        (mock code)
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        Token:{" "}
                        <span className="text-yellow-400 font-mono text-xs">
                          {resetToken.substring(0, 16)}...
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              className="w-full bg-blue hover:bg-blue-light transition-colors duration-300"
              onClick={handleContinue}
            >
              Continue to Verification
            </Button>

            <p className="text-center text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
              Didn't receive the email?{" "}
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="text-blue hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
