import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import LegalModal from "@/components/LegalModal";
import TermsOfService from "@/data/termsOfService";
import PrivacyPolicy from "@/data/privacyPolicy";

const benefits = [
  "Analyze social media comments",
  "Save sentiment results",
  "Export detailed reports",
];

const Signup = () => {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    // Redirect to home if already authenticated
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreed) {
      toast({
        title: "Error",
        description:
          "You must agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to sign up with:", {
        email: formData.email,
        password: formData.password.length + " chars",
        fullName: formData.fullName,
      });

      const result = await signup(
        formData.email,
        formData.password,
        formData.fullName
      );

      console.log("Signup result:", result);

      if (result && result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Failed to create account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        navigate("/login");
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy dark:bg-navy light:bg-white">
      <div className="card max-w-md w-full animate-fade-in">
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-2">
          Create an account
        </h1>
        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
          Start analyzing social media sentiment
        </p>

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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="input-field pr-10"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue focus:outline-none"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 mb-2">
              With SentimentSage, you can:
            </p>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Checkbox
                  id={`benefit-${index}`}
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <Label
                  htmlFor={`benefit-${index}`}
                  className="text-gray-300 dark:text-gray-300 light:text-gray-600 font-normal"
                >
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
                handleCheckboxChange("agreed", checked as boolean)
              }
            />
            <Label
              htmlFor="agreed"
              className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600 font-normal"
            >
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-blue hover:underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-blue hover:underline"
              >
                Privacy Policy
              </button>
              {/* Terms of Service Modal */}
              <LegalModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                title="Terms of Service"
                content={<TermsOfService />}
              />
              {/* Privacy Policy Modal */}
              <LegalModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                title="Privacy Policy"
                content={<PrivacyPolicy />}
              />
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
