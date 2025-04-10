
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import ContentModal from '@/components/ContentModal';

const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    description?: string;
    content: React.ReactNode;
  }>({
    title: '',
    description: '',
    content: null
  });

  const openOurTeamModal = () => {
    setModalContent({
      title: 'Our Team',
      description: 'Meet the talented individuals behind SentimentSage',
      content: (
        <div className="space-y-8">
          <p className="text-gray dark:text-gray light:text-gray-dark">
            SentimentSage was created as a final year project by BCA students at ITM University.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Priyanshu Kumar' },
              { name: 'Vibhu Chaturvedi' },
              { name: 'Vikas Rawat' },
              { name: 'Ankit Kumar' }
            ].map((member, index) => (
              <div key={index} className="bg-navy p-4 rounded-lg">
                <h3 className="text-white font-medium">{member.name}</h3>
              </div>
            ))}
          </div>
          
          <div className="bg-navy p-4 rounded-lg mt-6">
            <h3 className="text-white font-medium">Manish Jain</h3>
            <p className="text-gray text-sm">Faculty Mentor, ITM University</p>
          </div>
        </div>
      )
    });
    setModalOpen(true);
  };

  const openPrivacyPolicy = () => {
    setModalContent({
      title: 'Privacy Policy',
      content: (
        <div className="text-gray dark:text-gray light:text-gray-dark space-y-4">
          <p>
            SentimentSage analyzes only publicly available social media comments. We do not store your personal data, and analysis results are secured in your private dashboard, deletable at any time.
          </p>
          <p>
            We respect your privacy and the privacy of the content you analyze. Our service is designed with data protection as a priority.
          </p>
          <p>
            You maintain full control over your data and can request its deletion at any time through your account settings.
          </p>
        </div>
      )
    });
    setModalOpen(true);
  };

  const openTermsOfService = () => {
    setModalContent({
      title: 'Terms of Service',
      content: (
        <div className="text-gray dark:text-gray light:text-gray-dark space-y-4">
          <p>
            By using SentimentSage, you agree to analyze public comments for sentiment insights, adhering to our usage policies and respecting platform terms.
          </p>
          <p>
            Users are responsible for ensuring they have the right to analyze the content they submit to our platform.
          </p>
          <p>
            SentimentSage reserves the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.
          </p>
        </div>
      )
    });
    setModalOpen(true);
  };

  return (
    <footer className="bg-navy-dark text-gray dark:bg-navy-dark light:bg-gray-light dark:text-gray light:text-gray-dark mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product Column */}
          <div>
            <h3 className="text-blue dark:text-blue light:text-blue font-medium mb-4">PRODUCT</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="hover:text-blue-light dark:hover:text-blue-light light:hover:text-blue hover:underline transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-to-use" className="hover:text-blue-light dark:hover:text-blue-light light:hover:text-blue hover:underline transition-colors">
                  How to Use
                </Link>
              </li>
              <li>
                <Link to="/post-comment-analysis" className="hover:text-blue-light dark:hover:text-blue-light light:hover:text-blue hover:underline transition-colors">
                  Post Comment Analysis
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="text-blue dark:text-blue light:text-blue font-medium mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-blue-light dark:hover:text-blue-light light:hover:text-blue hover:underline transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <button 
                  onClick={openOurTeamModal} 
                  className="text-gray dark:text-gray light:text-gray-dark hover:text-blue-light dark:hover:text-blue-light light:hover:text-blue hover:underline transition-colors text-left"
                >
                  Our Team
                </button>
              </li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div>
            <h3 className="text-blue dark:text-blue light:text-blue font-medium mb-4">LEGAL</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={openPrivacyPolicy} 
                  className="text-gray dark:text-gray light:text-gray-dark hover:text-blue-light dark:hover:text-blue-light light:hover:text-blue hover:underline transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={openTermsOfService} 
                  className="text-gray dark:text-gray light:text-gray-dark hover:text-blue-light dark:hover:text-blue-light light:hover:text-blue hover:underline transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom row with copyright and support */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 dark:border-gray-700 light:border-gray-300 mt-8 pt-8">
          <p className="text-sm">© 2025 SentimentSage. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <Mail className="h-4 w-4 mr-2" />
            <span className="text-sm">Support: support@sentimentsage.com</span>
          </div>
        </div>
      </div>

      <ContentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalContent.title}
        description={modalContent.description || ''}
      >
        {modalContent.content}
      </ContentModal>
    </footer>
  );
};

export default Footer;
