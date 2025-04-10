
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BadgeCheck, MessageSquare, TrendingUp, ChevronRight, Lightbulb, BarChart2, RefreshCw } from 'lucide-react';
import ContentModal from '@/components/ContentModal';
import { useAuth } from '@/hooks/useAuth';

interface SentimentBarProps {
  type: 'positive' | 'neutral' | 'negative';
  percentage: number;
  label: string;
}

const SentimentBar: React.FC<SentimentBarProps> = ({ type, percentage, label }) => {
  const colors = {
    positive: 'bg-sentiment-positive',
    neutral: 'bg-sentiment-neutral',
    negative: 'bg-sentiment-negative',
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-navy-dark rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[type]}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

interface CommentCardProps {
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  author: string;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, sentiment, author }) => {
  const colors = {
    positive: 'border-sentiment-positive',
    neutral: 'border-sentiment-neutral',
    negative: 'border-sentiment-negative',
  };
  
  return (
    <div className={`p-3 border-l-4 ${colors[sentiment]} bg-navy-light bg-opacity-60 rounded-r mb-3`}>
      <p className="text-sm text-gray-200">{comment}</p>
      <p className="text-xs text-gray-400 mt-1">- {author}</p>
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

const Home = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, description: string, content: React.ReactNode}>({
    title: '', 
    description: '', 
    content: null
  });

  const sampleComments = [
    {
      comment: "This product is amazing! I've seen great results already.",
      sentiment: 'positive' as const,
      author: '@happyuser123'
    },
    {
      comment: "It's okay, but I expected more features for the price.",
      sentiment: 'neutral' as const,
      author: '@neutralfeedback'
    },
    {
      comment: "Terrible customer service. I'll never buy again.",
      sentiment: 'negative' as const,
      author: '@dissatisfied_customer'
    }
  ];

  const openHowItWorks = () => {
    setModalContent({
      title: 'How SentimentSage Works',
      description: 'Learn more about our sentiment analysis process',
      content: (
        <div className="space-y-6 text-left">
          <p className="text-gray-300">
            SentimentSage uses advanced AI models to analyze social media comments and provide 
            valuable insights into audience sentiment. Here's a more detailed breakdown of our process:
          </p>
          <div className="space-y-4">
            <div className="card p-4">
              <h4 className="text-lg font-bold text-white">1. Comment Collection</h4>
              <p className="text-gray-300">
                We gather comments from your social media posts across multiple platforms, preserving 
                context and metadata for the most accurate analysis.
              </p>
            </div>
            <div className="card p-4">
              <h4 className="text-lg font-bold text-white">2. AI-Powered Analysis</h4>
              <p className="text-gray-300">
                Our sophisticated machine learning models analyze the comments to determine sentiment, 
                identify key topics, and extract actionable insights.
              </p>
            </div>
            <div className="card p-4">
              <h4 className="text-lg font-bold text-white">3. Visualization & Reports</h4>
              <p className="text-gray-300">
                We transform the raw data into clear, intuitive visualizations and comprehensive 
                reports that help you understand your audience better.
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
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-white light:text-navy">
              Understand Your <span className="text-blue">Audience</span> Through <span className="text-blue">AI Comment Analysis</span>
            </h1>
            
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg mt-6 max-w-2xl">
              Free to access comment analysis in text to uncover sentiment, engagement patterns, and gain valuable insights into your audience.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {!user ? (
                <Link to="/login">
                  <Button className="bg-blue hover:bg-blue-light text-white font-medium rounded-full text-lg px-6 py-3 transition-transform hover:scale-105">
                    Get Started <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/analyze">
                  <Button className="bg-blue hover:bg-blue-light text-white font-medium rounded-full text-lg px-6 py-3 transition-transform hover:scale-105">
                    Analyze Profile <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              
              <Link to="/post-comment-analysis">
                <Button variant="outline" className="rounded-full text-lg px-6 py-3 dark:text-white light:text-navy dark:border-white light:border-navy transition-transform hover:scale-105">
                  Post Comment Analysis
                </Button>
              </Link>
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-navy mb-6">How SentimentSage Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
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
                  icon={BarChart2} 
                  title="Visualize Results" 
                  description="View easy-to-understand charts and reports of your audience's sentiment."
                />
              </div>
              <div className="text-center mt-8">
                <Button variant="outline" onClick={openHowItWorks} className="dark:text-white light:text-navy dark:border-white light:border-navy">
                  Learn More About Our Process
                </Button>
              </div>
            </div>
            
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="card p-6 hover:shadow-xl transition-shadow">
                <BadgeCheck className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">Accurate Analysis</h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                  Our AI provides precise sentiment analysis with over 95% accuracy.
                </p>
              </div>
              
              <div className="card p-6 hover:shadow-xl transition-shadow">
                <RefreshCw className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">Comment Processing</h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                  Analyze thousands of comments from multiple social platforms.
                </p>
              </div>
              
              <div className="card p-6 hover:shadow-xl transition-shadow">
                <TrendingUp className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">Trend Insights</h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                  Spot trends and shifts in audience sentiment over time.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sentiment Overview Sidebar */}
          <div className="lg:w-96 mt-12 lg:mt-0">
            <div className="card animate-fade-in">
              <h2 className="text-xl font-bold text-white dark:text-white light:text-navy mb-4">Sentiment Overview</h2>
              
              <div className="space-y-4 mb-6">
                <SentimentBar type="positive" percentage={65} label="Positive" />
                <SentimentBar type="neutral" percentage={25} label="Neutral" />
                <SentimentBar type="negative" percentage={10} label="Negative" />
              </div>
              
              <h3 className="text-lg font-medium text-white dark:text-white light:text-navy mb-3">Sample Comments</h3>
              {sampleComments.map((comment, index) => (
                <CommentCard 
                  key={index}
                  comment={comment.comment}
                  sentiment={comment.sentiment}
                  author={comment.author}
                />
              ))}
              
              <div className="mt-4 text-center">
                {!user ? (
                  <Link to="/login">
                    <Button variant="outline" className="dark:text-white light:text-navy dark:border-white light:border-navy hover:bg-blue/10">
                      Try with your comments
                    </Button>
                  </Link>
                ) : (
                  <Link to="/analyze">
                    <Button variant="outline" className="dark:text-white light:text-navy dark:border-white light:border-navy hover:bg-blue/10">
                      Analyze your comments
                    </Button>
                  </Link>
                )}
              </div>
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

export default Home;
