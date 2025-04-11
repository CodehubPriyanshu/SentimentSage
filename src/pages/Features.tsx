import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  PieChart, 
  Save, 
  Clock, 
  Lightbulb, 
  FileText,
  Twitter,
  Youtube,
  ArrowRight
} from 'lucide-react';
import ContentModal from '@/components/ContentModal';
import { useTheme } from "@/hooks/useTheme";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, onClick }) => {
  return (
    <div 
      className="card p-6 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group"
      onClick={onClick}
    >
      <div className="rounded-full bg-blue/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-blue" />
      </div>
      <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
      <div className="absolute inset-0 rounded-lg transition-colors group-hover:bg-blue/5 group-hover:border-blue/30"></div>
    </div>
  );
};

interface PlatformCardProps {
  icon: React.ElementType;
  name: string;
  description: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ icon: Icon, name, description }) => {
  return (
    <div className="card p-6 flex flex-col md:flex-row items-center md:items-start gap-4">
      <div className="rounded-full bg-blue/10 p-3 w-14 h-14 flex-shrink-0 flex items-center justify-center mb-2 md:mb-0">
        <Icon className="h-8 w-8 text-blue" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2 text-center md:text-left">{name}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

const Features = () => {
  const { isLightTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    description: string;
    content: React.ReactNode;
  }>({
    title: '',
    description: '',
    content: null
  });

  const openFeatureModal = (title: string, content: React.ReactNode) => {
    setModalContent({
      title,
      description: 'Learn more about this feature',
      content
    });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-6 animate-fade-in">
            Powerful Comment <span className="text-blue">Analysis</span> Features
          </h1>
          
          <p className="text-gray-300 text-lg text-center mb-12 animate-fade-in">
            Unlock the power of AI to understand audience sentiment and engagement on your social media posts
          </p>
          
          <div className="space-y-16">
            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              <FeatureCard 
                icon={BarChart2} 
                title="Sentiment Classification" 
                description="Automatically categorize comments as positive, neutral, or negative with high accuracy."
                onClick={() => openFeatureModal("Sentiment Classification", (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Our advanced sentiment analysis engine uses a combination of natural language processing 
                      and machine learning to accurately classify comments based on their emotional tone.
                    </p>
                    <div className="card p-4">
                      <h4 className="text-lg font-bold text-white">Key Benefits:</h4>
                      <ul className="list-disc pl-5 mt-2 text-gray-300">
                        <li>Identify the overall sentiment of your audience</li>
                        <li>Spot potentially negative feedback that requires attention</li>
                        <li>Understand emotional responses to different types of content</li>
                        <li>Track sentiment changes over time</li>
                      </ul>
                    </div>
                    <p className="text-gray-300">
                      The system can detect subtleties in language, including sarcasm, idioms, and 
                      context-specific expressions, providing you with accurate sentiment analysis 
                      across diverse comment styles.
                    </p>
                  </div>
                ))}
              />
              
              <FeatureCard 
                icon={PieChart} 
                title="Visual Analytics" 
                description="View intuitive charts and graphs showing sentiment distribution and trends."
                onClick={() => openFeatureModal("Visual Analytics", (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Transform complex sentiment data into clear, actionable visualizations that make 
                      it easy to understand your audience's feelings at a glance.
                    </p>
                    <div className="card p-4">
                      <h4 className="text-lg font-bold text-white">Available Visualizations:</h4>
                      <ul className="list-disc pl-5 mt-2 text-gray-300">
                        <li>Sentiment distribution pie charts</li>
                        <li>Sentiment trend line graphs over time</li>
                        <li>Comment volume heatmaps</li>
                        <li>Key topic word clouds</li>
                        <li>Engagement correlation matrices</li>
                      </ul>
                    </div>
                    <p className="text-gray-300">
                      All visualizations are interactive and can be customized to focus on specific 
                      time periods, sentiment categories, or topics of interest.
                    </p>
                  </div>
                ))}
              />
              
              <FeatureCard 
                icon={Save} 
                title="Save & Track" 
                description="Store analysis results to track sentiment changes over multiple posts."
                onClick={() => openFeatureModal("Save & Track", (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Build a comprehensive view of your audience's sentiment over time by saving 
                      and organizing your analysis results.
                    </p>
                    <div className="card p-4">
                      <h4 className="text-lg font-bold text-white">Features:</h4>
                      <ul className="list-disc pl-5 mt-2 text-gray-300">
                        <li>Save unlimited analysis results</li>
                        <li>Organize analyses by campaign, platform, or custom categories</li>
                        <li>Compare results across different posts</li>
                        <li>Export data in CSV, PDF, or image formats</li>
                      </ul>
                    </div>
                    <p className="text-gray-300">
                      Our tracking features help you identify long-term patterns in audience sentiment, 
                      allowing you to refine your content strategy based on historical performance.
                    </p>
                  </div>
                ))}
              />
              
              <FeatureCard 
                icon={Clock} 
                title="Historical Data" 
                description="Access past analyses and track sentiment changes over time."
                onClick={() => openFeatureModal("Historical Data", (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Never lose valuable insights with our comprehensive historical data storage and 
                      retrieval system.
                    </p>
                    <div className="card p-4">
                      <h4 className="text-lg font-bold text-white">Historical Analysis Features:</h4>
                      <ul className="list-disc pl-5 mt-2 text-gray-300">
                        <li>Unlimited storage of analysis results</li>
                        <li>Advanced search capabilities to find specific analyses</li>
                        <li>Time-based comparison tools</li>
                        <li>Trend identification across multiple time periods</li>
                      </ul>
                    </div>
                    <p className="text-gray-300">
                      Our historical data features let you track the evolution of audience sentiment 
                      across campaigns, seasons, or product lifecycles, giving you deeper insight into 
                      what drives positive engagement.
                    </p>
                  </div>
                ))}
              />
              
              <FeatureCard 
                icon={Lightbulb} 
                title="AI-Generated Insight" 
                description="Receive intelligent observations about your audience sentiment patterns."
                onClick={() => openFeatureModal("AI-Generated Insight", (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Go beyond basic sentiment analysis with our AI's intelligent insights that 
                      highlight patterns, anomalies, and opportunities in your audience data.
                    </p>
                    <div className="card p-4">
                      <h4 className="text-lg font-bold text-white">Smart Insights Include:</h4>
                      <ul className="list-disc pl-5 mt-2 text-gray-300">
                        <li>Automatic detection of sentiment shifts</li>
                        <li>Identification of comment themes and topics</li>
                        <li>Correlation between content types and sentiment</li>
                        <li>Suggestions for improving engagement</li>
                        <li>Early warning of potential issues or concerns</li>
                      </ul>
                    </div>
                    <p className="text-gray-300">
                      Our AI continually learns from your specific audience, becoming more accurate and 
                      relevant with each analysis, providing increasingly valuable insights over time.
                    </p>
                  </div>
                ))}
              />
              
              <FeatureCard 
                icon={FileText} 
                title="Content Recommendations" 
                description="Get suggestions for future content based on sentiment analysis."
                onClick={() => openFeatureModal("Content Recommendations", (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Transform audience insights into actionable content strategies with our 
                      AI-powered content recommendation system.
                    </p>
                    <div className="card p-4">
                      <h4 className="text-lg font-bold text-white">Recommendation Features:</h4>
                      <ul className="list-disc pl-5 mt-2 text-gray-300">
                        <li>Content topic suggestions based on positive sentiment patterns</li>
                        <li>Optimal posting time recommendations</li>
                        <li>Content format suggestions (video, image, text)</li>
                        <li>Language and tone recommendations</li>
                        <li>Engagement strategy adjustments</li>
                      </ul>
                    </div>
                    <p className="text-gray-300">
                      Our recommendations are based on your specific audience's preferences and 
                      behaviors, not generic advice, ensuring that your content strategy is 
                      perfectly tailored to your unique community.
                    </p>
                  </div>
                ))}
              />
            </div>
            
            {/* AI-driven Insights Section */}
            <div className="card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">AI-driven Insights & Recommendations</h2>
              
              <div className="space-y-6">
                <div className="bg-navy-dark p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-2">Key Features</h3>
                  <ul className="list-disc pl-5 text-gray-300">
                    <li>Topic extraction from comments</li>
                    <li>Automated sentiment trend analysis</li>
                    <li>Engagement pattern identification</li>
                    <li>Content performance prediction</li>
                  </ul>
                </div>
                
                <div className="bg-navy-dark p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-2">AI-Generated Insight</h3>
                  <p className="text-gray-300">
                    Our advanced AI models don't just classify comments—they identify patterns and trends, offering actionable recommendations to improve engagement and audience sentiment over time.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Platform Support Section */}
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Support for Multiple Social Media Platforms</h2>
              
              <div className="space-y-6 grid md:grid-cols-2 gap-6">
                <PlatformCard 
                  icon={Twitter} 
                  name="Twitter/X"
                  description="Gather insights from Twitter replies and quote tweets to track real-time sentiment around your brand or content."
                />
                
                <PlatformCard 
                  icon={Youtube} 
                  name="YouTube"
                  description="Process comments from YouTube videos to understand viewer reception and identify potential content improvements."
                />
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/signup">
                <Button className="btn-primary hover:bg-blue">
                  Get Started With All Features <ArrowRight className="ml-2 h-4 w-4" />
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

export default Features;
