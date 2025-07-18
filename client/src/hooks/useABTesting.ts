import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface ExperimentVariant {
  id: number;
  experimentId: number;
  slug: string;
  name: string;
  description: string;
  trafficPercentage: number;
  configuration: any;
  isControl: boolean;
}

interface ExperimentAssignment {
  id: number;
  sessionId: string;
  experimentId: number;
  variantId: number;
  assignedAt: string;
  variant?: ExperimentVariant;
}

// Generate consistent session ID for user
function getSessionId(): string {
  let sessionId = localStorage.getItem('ab_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem('ab_session_id', sessionId);
  }
  return sessionId;
}

// Generate device fingerprint for cross-session tracking
function getDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

export function useABTesting() {
  const [sessionId] = useState(getSessionId);
  const [deviceFingerprint] = useState(getDeviceFingerprint);

  // Get user's experiment assignments
  const { data: assignments = [], refetch: refetchAssignments } = useQuery({
    queryKey: ['/api/sessions', sessionId, 'experiments'],
    enabled: !!sessionId,
  });

  // Assign user to experiment
  const assignToExperimentMutation = useMutation({
    mutationFn: async ({ experimentId }: { experimentId: number }) => {
      const response = await fetch(`/api/experiments/${experimentId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          deviceFingerprint,
        }),
      });
      if (!response.ok) throw new Error('Failed to assign to experiment');
      return response.json();
    },
    onSuccess: () => {
      refetchAssignments();
    },
  });

  // Track experiment events
  const trackEventMutation = useMutation({
    mutationFn: async ({ 
      experimentId, 
      variantId, 
      eventType, 
      eventValue,
      metadata 
    }: { 
      experimentId: number;
      variantId: number;
      eventType: string;
      eventValue?: string;
      metadata?: any;
    }) => {
      const response = await fetch('/api/experiments/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          experimentId,
          variantId,
          eventType,
          eventValue,
          metadata,
        }),
      });
      if (!response.ok) throw new Error('Failed to track event');
      return response.json();
    },
  });

  // Get variant for a specific experiment
  const getVariant = (experimentSlug: string): ExperimentVariant | null => {
    const assignment = assignments.find((a: ExperimentAssignment) => 
      a.variant && experimentSlug.includes(a.experimentId.toString())
    );
    return assignment?.variant || null;
  };

  // Check if user is in experiment
  const isInExperiment = (experimentId: number): boolean => {
    return assignments.some((a: ExperimentAssignment) => a.experimentId === experimentId);
  };

  // Auto-assign to experiment if not already assigned
  const ensureExperimentAssignment = async (experimentId: number) => {
    if (!isInExperiment(experimentId)) {
      await assignToExperimentMutation.mutateAsync({ experimentId });
    }
  };

  // Track impression (page view with variant)
  const trackImpression = (experimentId: number, variantId: number, pageSlug?: string) => {
    trackEventMutation.mutate({
      experimentId,
      variantId,
      eventType: 'impression',
      metadata: { pageSlug },
    });
  };

  // Track click on experimental element
  const trackClick = (experimentId: number, variantId: number, element?: string) => {
    trackEventMutation.mutate({
      experimentId,
      variantId,
      eventType: 'click',
      eventValue: element,
    });
  };

  // Track conversion
  const trackConversion = (experimentId: number, variantId: number, conversionType?: string) => {
    trackEventMutation.mutate({
      experimentId,
      variantId,
      eventType: 'conversion',
      eventValue: conversionType,
    });
  };

  // Track bounce (leaving without interaction)
  const trackBounce = (experimentId: number, variantId: number) => {
    trackEventMutation.mutate({
      experimentId,
      variantId,
      eventType: 'bounce',
    });
  };

  return {
    sessionId,
    assignments,
    getVariant,
    isInExperiment,
    ensureExperimentAssignment,
    trackImpression,
    trackClick,
    trackConversion,
    trackBounce,
    assignToExperiment: assignToExperimentMutation.mutateAsync,
    isAssigning: assignToExperimentMutation.isPending,
    isTracking: trackEventMutation.isPending,
  };
}

// Hook for specific experiment
export function useExperiment(experimentId: number) {
  const {
    sessionId,
    assignments,
    ensureExperimentAssignment,
    trackImpression,
    trackClick,
    trackConversion,
    trackBounce,
  } = useABTesting();

  // Get assignment for this experiment
  const assignment = assignments.find((a: ExperimentAssignment) => a.experimentId === experimentId);
  const variant = assignment?.variant;

  // Auto-assign on mount
  useEffect(() => {
    if (!assignment) {
      ensureExperimentAssignment(experimentId);
    }
  }, [experimentId, assignment, ensureExperimentAssignment]);

  // Track impression when variant is assigned
  useEffect(() => {
    if (variant) {
      trackImpression(experimentId, variant.id);
    }
  }, [variant, experimentId, trackImpression]);

  return {
    variant,
    isAssigned: !!assignment,
    trackClick: (element?: string) => variant && trackClick(experimentId, variant.id, element),
    trackConversion: (type?: string) => variant && trackConversion(experimentId, variant.id, type),
    trackBounce: () => variant && trackBounce(experimentId, variant.id),
    configuration: variant?.configuration || {},
  };
}