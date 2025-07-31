import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: "fade" | "slide" | "zoom" | "none";
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionType = "fade",
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("enter");
  const prevPathRef = useRef<string>("");

  // Skip transition on first render
  const isInitialRender = useRef(true);

  useEffect(() => {
    // Skip transition on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Only trigger transition when the path changes
    if (location.pathname !== displayLocation.pathname) {
      prevPathRef.current = displayLocation.pathname;
      setTransitionStage("exit");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "exit") {
      setTransitionStage("enter");
      setDisplayLocation(location);

      // Try to use View Transitions API if available
      if (document.startViewTransition && transitionType !== "none") {
        document.startViewTransition(() => {
          // This is just to trigger the View Transitions API
          document.documentElement.classList.toggle("use-view-transitions");
          setTimeout(() => {
            document.documentElement.classList.toggle("use-view-transitions");
          }, 0);
        });
      }
    }
  };

  // Determine transition class based on transition type
  const getTransitionClass = () => {
    if (transitionType === "none") return "";

    const baseClass = "page-transition";
    const stageClass = transitionStage === "enter" ? "enter" : "exit";
    const typeClass = transitionType;

    return `${baseClass} ${baseClass}-${typeClass}-${stageClass}`;
  };

  return (
    <div
      className={getTransitionClass()}
      onAnimationEnd={handleAnimationEnd}
      style={{
        animationDuration: "300ms",
        animationFillMode: "both",
        animationTimingFunction: "ease-in-out",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
