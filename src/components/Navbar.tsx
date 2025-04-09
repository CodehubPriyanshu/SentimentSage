
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <nav className="bg-navy-dark py-4 px-6 shadow-md dark:bg-navy-dark light:bg-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue rounded-md flex items-center justify-center text-white font-bold">
            SS
          </div>
          <span className="text-xl font-bold text-white dark:text-white light:text-navy">Sentiment<span className="text-blue">Sage</span></span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/how-to-use" className="nav-link">How to Use</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
        
        {/* User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="text-white"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          <Link to="/login">
            <Button variant="ghost" className="text-white">Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-blue hover:bg-blue-light rounded-full">Sign Up</Button>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Theme Toggle - Mobile */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="text-white"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          <button 
            className="text-white"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-navy-dark z-50 px-6 pt-6 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="nav-link text-lg" onClick={toggleMenu}>Home</Link>
            <Link to="/features" className="nav-link text-lg" onClick={toggleMenu}>Features</Link>
            <Link to="/how-to-use" className="nav-link text-lg" onClick={toggleMenu}>How to Use</Link>
            <Link to="/about" className="nav-link text-lg" onClick={toggleMenu}>About</Link>
            <div className="border-t border-gray-700 my-4 pt-4">
              <Link to="/login" onClick={toggleMenu}>
                <Button variant="ghost" className="text-white w-full justify-start">Login</Button>
              </Link>
              <Link to="/signup" onClick={toggleMenu} className="mt-2 block">
                <Button className="bg-blue hover:bg-blue-light w-full rounded-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
