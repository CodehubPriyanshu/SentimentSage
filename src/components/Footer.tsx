
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-gray py-12 dark:bg-navy-dark light:bg-white light:text-gray-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 dark:text-white light:text-navy">SentimentSage</h3>
            <p className="mb-4">
              Uncovering audience sentiment through AI-powered comment analysis.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 text-xl">
              <a href="#" className="hover:text-blue transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-blue transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-blue transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-blue transition-colors">
                <FaLinkedin />
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 dark:text-white light:text-navy">PRODUCT</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="hover:text-blue transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/how-to-use" className="hover:text-blue transition-colors">How to Use</Link>
              </li>
              <li>
                <Link to="/analysis" className="hover:text-blue transition-colors">Text Analysis</Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 dark:text-white light:text-navy">RESOURCES</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-blue transition-colors">About Us</Link>
              </li>
              <li>
                <a href="#" className="hover:text-blue transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 dark:text-white light:text-navy">LEGAL</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue transition-colors">Cookie Policy</a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center">
          <p>
            &copy; {new Date().getFullYear()} SentimentSage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
