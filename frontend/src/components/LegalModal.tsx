import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-navy-light dark:bg-navy-light light:bg-white">
        <DialogHeader>
          <DialogTitle className="text-white dark:text-white light:text-navy">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400 dark:text-gray-400 light:text-gray-600">
            Please read this information carefully.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[50vh] pr-4">
          <div className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm">
            {content}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose} className="bg-blue hover:bg-blue-light">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LegalModal;
