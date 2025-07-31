import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, ArrowLeft, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorStack: string | null;
  componentStack: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorStack: null,
    componentStack: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      errorStack: error.stack || null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Extract component stack from errorInfo
    const componentStack = errorInfo.componentStack || null;

    // Update state with error info
    this.setState({ errorInfo, componentStack });

    // Log error to console
    console.error("Uncaught error:", error);
    console.error("Component stack:", errorInfo.componentStack);

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You could also log to an error reporting service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  // Reset error state when props change if resetOnPropsChange is true
  public componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorStack: null,
        componentStack: null,
      });
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorStack: null,
      componentStack: null,
    });
  };

  private handleCopyError = () => {
    const { error, componentStack } = this.state;
    const errorText = `
Error: ${error?.toString() || "Unknown error"}

Component Stack: ${componentStack || "Not available"}

Error Stack: ${error?.stack || "Not available"}

Timestamp: ${new Date().toISOString()}
Component: ${this.props.componentName || "Unknown"}
`;

    navigator.clipboard.writeText(errorText).then(
      () => {
        toast({
          title: "Error details copied",
          description: "Error information has been copied to clipboard",
        });
      },
      (err) => {
        console.error("Could not copy error details:", err);
        toast({
          title: "Copy failed",
          description: "Could not copy error details to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  private handleGoBack = () => {
    window.history.back();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, componentStack } = this.state;
      const componentName = this.props.componentName || "Unknown component";

      return (
        <div className="min-h-screen bg-navy dark:bg-navy light:bg-white flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Alert className="bg-navy-dark dark:bg-navy-dark light:bg-gray-light border-red-500 border-opacity-50">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-white dark:text-white light:text-navy text-lg">
                Something went wrong in {componentName}
              </AlertTitle>
              <AlertDescription className="text-gray-300 dark:text-gray-300 light:text-gray-dark mt-2">
                <p className="mb-4">
                  We encountered an unexpected error. Please try refreshing the
                  page or contact support if the problem persists.
                </p>
                {error && (
                  <div className="bg-navy-light dark:bg-navy-light light:bg-gray-200 p-3 rounded-md mb-4 overflow-auto max-h-40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-xs">
                        Error details:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={this.handleCopyError}
                        className="h-6 px-2 text-gray-400 hover:text-white"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-red-400 text-sm font-mono">
                      {error.toString()}
                    </p>
                    {componentStack && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">
                          Component stack:
                        </p>
                        <p className="text-amber-400 text-xs font-mono whitespace-pre-wrap">
                          {componentStack.split("\n").slice(0, 3).join("\n")}
                          {componentStack.split("\n").length > 3 && (
                            <span className="text-gray-500">...</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-center mt-4 space-x-2">
                  <Button
                    onClick={this.handleReset}
                    className="bg-blue hover:bg-blue-light"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleGoBack}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                    className="border-blue text-blue"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
