import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Wifi, WifiOff } from 'lucide-react';
import errorLogger, { LogLevel } from '@/utils/errorLogger';

/**
 * NetworkStatusMonitor component
 * 
 * Monitors the network status and shows toast notifications when the connection status changes.
 * Also logs network status changes to the error logger.
 */
const NetworkStatusMonitor: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  
  useEffect(() => {
    // Handler for online status
    const handleOnline = () => {
      setIsOnline(true);
      
      // Only show reconnected toast if we were previously offline
      if (wasOffline) {
        toast({
          title: 'Connection Restored',
          description: 'Your internet connection has been restored.',
          variant: 'default',
          icon: <Wifi className="h-5 w-5 text-green-500" />,
        });
        
        // Log the reconnection
        errorLogger.info('Network connection restored', {
          type: 'network-status',
          status: 'online',
          timestamp: new Date().toISOString()
        });
      }
      
      setWasOffline(false);
    };
    
    // Handler for offline status
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      
      toast({
        title: 'Connection Lost',
        description: 'You are currently offline. Some features may be unavailable.',
        variant: 'destructive',
        duration: 5000,
        icon: <WifiOff className="h-5 w-5 text-red-500" />,
      });
      
      // Log the disconnection
      errorLogger.warn('Network connection lost', {
        type: 'network-status',
        status: 'offline',
        timestamp: new Date().toISOString()
      });
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Log initial network status
    errorLogger.info(`Initial network status: ${navigator.onLine ? 'online' : 'offline'}`, {
      type: 'network-status',
      status: navigator.onLine ? 'online' : 'offline',
      timestamp: new Date().toISOString()
    });
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);
  
  // This component doesn't render anything visible
  return null;
};

export default NetworkStatusMonitor;
