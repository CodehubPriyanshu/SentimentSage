import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SmoothLink from "./SmoothLink";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account",
    });
    navigate("/login");
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  // Check if the link is active
  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue" : "";
  };

  return (
    <nav className="bg-navy-dark py-4 px-6 shadow-md dark:bg-navy-dark light:bg-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <SmoothLink
          to="/"
          className="flex items-center gap-2"
          transitionType="fade"
        >
          <div className="w-8 h-8 bg-blue rounded-md flex items-center justify-center text-white font-bold">
            SS
          </div>
          <span className="text-xl font-bold text-white dark:text-white light:text-navy">
            Sentiment<span className="text-blue">Sage</span>
          </span>
        </SmoothLink>

        {/* Desktop Menu - Using flexbox for adjustable layout */}
        <div className="hidden md:flex items-center space-x-4 flex-grow justify-center">
          <SmoothLink
            to="/"
            className={`nav-link ${isActive("/")}`}
            transitionType="fade"
          >
            Home
          </SmoothLink>
          <SmoothLink
            to="/how-to-use"
            className={`nav-link ${isActive("/how-to-use")}`}
            transitionType="slide"
          >
            How to Use
          </SmoothLink>
          {user && (
            <SmoothLink
              to="/analysis"
              className={`nav-link ${isActive("/analysis")}`}
              transitionType="slide"
            >
              Analysis
            </SmoothLink>
          )}
          <SmoothLink
            to="/features"
            className={`nav-link ${isActive("/features")}`}
            transitionType="slide"
          >
            Features
          </SmoothLink>
          <SmoothLink
            to="/about"
            className={`nav-link ${isActive("/about")}`}
            transitionType="fade"
          >
            About
          </SmoothLink>
        </div>

        {/* User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="text-white dark:text-white light:text-navy transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {!user ? (
            <>
              <SmoothLink to="/login" transitionType="zoom">
                <Button
                  variant="ghost"
                  className="text-white dark:text-white light:text-navy"
                >
                  Login
                </Button>
              </SmoothLink>
              <SmoothLink to="/signup" transitionType="zoom">
                <Button className="bg-blue hover:bg-blue-light rounded-full">
                  Sign Up
                </Button>
              </SmoothLink>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-10 w-10 rounded-full overflow-hidden border-2 border-blue"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-blue text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 dark:bg-navy-light light:bg-gray-light"
              >
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="text-blue dark:text-blue light:text-blue"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Theme Toggle - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="text-white dark:text-white light:text-navy"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <button
            className="text-white dark:text-white light:text-navy"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-navy-dark dark:bg-navy-dark light:bg-white z-50 px-6 pt-6 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <SmoothLink
              to="/"
              className={`nav-link text-lg ${isActive("/")}`}
              onClick={toggleMenu}
              transitionType="fade"
            >
              Home
            </SmoothLink>
            <SmoothLink
              to="/how-to-use"
              className={`nav-link text-lg ${isActive("/how-to-use")}`}
              onClick={toggleMenu}
              transitionType="slide"
            >
              How to Use
            </SmoothLink>
            {user && (
              <SmoothLink
                to="/analysis"
                className={`nav-link text-lg ${isActive("/analysis")}`}
                onClick={toggleMenu}
                transitionType="slide"
              >
                Analysis
              </SmoothLink>
            )}
            <SmoothLink
              to="/features"
              className={`nav-link text-lg ${isActive("/features")}`}
              onClick={toggleMenu}
              transitionType="slide"
            >
              Features
            </SmoothLink>
            <SmoothLink
              to="/about"
              className={`nav-link text-lg ${isActive("/about")}`}
              onClick={toggleMenu}
              transitionType="fade"
            >
              About
            </SmoothLink>

            <div className="border-t border-gray-700 dark:border-gray-700 light:border-gray-300 my-4 pt-4">
              {!user ? (
                <>
                  <SmoothLink
                    to="/login"
                    onClick={toggleMenu}
                    transitionType="zoom"
                  >
                    <Button
                      variant="ghost"
                      className="text-white dark:text-white light:text-navy w-full justify-start"
                    >
                      Login
                    </Button>
                  </SmoothLink>
                  <SmoothLink
                    to="/signup"
                    onClick={toggleMenu}
                    className="mt-2 block"
                    transitionType="zoom"
                  >
                    <Button className="bg-blue hover:bg-blue-light w-full rounded-full">
                      Sign Up
                    </Button>
                  </SmoothLink>
                </>
              ) : (
                <>
                  <SmoothLink
                    to="/profile"
                    onClick={toggleMenu}
                    transitionType="slide"
                  >
                    <Button
                      variant="ghost"
                      className="text-blue dark:text-blue light:text-blue w-full justify-start"
                    >
                      <User size={20} className="mr-2" />
                      Profile
                    </Button>
                  </SmoothLink>
                  <Button
                    variant="ghost"
                    className="text-red-500 w-full justify-start mt-2"
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                  >
                    <LogOut size={20} className="mr-2" />
                    Log out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
