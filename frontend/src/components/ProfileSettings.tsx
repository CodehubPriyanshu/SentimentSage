import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  EyeIcon,
  EyeOffIcon,
  ChevronDown,
  ChevronUp,
  Shield,
  Bell,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { profileApi } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/utils/api";

// NotificationSettings component removed

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Password validation function
  const validatePassword = (
    password: string
  ): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    if (!/\d/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one special character",
      };
    }

    return { valid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate all fields are filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    // Validate new password and confirmation match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate new password is different from current password
    if (currentPassword === newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message);
      toast({
        title: "Password Requirements",
        description: passwordValidation.message,
        variant: "destructive",
      });
      return;
    }

    // Call API to change password
    setIsLoading(true);
    try {
      const response = await profileApi.changePassword(
        currentPassword,
        newPassword
      );

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Success - show toast and reset form
      toast({
        title: "Password Updated",
        description:
          "Your password has been changed successfully. Please log in again.",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // If logout is required, log the user out and redirect to login page
      if (response.logout_required) {
        setTimeout(async () => {
          await authApi.logout();
          navigate("/login");
        }, 2000); // Give user time to read the success message
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Shield className="h-5 w-5 text-blue" />
        <CardTitle className="text-white dark:text-white light:text-navy">
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="current-password"
              className="text-white dark:text-white light:text-navy"
            >
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                className="input-field pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="new-password"
              className="text-white dark:text-white light:text-navy"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                className={`input-field pr-10 ${
                  passwordError ? "border-red-500" : ""
                }`}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-white dark:text-white light:text-navy"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="input-field pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ProfileSettings = () => {
  const [securityExpanded, setSecurityExpanded] = useState(true);

  return (
    <div className="space-y-6">
      <div className="card">
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setSecurityExpanded(!securityExpanded)}
        >
          <h3 className="text-xl font-bold text-white dark:text-white light:text-navy flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue" />
            Security
          </h3>
          <ChevronDown
            className={`text-white dark:text-white light:text-navy h-5 w-5 transition-transform ${
              securityExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            securityExpanded ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <div className="p-4">
            <SecuritySettings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
