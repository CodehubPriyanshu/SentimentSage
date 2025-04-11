
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BarChart, Award, Shield, MessageSquare, Lightbulb } from 'lucide-react';
import ContentModal from '@/components/ContentModal';

interface TeamMemberProps {
  name: string;
  image?: string; 
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, image }) => {
  return (
    <div className="card p-6 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-blue/20 rounded-full mb-4 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="rounded-full w-full h-full object-cover" />
        ) : (
          <Users className="h-10 w-10 text-blue" />
        )}
      </div>
      <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">{name}</h3>
    </div>
  );
};

const StepCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="card hover:shadow-xl transition-shadow p-6">
    <div className="rounded-full bg-blue/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-blue" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const About = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({title: '', description: '', content: <></>});

  const openPrivacyModal = () => {
    setModalContent({
      title: 'Privacy & Security',
      description: 'Learn more about how we protect your data',
      content: (
        <div className="space-y-6 text-left">
          <p className="text-gray-300">
            At SentimentSage, we take privacy and security very seriously. Our commitment to protecting your data and respecting user privacy is fundamental to our service.
          </p>
          <h4 className="text-xl font-bold text-white">Data Collection</h4>
          <p className="text-gray-300">
            We only analyze public comments from social media platforms. We never collect, store, or analyze private messages or content that has not been made publicly available by the users.
          </p>
          <h4 className="text-xl font-bold text-white">Data Security</h4>
          <p className="text-gray-300">
            All data transmitted to and from our servers is encrypted using industry-standard TLS/SSL protocols. Your analysis results are stored securely and are only accessible to you.
          </p>
          <h4 className="text-xl font-bold text-white">Data Retention</h4>
          <p className="text-gray-300">
            You have complete control over your data. You can delete your analysis results at any time, and we automatically remove data that has not been accessed for an extended period.
          </p>
          <h4 className="text-xl font-bold text-white">Transparency</h4>
          <p className="text-gray-300">
            We are committed to transparency in our data practices. Our full privacy policy outlines in detail how we collect, use, and protect your information.
          </p>
        </div>
      )
    });
    setModalOpen(true);
  };

  const openTeamModal = () => {
    setModalContent({
      title: 'Our Team',
      description: 'The minds behind SentimentSage',
      content: (
        <div className="space-y-6 text-left">
          <p className="text-gray-300">
            SentimentSage was developed as a final year project by BCA students at ITM University. Our team combines expertise in artificial intelligence, natural language processing, and web development.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="card p-6">
              <h4 className="text-lg font-bold text-white">Priyanshu Kumar</h4>
              <p className="text-gray-400 mt-2">
                Responsible for implementing the core sentiment analysis algorithms and backend architecture.
              </p>
            </div>
            <div className="card p-6">
              <h4 className="text-lg font-bold text-white">Vibhu Chaturvedi</h4>
              <p className="text-gray-400 mt-2">
                Specialized in training and fine-tuning the NLP models for sentiment analysis.
              </p>
            </div>
            <div className="card p-6">
              <h4 className="text-lg font-bold text-white">Vikas Rawat</h4>
              <p className="text-gray-400 mt-2">
                Designed and implemented the user interface and visualization components.
              </p>
            </div>
            <div className="card p-6">
              <h4 className="text-lg font-bold text-white">Ankit Kumar</h4>
              <p className="text-gray-400 mt-2">
                Focused on system integration, authentication, and deployment infrastructure.
              </p>
            </div>
            <div className="card p-6">
              <h4 className="text-lg font-bold text-white">Manish Jain</h4>
              <p className="text-gray-300">Guide</p>
              <p className="text-gray-400 mt-2">
                Provided expert guidance and mentorship throughout the development process.
              </p>
            </div>
          </div>
        </div>
      )
    });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            About <span className="text-blue">SentimentSage</span>
          </h1>
          
          <p className="text-gray-300 text-lg text-center mb-12">
            A final year project by BCA students at ITM University, harnessing AI to analyze social media sentiment
          </p>
          
          <div className="space-y-12">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300">
                At SentimentSage, we believe that understanding your audience is the key to success in today's digital landscape. Our mission is to provide businesses with powerful yet easy-to-use tools for analyzing social media sentiment, helping them make informed decisions based on real customer feedback.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <StepCard 
                  icon={MessageSquare} 
                  title="Collect Comments" 
                  description="Gather comments from your social media posts with a simple URL or file upload."
                />
                <StepCard 
                  icon={Lightbulb} 
                  title="Analyze Sentiment" 
                  description="Our AI processes each comment to determine sentiment and extract key insights."
                />
                <StepCard 
                  icon={BarChart} 
                  title="Visualize Results" 
                  description="View easy-to-understand charts and reports of your audience's sentiment."
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center" id="team">Our Team</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <TeamMember name="Priyanshu Kumar" />
                <TeamMember name="Vibhu Chaturvedi" />
                <TeamMember name="Vikas Rawat" />
                <TeamMember name="Ankit Kumar" />
                <TeamMember name="Manish Jain" />
              </div>
              <div className="text-center mt-6">
                <Button variant="outline" onClick={openTeamModal}>
                  Learn More About Our Team
                </Button>
              </div>
            </div>
            
            <div className="card p-8">
              <div className="flex items-start">
                <Shield className="h-8 w-8 text-blue mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Privacy & Security</h2>
                  <p className="text-gray-300 mb-4">
                    SentimentSage only analyzes public comments from social media platforms. We respect user privacy and never collect or process any private data. All analysis is performed securely on our servers, and your results are only accessible to you.
                  </p>
                  <Button variant="outline" onClick={openPrivacyModal}>
                    Learn More About Our Privacy Practices
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/signup">
                <Button className="btn-primary">
                  Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <ContentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalContent.title}
        description={modalContent.description}
      >
        {modalContent.content}
      </ContentModal>
    </div>
  );
};

export default About;
