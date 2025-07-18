import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import LeadCaptureForm from "./LeadCaptureForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Mail, Download, FileText } from "lucide-react";
import { emotionMap } from "@/config/emotionMap";

interface LeadFormConfig {
  id: number;
  slug: string;
  title: string;
  description: string;
  leadMagnetId: number;
  formType: string;
  triggerConfig: any;
  formFields: any;
  styling: any;
  emotion: string;
}

interface LeadMagnet {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: string;
  deliveryMethod: string;
  deliveryUrl: string;
  deliveryConfig: any;
}

interface LeadCaptureRendererProps {
  pageSlug: string;
  position: 'header' | 'sidebar' | 'footer' | 'inline' | 'popup';
  emotion: string;
  userSegment?: string;
  className?: string;
}

const LeadCaptureRenderer = ({
  pageSlug,
  position,
  emotion,
  userSegment,
  className = "",
}: LeadCaptureRendererProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [dismissedForms, setDismissedForms] = useState<number[]>([]);
  const [triggeredForms, setTriggeredForms] = useState<number[]>([]);
  const theme = emotionMap[emotion as keyof typeof emotionMap] || emotionMap.trust;

  // Fetch lead forms for this page and position
  const { data: leadFormsData, isLoading } = useQuery({
    queryKey: ['/api/lead-forms', pageSlug, position],
    queryFn: async () => {
      const response = await fetch(`/api/lead-forms?pageSlug=${pageSlug}&position=${position}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lead forms');
      }
      return response.json();
    },
  });

  const leadForms = leadFormsData?.leadForms || [];

  // Set up scroll and exit intent triggers
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      leadForms.forEach((form: LeadFormConfig) => {
        if (form.formType === 'scroll_trigger' && !triggeredForms.includes(form.id)) {
          const triggerPoint = form.triggerConfig?.scrollPercentage || 50;
          if (scrollPercentage >= triggerPoint) {
            setTriggeredForms(prev => [...prev, form.id]);
            if (position === 'popup') {
              setShowPopup(true);
            }
          }
        }
      });
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        leadForms.forEach((form: LeadFormConfig) => {
          if (form.formType === 'exit_intent' && !triggeredForms.includes(form.id)) {
            setTriggeredForms(prev => [...prev, form.id]);
            if (position === 'popup') {
              setShowPopup(true);
            }
          }
        });
      }
    };

    const handleTimeDelay = () => {
      leadForms.forEach((form: LeadFormConfig) => {
        if (form.formType === 'time_delay' && !triggeredForms.includes(form.id)) {
          const delay = form.triggerConfig?.delaySeconds || 30;
          setTimeout(() => {
            setTriggeredForms(prev => [...prev, form.id]);
            if (position === 'popup') {
              setShowPopup(true);
            }
          }, delay * 1000);
        }
      });
    };

    if (leadForms.length > 0) {
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('mouseleave', handleMouseLeave);
      handleTimeDelay();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [leadForms, triggeredForms, position]);

  // Get lead magnet data
  const { data: leadMagnetsData } = useQuery({
    queryKey: ['/api/lead-magnets'],
    queryFn: async () => {
      const response = await fetch('/api/lead-magnets');
      if (!response.ok) {
        throw new Error('Failed to fetch lead magnets');
      }
      return response.json();
    },
  });

  const leadMagnets = leadMagnetsData?.leadMagnets || [];

  const handleFormDismiss = (formId: number) => {
    setDismissedForms(prev => [...prev, formId]);
    if (position === 'popup') {
      setShowPopup(false);
    }
  };

  const handleFormSuccess = (formId: number) => {
    setDismissedForms(prev => [...prev, formId]);
    if (position === 'popup') {
      setShowPopup(false);
    }
  };

  if (isLoading || leadForms.length === 0) {
    return null;
  }

  // Filter forms based on triggers and dismissals
  const activeForms = leadForms.filter((form: LeadFormConfig) => {
    if (dismissedForms.includes(form.id)) return false;
    
    // For popup forms, only show if triggered
    if (position === 'popup') {
      return triggeredForms.includes(form.id);
    }
    
    // For inline forms, check if they should be shown based on triggers
    if (form.formType === 'inline') return true;
    if (form.formType === 'scroll_trigger' || form.formType === 'exit_intent') {
      return triggeredForms.includes(form.id);
    }
    
    return true;
  });

  if (activeForms.length === 0) {
    return null;
  }

  // Get the lead magnet for each form
  const formsWithMagnets = activeForms.map((form: LeadFormConfig) => {
    const magnet = leadMagnets.find((m: LeadMagnet) => m.id === form.leadMagnetId);
    return { form, magnet };
  }).filter(({ magnet }) => magnet);

  // Render different layouts based on position
  if (position === 'popup') {
    const { form, magnet } = formsWithMagnets[0];
    return (
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-lg">
          <LeadCaptureForm
            leadForm={form}
            leadMagnet={magnet}
            onClose={() => handleFormDismiss(form.id)}
            onSuccess={() => handleFormSuccess(form.id)}
            pageSlug={pageSlug}
            userSegment={userSegment}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (position === 'inline') {
    return (
      <div className={`space-y-6 ${className}`}>
        {formsWithMagnets.map(({ form, magnet }) => (
          <LeadCaptureForm
            key={form.id}
            leadForm={form}
            leadMagnet={magnet}
            onClose={() => handleFormDismiss(form.id)}
            onSuccess={() => handleFormSuccess(form.id)}
            pageSlug={pageSlug}
            userSegment={userSegment}
          />
        ))}
      </div>
    );
  }

  if (position === 'sidebar') {
    return (
      <div className={`space-y-4 ${className}`}>
        {formsWithMagnets.map(({ form, magnet }) => (
          <div key={form.id} className="sticky top-6">
            <LeadCaptureForm
              leadForm={form}
              leadMagnet={magnet}
              onClose={() => handleFormDismiss(form.id)}
              onSuccess={() => handleFormSuccess(form.id)}
              pageSlug={pageSlug}
              userSegment={userSegment}
            />
          </div>
        ))}
      </div>
    );
  }

  if (position === 'header') {
    return (
      <div className={`${className}`}>
        {formsWithMagnets.map(({ form, magnet }) => (
          <div key={form.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{form.title}</h3>
                  <p className="text-white/80 text-sm">{form.description}</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-white/90"
                  >
                    Get Free {magnet.type}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <LeadCaptureForm
                    leadForm={form}
                    leadMagnet={magnet}
                    onClose={() => handleFormDismiss(form.id)}
                    onSuccess={() => handleFormSuccess(form.id)}
                    pageSlug={pageSlug}
                    userSegment={userSegment}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (position === 'footer') {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        {formsWithMagnets.map(({ form, magnet }) => (
          <div key={form.id} className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
              style={{ background: theme.gradient }}
            >
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: theme.primary }}>
              {form.title}
            </h3>
            <p className="text-gray-600 mb-4">{form.description}</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
                  style={{ background: theme.gradient }}
                >
                  Get My Free {magnet.type}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <LeadCaptureForm
                  leadForm={form}
                  leadMagnet={magnet}
                  onClose={() => handleFormDismiss(form.id)}
                  onSuccess={() => handleFormSuccess(form.id)}
                  pageSlug={pageSlug}
                  userSegment={userSegment}
                />
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LeadCaptureRenderer;