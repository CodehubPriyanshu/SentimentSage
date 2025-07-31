import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  BarChart,
  Award,
  Shield,
  MessageSquare,
  Lightbulb,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Camera,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ContentModal from "@/components/ContentModal";

interface TeamMemberProps {
  name: string;
  image?: string;
  role?: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, image, role }) => {
  return (
    <div className="card p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
      <div className="w-24 h-24 bg-blue/20 rounded-full mb-4 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="rounded-full w-full h-full object-cover"
          />
        ) : (
          <Users className="h-10 w-10 text-blue" />
        )}
      </div>
      <h3 className="text-lg font-bold text-white dark:text-white light:text-navy">
        {name}
      </h3>
      {role && <p className="text-gray-400 text-sm mt-1">{role}</p>}
    </div>
  );
};

const StepCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
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
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
    content: <></>,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if it's an image file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingPhoto(true);

      // Create a FormData object
      const formData = new FormData();
      formData.append("photo", file);

      // Upload the file directly to replace the developer photo
      const response = await fetch("/api/developer/photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload developer photo");
      }

      toast({
        title: "Success",
        description: "Developer photo updated successfully",
      });

      // Refresh the page to show the new photo
      window.location.reload();
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: "Failed to upload developer photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const openPrivacyModal = () => {
    setModalContent({
      title: "Privacy & Security",
      description: "Learn more about how we protect your data",
      content: (
        <div className="space-y-6 text-left">
          <p className="text-gray-300">
            At SentimentSage, we take privacy and security very seriously. Our
            commitment to protecting your data and respecting user privacy is
            fundamental to our service.
          </p>
          <h4 className="text-xl font-bold text-white">Data Collection</h4>
          <p className="text-gray-300">
            We only analyze public comments from social media platforms. We
            never collect, store, or analyze private messages or content that
            has not been made publicly available by the users.
          </p>
          <h4 className="text-xl font-bold text-white">Data Security</h4>
          <p className="text-gray-300">
            All data transmitted to and from our servers is encrypted using
            industry-standard TLS/SSL protocols. Your analysis results are
            stored securely and are only accessible to you.
          </p>
          <h4 className="text-xl font-bold text-white">Data Retention</h4>
          <p className="text-gray-300">
            You have complete control over your data. You can delete your
            analysis results at any time, and we automatically remove data that
            has not been accessed for an extended period.
          </p>
          <h4 className="text-xl font-bold text-white">Transparency</h4>
          <p className="text-gray-300">
            We are committed to transparency in our data practices. Our full
            privacy policy outlines in detail how we collect, use, and protect
            your information.
          </p>
        </div>
      ),
    });
    setModalOpen(true);
  };

  const openDeveloperModal = () => {
    setModalContent({
      title: "About the Developer",
      description: "The mind behind SentimentSage",
      content: (
        <div className="space-y-6 text-left">
          <p className="text-gray-300">
            SentimentSage was developed as a final year project by Priyanshu
            Kumar, a BCA student at ITM University, Gwalior. The project
            combines expertise in artificial intelligence, natural language
            processing, and web development.
          </p>
          <div className="card p-6">
            <h4 className="text-lg font-bold text-white">Priyanshu Kumar</h4>
            <p className="text-gray-300 text-sm">
              Full Stack Developer | BCA Student
            </p>
            <p className="text-gray-400 mt-2">
              A passionate developer with strong interests in data analysis and
              web development. Responsible for implementing the core sentiment
              analysis algorithms, frontend design, and backend architecture of
              SentimentSage.
            </p>
          </div>
        </div>
      ),
    });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            About{" "}
            <span className="text-navy dark:text-blue light:text-navy">
              SentimentSage
            </span>
          </h1>

          <p className="text-gray-300 text-lg text-center mb-12">
            A final year project by Priyanshu Kumar at ITM University,
            harnessing AI to analyze social media sentiment
          </p>

          <div className="space-y-12">
            <div className="card p-8 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-white mb-4">
                Project Overview
              </h2>
              <p className="text-gray-300">
                SentimentSage is a web application developed by Priyanshu Kumar
                as a final year project for the Bachelor of Computer
                Applications (BCA) degree at ITM University, Gwalior.
              </p>
              <p className="text-gray-300 mt-4">
                The core functionality of SentimentSage is to perform sentiment
                analysis on social media content, providing users with valuable
                insights into public opinion. The application can analyze
                comments from YouTube videos and Twitter/X posts, fetching data
                in real-time and presenting a comprehensive sentiment breakdown.
              </p>
              <p className="text-gray-300 mt-4">
                Using advanced NLP algorithms and AI technologies, SentimentSage
                generates insightful analytics that help businesses, content
                creators, and researchers understand audience sentiment,
                identify trends, and make data-driven decisions. This project
                reflects Priyanshu's passion for data analysis and web
                development.
              </p>
            </div>

            <div className="card p-8 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-white mb-4">
                Our Mission
              </h2>
              <p className="text-gray-300">
                At SentimentSage, we believe that understanding your audience is
                the key to success in today's digital landscape. Our mission is
                to provide businesses with powerful yet easy-to-use tools for
                analyzing social media sentiment, helping them make informed
                decisions based on real customer feedback.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                How It Works
              </h2>
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
              <h2
                className="text-2xl font-bold text-white mb-6 text-center"
                id="team"
              >
                About the Developer
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-8 card hover:shadow-xl transition-shadow">
                <div className="relative group">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden flex-shrink-0 border-4 border-blue/30 group-hover:border-blue transition-colors duration-300">
                    <img
                      src="/assets/priyanshu_kumar.jpg"
                      alt="Priyanshu Kumar"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-blue/80 text-white px-3 py-1 rounded-full text-sm mt-32">
                      Click to upload photo
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Priyanshu Kumar
                  </h3>
                  <p className="text-blue mb-4">
                    Full Stack Developer | BCA Student at ITM University,
                    Gwalior
                  </p>
                  <p className="text-gray-300 mb-4">
                    Passionate about data analysis and web development. Enjoys
                    building innovative applications that solve real-world
                    problems using cutting-edge technologies and artificial
                    intelligence.
                  </p>
                  <div className="flex gap-4 justify-center md:justify-start">
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue transition-colors"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                    <a
                      href="https://github.com/CodehubPriyanshu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue transition-colors"
                      aria-label="GitHub Profile"
                    >
                      <Github className="h-6 w-6" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue transition-colors"
                      aria-label="Instagram Profile"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue transition-colors"
                      aria-label="Twitter Profile"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={openDeveloperModal}
                  className="hover:bg-blue/10 transition-colors"
                >
                  Learn More About the Developer
                </Button>
              </div>
            </div>

            <div className="card p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-start">
                <Shield className="h-8 w-8 text-blue mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Privacy & Security
                  </h2>
                  <p className="text-gray-300 mb-4">
                    SentimentSage only analyzes public comments from social
                    media platforms. We respect user privacy and never collect
                    or process any private data. All analysis is performed
                    securely on our servers, and your results are only
                    accessible to you.
                  </p>
                  <Button
                    variant="outline"
                    onClick={openPrivacyModal}
                    className="hover:bg-blue/10 transition-colors"
                  >
                    Learn More About Our Privacy Practices
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link to="/signup">
                <Button className="btn-primary hover:bg-blue-light transition-transform hover:scale-105">
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
