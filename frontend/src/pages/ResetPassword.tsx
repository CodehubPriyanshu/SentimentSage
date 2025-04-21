import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { authApi } from "@/utils/api";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.verifyResetOTP(token || "", otp);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Invalid verification code",
          variant: "destructive",
        });
      } else {
        setOtpVerified(true);
        setEmail(result.email || "");
        toast({
          title: "Success",
          description: "Verification code accepted",
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.resetPassword(token || "", otp, newPassword);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to reset password",
          variant: "destructive",
        });
      } else {
        setResetSuccess(true);
        toast({
          title: "Success",
          description: "Your password has been reset successfully",
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-navy dark:bg-navy light:bg-white transition-colors duration-300">
        <div className="card max-w-md w-full animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-2">
              Password Reset Complete
            </h1>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
              Your password has been reset successfully.
            </p>

            <Button
              className="w-full bg-blue hover:bg-blue-light transition-colors duration-300"
              onClick={() => navigate("/login")}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy dark:bg-navy light:bg-white transition-colors duration-300">
      <div className="card max-w-md w-full animate-fade-in">
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-2">
          {otpVerified ? "Reset Password" : "Verify Code"}
        </h1>
        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
          {otpVerified
            ? "Create a new password for your account"
            : "Enter the verification code sent to your email"}
        </p>

        {!otpVerified ? (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                className="input-field"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue hover:bg-blue-light transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="flex justify-center mt-4">
              <Link
                to="/forgot-password"
                className="text-blue hover:underline flex items-center text-sm"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Forgot Password
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {email && (
              <div className="p-3 bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-lg mb-4">
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                  Resetting password for: <span className="text-blue">{email}</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="input-field pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="input-field pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue hover:bg-blue-light transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
