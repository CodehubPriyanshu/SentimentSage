
import React from 'react';
import { X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const ContentModal = ({ isOpen, onClose, title, description, children }: ContentModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-navy-light border-navy-dark dark:bg-navy-light light:bg-white light:border-gray-200 max-w-4xl max-h-[80vh] w-[90vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white dark:text-white light:text-navy">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-gray-300 dark:text-gray-300 light:text-gray-600">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-white dark:text-white light:text-navy" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <ScrollArea className="h-full max-h-[60vh] pr-3">
          <div className="pr-4">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ContentModal;
