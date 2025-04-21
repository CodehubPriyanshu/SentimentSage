import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy dark:bg-navy light:bg-white p-4">
      <div className="max-w-md w-full bg-navy-dark dark:bg-navy-dark light:bg-white rounded-lg shadow-lg p-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue bg-opacity-10 mb-6">
            <span className="text-5xl font-bold text-blue">404</span>
          </div>

          <h1 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-2">
            Page Not Found
          </h1>

          <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved. The URL{" "}
            <span className="text-blue font-mono text-sm">
              {location.pathname}
            </span>{" "}
            could not be found.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="default"
              className="bg-blue hover:bg-blue-light"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>

            <Button asChild variant="outline" className="border-blue text-blue">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
