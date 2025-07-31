import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler for uncaught exceptions
const handleGlobalError = (event: ErrorEvent) => {
  console.error("Uncaught error:", event.error);
  // Prevent the default browser error handling
  event.preventDefault();

  // You could also log to a monitoring service here
  // or display a user-friendly error message
};

// Global promise rejection handler
const handlePromiseRejection = (event: PromiseRejectionEvent) => {
  console.error("Unhandled promise rejection:", event.reason);
  // Prevent the default browser error handling
  event.preventDefault();
};

// Register global error handlers
window.addEventListener("error", handleGlobalError);
window.addEventListener("unhandledrejection", handlePromiseRejection);

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
