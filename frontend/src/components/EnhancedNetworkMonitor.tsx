import React, { useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Wifi, WifiOff } from 'lucide-react';
import errorLogger from '@/utils/errorLogger';

/**
 * EnhancedNetworkMonitor component
 * 
 * Monitors the network status and shows toast notifications when the connection status changes.
 * Also logs network status changes to the error logger.
 * Includes ping functionality to detect poor connections.
 */
const EnhancedNetworkMonitor: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'unknown'>('unknown');

  // Function to check connection quality by pinging the API
  const checkConnectionQuality = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectionQuality('unknown');
      return;
    }

    try {
      const startTime = Date.now();
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const endTime = Date.now();
      const pingTime = endTime - startTime;

      // If ping time is greater than 1000ms, consider it a poor connection
      if (pingTime > 1000) {
        setConnectionQuality('poor');
        errorLogger.warn('Poor network connection detected', { 
          pingTime,
          online: navigator.onLine
        });
      } else {
        setConnectionQuality('good');
      }
    } catch (error) {
      // If we can't reach the server but browser says we're online,
      // it might be a partial connection issue
      if (navigator.onLine) {
        setConnectionQuality('poor');
        errorLogger.warn('Connection issue detected', { 
          error,
          online: navigator.onLine
        });
      } else {
        setConnectionQuality('unknown');
      }
    }
  }, []);

  // Handle online status change
  const handleOnlineStatusChange = useCallback(() => {
    const currentlyOnline = navigator.onLine;
    
    // Log status change
    errorLogger.info(`Network status changed: ${currentlyOnline ? 'online' : 'offline'}`, {
      previous: isOnline,
      current: currentlyOnline
    });
    
    // Update state
    setIsOnline(currentlyOnline);
    
    if (!currentlyOnline) {
      // We just went offline
      setWasOffline(true);
      setConnectionQuality('unknown');
      
      toast({
        title: 'You are offline',
        description: 'Please check your internet connection',
        variant: 'destructive',
        icon: <WifiOff className="h-5 w-5" />
      });
    } else if (wasOffline) {
      // We were offline but now we're back online
      setWasOffline(false);
      
      toast({
        title: 'You are back online',
        description: 'Your internet connection has been restored',
        icon: <Wifi className="h-5 w-5" />
      });
      
      // Check connection quality after coming back online
      checkConnectionQuality();
    }
  }, [isOnline, wasOffline, checkConnectionQuality]);

  useEffect(() => {
    // Set up event listeners for online/offline events
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Initial connection quality check
    checkConnectionQuality();
    
    // Set up periodic connection quality checks
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkConnectionQuality();
      }
    }, 30000); // Check every 30 seconds
    
    // Clean up event listeners and interval on unmount
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      clearInterval(intervalId);
    };
  }, [handleOnlineStatusChange, checkConnectionQuality]);

  // This component doesn't render anything visible
  return null;
};

export default EnhancedNetworkMonitor;
