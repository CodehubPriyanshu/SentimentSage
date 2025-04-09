
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BadgeCheck, MessageSquare, TrendingUp, ChevronRight } from 'lucide-react';

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

const Home = () => {
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

  return (
    <div className="min-h-screen bg-navy">
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Understand Your <span className="text-blue">Audience</span> Through <span className="text-blue">AI Comment Analysis</span>
            </h1>
            
            <p className="text-gray-400 text-lg mt-6 max-w-2xl">
              Get real-time insights from social media comments. Discover what people are saying about your brand and make data-driven decisions.
            </p>
            
            <div className="mt-8">
              <Link to="/analyze">
                <Button className="btn-primary text-lg px-6 py-3">
                  Analyze Comments <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="card p-6 hover:shadow-xl transition-shadow">
                <BadgeCheck className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Accurate Analysis</h3>
                <p className="text-gray-400">
                  Our AI provides precise sentiment analysis with over 95% accuracy.
                </p>
              </div>
              
              <div className="card p-6 hover:shadow-xl transition-shadow">
                <MessageSquare className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Comment Processing</h3>
                <p className="text-gray-400">
                  Analyze thousands of comments from multiple social platforms.
                </p>
              </div>
              
              <div className="card p-6 hover:shadow-xl transition-shadow">
                <TrendingUp className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Trend Insights</h3>
                <p className="text-gray-400">
                  Spot trends and shifts in audience sentiment over time.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sentiment Overview Sidebar */}
          <div className="lg:w-96 mt-12 lg:mt-0">
            <div className="card animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Sentiment Overview</h2>
              
              <div className="space-y-4 mb-6">
                <SentimentBar type="positive" percentage={65} label="Positive" />
                <SentimentBar type="neutral" percentage={25} label="Neutral" />
                <SentimentBar type="negative" percentage={10} label="Negative" />
              </div>
              
              <h3 className="text-lg font-medium text-white mb-3">Sample Comments</h3>
              {sampleComments.map((comment, index) => (
                <CommentCard 
                  key={index}
                  comment={comment.comment}
                  sentiment={comment.sentiment}
                  author={comment.author}
                />
              ))}
              
              <div className="mt-4 text-center">
                <Link to="/analyze">
                  <Button variant="outline" className="btn-secondary">
                    Try with your comments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
