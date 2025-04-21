import React, { useContext } from "react";
import { Link, LinkProps, useNavigate, useLocation } from "react-router-dom";

interface SmoothLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  transitionType?: "fade" | "slide" | "zoom" | "none";
}

// Create a context to store the current transition type
export const TransitionContext = React.createContext<{
  transitionType: "fade" | "slide" | "zoom" | "none";
  setTransitionType: (type: "fade" | "slide" | "zoom" | "none") => void;
}>({
  transitionType: "fade",
  setTransitionType: () => {},
});

const SmoothLink: React.FC<SmoothLinkProps> = ({
  to,
  children,
  className = "",
  onClick,
  transitionType,
  ...rest
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transitionType: contextTransitionType, setTransitionType } =
    useContext(TransitionContext);

  // Use the prop if provided, otherwise use the context value
  const effectiveTransitionType = transitionType || contextTransitionType;

  // Don't trigger transitions when clicking the current page link
  const isCurrentPage =
    location.pathname === (typeof to === "string" ? to : to.pathname);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCurrentPage) {
      return; // Don't prevent default for current page to allow scroll to top
    }

    e.preventDefault();

    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Update the transition type in context if specified in props
    if (transitionType) {
      setTransitionType(transitionType);
    }

    // Use View Transitions API if available and not disabled
    if (document.startViewTransition && effectiveTransitionType !== "none") {
      document.startViewTransition(() => {
        navigate(to.toString());
      });
    } else {
      // Fallback for browsers that don't support View Transitions API
      navigate(to.toString());
    }
  };

  return (
    <Link
      to={to}
      className={`transition-all duration-300 ${className} ${
        isCurrentPage ? "pointer-events-auto" : ""
      }`}
      onClick={handleClick}
      aria-current={isCurrentPage ? "page" : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default SmoothLink;
