/**
 * React Hook for Analytics Integration
 * Provides easy access to analytics tracking functionality
 */

import { useEffect, useRef, useState } from 'react';
import { analyticsSync, type AnalyticsEvent, type SyncStatus, type UserIdentifiers } from '@/lib/analyticsSync';

export interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackInteractions?: boolean;
  autoIdentifyUser?: boolean;
}

export interface AnalyticsHookReturn {
  // Core tracking methods
  track: (eventType: string, eventAction: string, metadata?: Record<string, any>) => void;
  trackPageView: (pageSlug?: string) => void;
  trackConversion: (conversionType: string, value?: number, metadata?: Record<string, any>) => void;
  trackInteraction: (interactionType: string, elementId?: string, metadata?: Record<string, any>) => void;
  
  // User identification
  identifyUser: (identifiers: UserIdentifiers) => Promise<void>;
  
  // Status information
  syncStatus: SyncStatus;
  sessionId: string;
  globalUserId?: number;
  deviceFingerprint?: string;
  
  // Control methods
  forceSyncNow: () => Promise<void>;
  clearQueue: () => void;
  
  // State
  isOnline: boolean;
  pendingEvents: number;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): AnalyticsHookReturn {
  const {
    trackPageViews = true,
    trackInteractions = false,
    autoIdentifyUser = true
  } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(analyticsSync.getSyncStatus());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Update sync status periodically
  useEffect(() => {
    const updateStatus = () => {
      if (mountedRef.current) {
        setSyncStatus(analyticsSync.getSyncStatus());
        setIsOnline(navigator.onLine);
      }
    };

    // Update immediately
    updateStatus();

    // Set up interval
    intervalRef.current = setInterval(updateStatus, 1000);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mountedRef.current = false;
    };
  }, []);

  // Track page views automatically
  useEffect(() => {
    if (trackPageViews) {
      const currentPath = window.location.pathname;
      analyticsSync.trackPageView(currentPath.substring(1) || 'home');
    }
  }, [trackPageViews]);

  // Auto-identify user from URL params or localStorage
  useEffect(() => {
    if (autoIdentifyUser) {
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');
      const phone = urlParams.get('phone');
      
      if (email || phone) {
        analyticsSync.identifyUser({ email: email || undefined, phone: phone || undefined });
      }
    }
  }, [autoIdentifyUser]);

  // Return the hook interface
  return {
    // Core tracking methods
    track: (eventType: string, eventAction: string, metadata?: Record<string, any>) => {
      analyticsSync.trackEvent(eventType, eventAction, metadata);
    },
    
    trackPageView: (pageSlug?: string) => {
      analyticsSync.trackPageView(pageSlug);
    },
    
    trackConversion: (conversionType: string, value?: number, metadata?: Record<string, any>) => {
      analyticsSync.trackConversion(conversionType, value, metadata);
    },
    
    trackInteraction: (interactionType: string, elementId?: string, metadata?: Record<string, any>) => {
      analyticsSync.trackInteraction(interactionType, elementId, metadata);
    },
    
    // User identification
    identifyUser: async (identifiers: UserIdentifiers) => {
      await analyticsSync.identifyUser(identifiers);
      setSyncStatus(analyticsSync.getSyncStatus());
    },
    
    // Status information
    syncStatus,
    sessionId: analyticsSync.getSessionId(),
    globalUserId: analyticsSync.getGlobalUserId(),
    deviceFingerprint: analyticsSync.getDeviceFingerprint(),
    
    // Control methods
    forceSyncNow: async () => {
      await analyticsSync.forceSyncNow();
      setSyncStatus(analyticsSync.getSyncStatus());
    },
    
    clearQueue: () => {
      analyticsSync.clearQueue();
      setSyncStatus(analyticsSync.getSyncStatus());
    },
    
    // State
    isOnline,
    pendingEvents: syncStatus.pendingEvents
  };
}

// Hook for tracking specific component interactions
export function useComponentAnalytics(componentName: string, componentId?: string) {
  const { track, trackInteraction } = useAnalytics();

  const trackComponentEvent = (action: string, metadata?: Record<string, any>) => {
    track('component', action, {
      componentName,
      componentId,
      ...metadata
    });
  };

  const trackComponentInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    trackInteraction(interactionType, componentId, {
      componentName,
      ...metadata
    });
  };

  const trackComponentMount = (props?: Record<string, any>) => {
    trackComponentEvent('mount', { props });
  };

  const trackComponentUnmount = (duration?: number) => {
    trackComponentEvent('unmount', { duration });
  };

  const trackComponentError = (error: Error, errorInfo?: Record<string, any>) => {
    trackComponentEvent('error', {
      error: error.message,
      stack: error.stack,
      ...errorInfo
    });
  };

  return {
    trackComponentEvent,
    trackComponentInteraction,
    trackComponentMount,
    trackComponentUnmount,
    trackComponentError
  };
}

// Hook for A/B testing integration with analytics
export function useABTestingAnalytics() {
  const { track } = useAnalytics();

  const trackExperimentAssignment = (experimentId: string, variantId: string, metadata?: Record<string, any>) => {
    track('experiment', 'assignment', {
      experimentId,
      variantId,
      ...metadata
    });
  };

  const trackExperimentInteraction = (experimentId: string, variantId: string, action: string, metadata?: Record<string, any>) => {
    track('experiment', 'interaction', {
      experimentId,
      variantId,
      action,
      ...metadata
    });
  };

  const trackExperimentConversion = (experimentId: string, variantId: string, value?: number, metadata?: Record<string, any>) => {
    track('experiment', 'conversion', {
      experimentId,
      variantId,
      value,
      ...metadata
    });
  };

  return {
    trackExperimentAssignment,
    trackExperimentInteraction,
    trackExperimentConversion
  };
}

// Hook for e-commerce analytics
export function useEcommerceAnalytics() {
  const { track, trackConversion } = useAnalytics();

  const trackProductView = (productId: string, productName: string, category?: string, price?: number) => {
    track('ecommerce', 'product_view', {
      productId,
      productName,
      category,
      price
    });
  };

  const trackAddToCart = (productId: string, quantity: number = 1, price?: number) => {
    track('ecommerce', 'add_to_cart', {
      productId,
      quantity,
      price,
      value: price ? price * quantity : undefined
    });
  };

  const trackRemoveFromCart = (productId: string, quantity: number = 1) => {
    track('ecommerce', 'remove_from_cart', {
      productId,
      quantity
    });
  };

  const trackPurchase = (orderId: string, orderValue: number, items: Array<{
    productId: string;
    productName: string;
    category?: string;
    quantity: number;
    price: number;
  }>) => {
    trackConversion('purchase', orderValue, {
      orderId,
      items,
      itemCount: items.length,
      averageOrderValue: orderValue / items.length
    });
  };

  const trackCheckoutStep = (step: number, stepName: string, metadata?: Record<string, any>) => {
    track('ecommerce', 'checkout_step', {
      step,
      stepName,
      ...metadata
    });
  };

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackPurchase,
    trackCheckoutStep
  };
}