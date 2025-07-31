import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Upload,
  BarChart2,
  Download,
  ArrowRight,
  Twitter,
  Youtube,
  FileText,
  MessageSquare,
} from "lucide-react";

const HowToUse = () => {
  const steps = [
    {
      icon: <Upload className="h-10 w-10 text-blue" />,
      title: "Upload Your Comments",
      description:
        "Paste your comments or upload a CSV file containing comments from social media platforms.",
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-blue" />,
      title: "Analyze Sentiment",
      description:
        "Our AI will process the comments and categorize them as positive, neutral, or negative sentiment.",
    },
    {
      icon: <Download className="h-10 w-10 text-blue" />,
      title: "Export Results",
      description:
        "View detailed insights and export reports in various formats for your team.",
    },
  ];

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-16 bg-navy dark:bg-navy light:bg-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            How to Use{" "}
            <span className="text-navy dark:text-blue light:text-navy">
              SentimentSage
            </span>
          </h1>

          <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark text-lg text-center mb-12">
            Analyze social media sentiment in just a few simple steps
          </p>

          <div className="card p-8 mb-12 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="text-center transform hover:scale-105 transition-transform"
                >
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-blue/10 p-3 w-16 h-16 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                    {step.description}
                  </p>

                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 right-0 transform -translate-y-1/2 -translate-x-1/4">
                      <ArrowRight className="h-6 w-6 text-blue" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-navy">
              Detailed Instructions
            </h2>

            <div className="card p-6 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">
                1. Upload Your Comments
              </h3>
              <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark mb-4">
                Navigate to the Analyze page and choose one of these methods:
              </p>
              <ul className="list-disc pl-5 text-gray-300 dark:text-gray-300 light:text-gray-dark space-y-2">
                <li>Paste text directly into the comment box</li>
                <li>
                  Upload a CSV file with comments (requires column headers)
                </li>
                <li>
                  Connect to a social media platform using our integrations
                </li>
              </ul>
            </div>

            <div className="card p-6 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">
                2. Analyze Sentiment
              </h3>
              <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark mb-4">
                After uploading your comments:
              </p>
              <ul className="list-disc pl-5 text-gray-300 dark:text-gray-300 light:text-gray-dark space-y-2">
                <li>Click the "Analyze" button to start processing</li>
                <li>
                  Our AI will process each comment and determine its sentiment
                </li>
                <li>The analysis typically takes a few seconds to complete</li>
                <li>
                  View the results on your dashboard with detailed breakdowns
                </li>
              </ul>
            </div>

            <div className="card p-6 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-white dark:text-white light:text-navy mb-2">
                3. Export Results
              </h3>
              <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark mb-4">
                Once analysis is complete:
              </p>
              <ul className="list-disc pl-5 text-gray-300 dark:text-gray-300 light:text-gray-dark space-y-2">
                <li>View sentiment distribution charts and key metrics</li>
                <li>Explore individual comments by sentiment category</li>
                <li>Export reports as PDF, CSV, or Excel files</li>
                <li>Schedule regular reports (Premium feature)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-navy">
              Analysis Types
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-3">
                  <MessageSquare className="h-6 w-6 text-blue mr-2" />
                  <h3 className="text-xl font-bold text-white dark:text-white light:text-navy">
                    Text Analysis
                  </h3>
                </div>
                <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark mb-3">
                  Paste any text to get instant sentiment analysis with AI
                  insights.
                </p>
                <ul className="list-disc pl-5 text-gray-300 dark:text-gray-300 light:text-gray-dark space-y-1">
                  <li>Real-time analysis as you type</li>
                  <li>Sentiment classification</li>
                  <li>Key topic extraction</li>
                </ul>
              </div>

              <div className="card p-6 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-3">
                  <Twitter className="h-6 w-6 text-blue mr-2" />
                  <h3 className="text-xl font-bold text-white dark:text-white light:text-navy">
                    Twitter/X Analysis
                  </h3>
                </div>
                <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark mb-3">
                  Analyze tweets and replies to understand audience sentiment.
                </p>
                <ul className="list-disc pl-5 text-gray-300 dark:text-gray-300 light:text-gray-dark space-y-1">
                  <li>Enter tweet URL or username</li>
                  <li>Analyze multiple tweets at once</li>
                  <li>View sentiment distribution</li>
                </ul>
              </div>

              <div className="card p-6 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-3">
                  <Youtube className="h-6 w-6 text-blue mr-2" />
                  <h3 className="text-xl font-bold text-white dark:text-white light:text-navy">
                    YouTube Analysis
                  </h3>
                </div>
                <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark mb-3">
                  Analyze comments on YouTube videos to gauge viewer sentiment.
                </p>
                <ul className="list-disc pl-5 text-gray-300 dark:text-gray-300 light:text-gray-dark space-y-1">
                  <li>Enter video URL</li>
                  <li>Process hundreds of comments</li>
                  <li>View sentiment breakdown</li>
                </ul>
              </div>

              <div className="card p-6 bg-navy-dark dark:bg-navy-dark light:bg-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-3">
                  <FileText className="h-6 w-6 text-blue mr-2" />
                  <h3 className="text-xl font-bold text-white dark:text-white light:text-navy">
                    CSV Analysis
                  </h3>
                </div>
                <p className="text-gray-300 dark:text-gray-300 light:text-gray-dark mb-3">
                  Upload CSV files with comments for batch sentiment analysis.
                </p>
                <ul className="list-disc pl-5 text-gray-300 dark:text-gray-300 light:text-gray-dark space-y-1">
                  <li>Upload CSV with comments</li>
                  <li>Process thousands of entries</li>
                  <li>Get comprehensive reports</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/analyze">
              <Button className="btn-primary hover:bg-blue-light transition-transform hover:scale-105">
                Try It Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;
