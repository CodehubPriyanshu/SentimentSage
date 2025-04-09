
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BarChart, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-navy">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            About <span className="text-blue">SentimentSage</span>
          </h1>
          
          <p className="text-gray-300 text-lg text-center mb-12">
            Empowering businesses to understand their audience through advanced sentiment analysis.
          </p>
          
          <div className="space-y-12">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300">
                At SentimentSage, we believe that understanding your audience is the key to success in today's digital landscape. Our mission is to provide businesses with powerful yet easy-to-use tools for analyzing social media sentiment, helping them make informed decisions based on real customer feedback.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card p-6 flex flex-col items-center text-center">
                <Users className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Who We Serve</h3>
                <p className="text-gray-400">
                  Social media managers, marketing teams, and business owners who need audience insights.
                </p>
              </div>
              
              <div className="card p-6 flex flex-col items-center text-center">
                <BarChart className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Our Approach</h3>
                <p className="text-gray-400">
                  We combine advanced AI with intuitive design to make sentiment analysis accessible.
                </p>
              </div>
              
              <div className="card p-6 flex flex-col items-center text-center">
                <Award className="h-12 w-12 text-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Our Values</h3>
                <p className="text-gray-400">
                  Accuracy, privacy, and actionable insights that drive real business results.
                </p>
              </div>
            </div>
            
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Technology</h2>
              <p className="text-gray-300 mb-4">
                SentimentSage leverages cutting-edge natural language processing to analyze social media comments across multiple platforms. Our proprietary algorithms can detect subtle emotional cues, sarcasm, and context-specific sentiments to provide the most accurate analysis available.
              </p>
              <p className="text-gray-300">
                We continuously train and refine our models using diverse datasets to ensure fairness and reliability across different industries, languages, and cultural contexts.
              </p>
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
    </div>
  );
};

export default About;
