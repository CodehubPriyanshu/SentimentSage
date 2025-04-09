
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-gray-400 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product Column */}
          <div>
            <h3 className="text-white font-medium mb-4">PRODUCT</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/post-analysis" className="hover:text-white transition-colors">Post Comment Analysis</Link></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="text-white font-medium mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/about#team" className="hover:text-white transition-colors">Our Team</Link></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div>
            <h3 className="text-white font-medium mb-4">LEGAL</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom row with copyright and support */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 mt-8 pt-8">
          <p className="text-sm">© 2025 SentimentSage. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <Mail className="h-4 w-4 mr-2" />
            <span className="text-sm">Support: support@sentimentsage.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
