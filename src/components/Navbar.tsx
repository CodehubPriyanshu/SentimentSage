
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <nav className="bg-navy-dark py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue rounded-md flex items-center justify-center text-white font-bold">
            SS
          </div>
          <span className="text-xl font-bold text-white">Sentiment<span className="text-blue">Sage</span></span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/how-to-use" className="nav-link">How to Use</Link>
          <Link to="/analyze" className="nav-link">Analyze</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
        
        {/* User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-white">Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-blue hover:bg-blue-light">Get Started</Button>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-navy-dark z-50 px-6 pt-6 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="nav-link text-lg" onClick={toggleMenu}>Home</Link>
            <Link to="/how-to-use" className="nav-link text-lg" onClick={toggleMenu}>How to Use</Link>
            <Link to="/analyze" className="nav-link text-lg" onClick={toggleMenu}>Analyze</Link>
            <Link to="/about" className="nav-link text-lg" onClick={toggleMenu}>About</Link>
            <div className="border-t border-gray-700 my-4 pt-4">
              <Link to="/login" onClick={toggleMenu}>
                <Button variant="ghost" className="text-white w-full justify-start">Login</Button>
              </Link>
              <Link to="/signup" onClick={toggleMenu} className="mt-2 block">
                <Button className="bg-blue hover:bg-blue-light w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
