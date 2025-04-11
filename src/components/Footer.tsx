
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Mail } from 'lucide-react';
import ContentModal from '@/components/ContentModal';

const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: <></>
  });

  const openTermsModal = () => {
    setModalContent({
      title: 'Terms of Service',
      content: (
        <div className="space-y-4 text-left">
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            By using SentimentSage, you agree to analyze public social media comments (Twitter/X, YouTube) for sentiment insights, 
            adhering to our usage policies and respecting platform terms. Unauthorized use or data scraping is prohibited.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">Acceptance of Terms</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            By accessing or using SentimentSage, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">Permitted Use</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            You may use SentimentSage to analyze publicly available comments from supported social media platforms for sentiment analysis purposes.
            You must comply with all applicable laws and the terms of service of the respective social media platforms.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">Prohibited Activities</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            You may not use SentimentSage for any illegal or unauthorized purpose, including but not limited to:
            <ul className="list-disc ml-5 mt-2">
              <li>Scraping or collecting data in violation of platform terms</li>
              <li>Analyzing private or non-public comments without proper authorization</li>
              <li>Reverse engineering or attempting to extract the source code of our service</li>
              <li>Interfering with or disrupting the integrity or performance of SentimentSage</li>
            </ul>
          </p>
        </div>
      )
    });
    setModalOpen(true);
  };

  const openPrivacyModal = () => {
    setModalContent({
      title: 'Privacy Policy',
      content: (
        <div className="space-y-4 text-left">
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            SentimentSage processes only publicly available data from Twitter/X and YouTube. We do not store personal user data, 
            and analysis results are secured in your private account, deletable at any time, with data handled per GDPR compliance.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">Data Collection</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            We collect and process only publicly available comments from supported social media platforms. We do not collect private messages,
            emails, or content that has not been made public by users of these platforms.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">Data Storage</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            Analysis results are stored securely and are only accessible to you through your account. You can delete your analysis results
            at any time, and we automatically remove data that has not been accessed for an extended period.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">Data Protection</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration,
            disclosure, or destruction, in compliance with GDPR and other applicable data protection regulations.
          </p>
        </div>
      )
    });
    setModalOpen(true);
  };

  const openCookieModal = () => {
    setModalContent({
      title: 'Cookie Policy',
      content: (
        <div className="space-y-4 text-left">
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            SentimentSage uses cookies to enhance user experience and track analytics. You can manage cookie preferences in your 
            browser settings, and we do not share cookie data with third parties.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">What Are Cookies</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used
            to make websites work more efficiently and provide information to the owners of the site.
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">How We Use Cookies</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            We use cookies for the following purposes:
            <ul className="list-disc ml-5 mt-2">
              <li>To enable certain functions of the service</li>
              <li>To provide analytics</li>
              <li>To store your preferences</li>
              <li>To enable authentication and session management</li>
            </ul>
          </p>
          <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">Managing Cookie Preferences</h3>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            You can manage or delete cookies based on your preferences through your browser settings. For more information about how to do this,
            please visit the help section of your browser.
          </p>
        </div>
      )
    });
    setModalOpen(true);
  };

  const openContactModal = () => {
    setModalContent({
      title: 'Contact Us',
      content: (
        <div className="space-y-6 text-left">
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            Have questions or feedback? Reach out to us using the following email addresses:
          </p>
          <div className="space-y-4">
            <a href="mailto:sentimentsagemails@gmail.com" className="flex items-center text-gray-300 dark:text-gray-300 light:text-gray-dark hover:text-blue transition-colors">
              <Mail className="h-5 w-5 mr-2 text-blue" />
              sentimentsagemails@gmail.com
            </a>
            <a href="mailto:priyanshumails.bca2025@gmail.com" className="flex items-center text-gray-300 dark:text-gray-300 light:text-gray-dark hover:text-blue transition-colors">
              <Mail className="h-5 w-5 mr-2 text-blue" />
              priyanshumails.bca2025@gmail.com
            </a>
          </div>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark">
            We typically respond within 24-48 hours during business days.
          </p>
        </div>
      )
    });
    setModalOpen(true);
  };

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
                <button 
                  onClick={openContactModal} 
                  className="text-left hover:text-blue transition-colors hover:scale-105"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 dark:text-white light:text-navy">LEGAL</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={openTermsModal} className="hover:text-blue transition-colors text-left">Terms of Service</button>
              </li>
              <li>
                <button onClick={openPrivacyModal} className="hover:text-blue transition-colors text-left">Privacy Policy</button>
              </li>
              <li>
                <button onClick={openCookieModal} className="hover:text-blue transition-colors text-left">Cookie Policy</button>
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

      <ContentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalContent.title}
      >
        {modalContent.content}
      </ContentModal>
    </footer>
  );
};

export default Footer;
