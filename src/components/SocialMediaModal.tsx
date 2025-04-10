
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Twitter, Youtube, X } from 'lucide-react';

interface SocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialMediaModal = ({ isOpen, onClose }: SocialMediaModalProps) => {
  const navigate = useNavigate();

  const handleTwitterSelect = () => {
    onClose();
    navigate('/twitter-analysis');
  };

  const handleYoutubeSelect = () => {
    onClose();
    navigate('/youtube-analysis');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-navy-light border-navy-dark dark:bg-navy-light light:bg-gray-light max-w-md w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white dark:text-white light:text-navy">Select Social Media Platform</DialogTitle>
          <DialogDescription className="text-gray dark:text-gray light:text-gray-dark">
            Choose a platform to analyze content from
          </DialogDescription>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-white dark:text-white light:text-navy" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Button 
            onClick={handleTwitterSelect} 
            className="bg-blue hover:bg-blue-light text-white h-24 flex flex-col items-center justify-center gap-2 p-6 transition-transform hover:scale-105"
          >
            <Twitter className="h-8 w-8" />
            <span>Twitter/X</span>
          </Button>
          
          <Button 
            onClick={handleYoutubeSelect} 
            className="bg-blue hover:bg-blue-light text-white h-24 flex flex-col items-center justify-center gap-2 p-6 transition-transform hover:scale-105"
          >
            <Youtube className="h-8 w-8" />
            <span>YouTube</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMediaModal;
