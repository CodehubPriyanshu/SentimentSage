import React, { useEffect, useState } from "react";

interface LoadingIndicatorProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullScreen?: boolean;
  progress?: number; // Progress prop (0-100)
  showProgress?: boolean; // Whether to show the progress bar
  steps?: string[]; // Optional array of steps to display
  currentStep?: number; // Current step index
  pulseEffect?: boolean; // Whether to use pulse effect on spinner
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "medium",
  text = "Loading...",
  fullScreen = false,
  progress = 0,
  showProgress = false,
  steps = [],
  currentStep = 0,
  pulseEffect = true,
}) => {
  // State for animated dots
  const [dots, setDots] = useState("");

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Determine spinner size
  const spinnerSizeClasses = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  // Determine text size
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  // Ensure progress is within bounds
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Format progress text
  const progressText = `${Math.round(normalizedProgress)}%`;

  // Determine if we should show steps
  const showSteps = steps.length > 0;

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      {/* Animated spinner with optional pulse effect */}
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue ${
          spinnerSizeClasses[size]
        } ${pulseEffect ? "animate-pulse" : ""}`}
      ></div>

      {/* Main loading text */}
      {text && (
        <p
          className={`mt-2 text-gray-200 dark:text-gray-200 light:text-gray-700 ${textSizeClasses[size]} font-medium`}
        >
          {text}
          {dots}
        </p>
      )}

      {/* Progress bar with improved styling */}
      {showProgress && (
        <div className="w-full max-w-xs mt-4">
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue bg-navy-dark">
                  {progressText}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-navy-dark">
              <div
                style={{ width: `${normalizedProgress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue transition-all duration-500 ease-in-out rounded-full"
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Steps indicator */}
      {showSteps && (
        <div className="mt-4 w-full max-w-xs">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                    index < currentStep
                      ? "bg-green-500"
                      : index === currentStep
                      ? "bg-blue animate-pulse"
                      : "bg-navy-dark"
                  }`}
                >
                  {index < currentStep ? (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : index === currentStep ? (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  ) : null}
                </div>
                <span
                  className={`text-sm ${
                    index < currentStep
                      ? "text-green-400"
                      : index === currentStep
                      ? "text-blue"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-navy bg-opacity-90 z-50 backdrop-blur-sm">
        <div className="bg-navy-light p-8 rounded-xl shadow-2xl border border-gray-700">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-light p-6 rounded-xl shadow-lg border border-gray-700">
      {spinner}
    </div>
  );
};

export default LoadingIndicator;
