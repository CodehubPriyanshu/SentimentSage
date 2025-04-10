
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, ChevronDown, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
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
      description: "You have been signed out of your account"
    });
    navigate('/login');
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  // Check if the link is active
  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue" : "";
  };
  
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
          <Link to="/" className={`nav-link ${isActive("/")}`}>Home</Link>
          <Link to="/how-to-use" className={`nav-link ${isActive("/how-to-use")}`}>How to Use</Link>
          {user ? (
            <>
              <Link to="/post-comment-analysis" className={`nav-link ${isActive("/post-comment-analysis")}`}>
                Select Social Media to Analyze
              </Link>
              <Link to="/analyze" className={`nav-link ${isActive("/analyze")}`}>
                Text Analysis
              </Link>
            </>
          ) : (
            <Link to="/post-comment-analysis" className={`nav-link ${isActive("/post-comment-analysis")}`}>
              Post Comment Analysis
            </Link>
          )}
        </div>
        
        {/* User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="text-white dark:text-white light:text-navy transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white dark:text-white light:text-navy">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue hover:bg-blue-light rounded-full">Sign Up</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white dark:text-white light:text-navy">
                  <Avatar className="h-8 w-8 border border-blue">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-blue text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{profile?.full_name || user.email}</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="text-white dark:text-white light:text-navy"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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
            <Link to="/" className={`nav-link text-lg ${isActive("/")}`} onClick={toggleMenu}>Home</Link>
            <Link to="/how-to-use" className={`nav-link text-lg ${isActive("/how-to-use")}`} onClick={toggleMenu}>How to Use</Link>
            
            {user ? (
              <>
                <Link to="/post-comment-analysis" className={`nav-link text-lg ${isActive("/post-comment-analysis")}`} onClick={toggleMenu}>
                  Select Social Media to Analyze
                </Link>
                <Link to="/analyze" className={`nav-link text-lg ${isActive("/analyze")}`} onClick={toggleMenu}>
                  Text Analysis
                </Link>
              </>
            ) : (
              <Link to="/post-comment-analysis" className={`nav-link text-lg ${isActive("/post-comment-analysis")}`} onClick={toggleMenu}>
                Post Comment Analysis
              </Link>
            )}
            
            <div className="border-t border-gray-700 dark:border-gray-700 light:border-gray-300 my-4 pt-4">
              {!user ? (
                <>
                  <Link to="/login" onClick={toggleMenu}>
                    <Button variant="ghost" className="text-white dark:text-white light:text-navy w-full justify-start">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={toggleMenu} className="mt-2 block">
                    <Button className="bg-blue hover:bg-blue-light w-full rounded-full">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" onClick={toggleMenu}>
                    <Button variant="ghost" className="text-white dark:text-white light:text-navy w-full justify-start">
                      <User size={20} className="mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="text-white dark:text-white light:text-navy w-full justify-start mt-2"
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
