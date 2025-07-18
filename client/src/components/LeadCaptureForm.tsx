import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Download, Gift, FileText, Video, BookOpen, Settings } from "lucide-react";
import { emotionMap } from "@/config/emotionMap";
import { useToast } from "@/hooks/use-toast";
import { sessionManager } from "@/lib/sessionManager";

// Form validation schema
const leadCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  additionalData: z.record(z.any()).optional(),
});

type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>;

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

interface LeadCaptureFormProps {
  leadForm: LeadFormConfig;
  leadMagnet: LeadMagnet;
  onClose?: () => void;
  onSuccess?: () => void;
  pageSlug?: string;
  userSegment?: string;
  className?: string;
}

const LeadCaptureForm = ({
  leadForm,
  leadMagnet,
  onClose,
  onSuccess,
  pageSlug,
  userSegment,
  className = "",
}: LeadCaptureFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();
  const theme = emotionMap[leadForm.emotion as keyof typeof emotionMap] || emotionMap.trust;

  const form = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      terms: false,
      additionalData: {},
    },
  });

  // Get form fields configuration
  const formFields = leadForm.formFields || {
    email: { required: true, label: "Email Address" },
    firstName: { required: true, label: "First Name" },
    lastName: { required: false, label: "Last Name" },
    phone: { required: false, label: "Phone Number" },
  };

  // Get lead magnet icon
  const getLeadMagnetIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="w-6 h-6" />;
      case 'checklist':
        return <FileText className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'course':
        return <BookOpen className="w-6 h-6" />;
      case 'toolkit':
        return <Settings className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const handleSubmit = async (data: LeadCaptureFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get session ID
      const sessionId = await sessionManager.getSessionId();
      
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const utmTerm = urlParams.get('utm_term');
      const utmContent = urlParams.get('utm_content');

      // Prepare lead capture data
      const leadCaptureData = {
        sessionId,
        leadFormId: leadForm.id,
        leadMagnetId: leadMagnet.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        additionalData: data.additionalData,
        source: pageSlug || window.location.pathname,
        userAgent: navigator.userAgent,
        referrerUrl: document.referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      };

      // Submit lead capture
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadCaptureData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead capture');
      }

      const result = await response.json();
      
      // Track lead capture event
      await sessionManager.trackBehavior('lead_capture', {
        leadFormId: leadForm.id,
        leadMagnetId: leadMagnet.id,
        email: data.email,
        pageSlug,
        userSegment,
      });

      setSubmitSuccess(true);
      
      // Show success message
      toast({
        title: "Success!",
        description: `Thank you! Your ${leadMagnet.type} will be delivered shortly.`,
      });

      // Handle delivery based on method
      if (leadMagnet.deliveryMethod === 'download' && leadMagnet.deliveryUrl) {
        window.open(leadMagnet.deliveryUrl, '_blank');
      } else if (leadMagnet.deliveryMethod === 'redirect' && leadMagnet.deliveryUrl) {
        window.location.href = leadMagnet.deliveryUrl;
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Lead capture submission error:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Track close event
    sessionManager.trackBehavior('lead_form_closed', {
      leadFormId: leadForm.id,
      pageSlug,
      userSegment,
    });
    
    if (onClose) {
      onClose();
    }
  };

  if (submitSuccess) {
    return (
      <Card className={`max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
            style={{ background: theme.gradient }}
          >
            {getLeadMagnetIcon(leadMagnet.type)}
          </div>
          <CardTitle className="text-2xl" style={{ color: theme.primary }}>
            Thank You!
          </CardTitle>
          <CardDescription className="text-lg">
            Your {leadMagnet.type} is on its way!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Check your email for "{leadMagnet.title}" and follow the instructions to access your content.
          </p>
          {leadMagnet.deliveryMethod === 'download' && (
            <Button
              onClick={() => window.open(leadMagnet.deliveryUrl, '_blank')}
              className="mb-4"
              style={{ background: theme.gradient }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Now
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="relative">
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
          style={{ background: theme.gradient }}
        >
          {getLeadMagnetIcon(leadMagnet.type)}
        </div>
        <CardTitle className="text-center text-2xl" style={{ color: theme.primary }}>
          {leadForm.title}
        </CardTitle>
        <CardDescription className="text-center text-lg">
          {leadForm.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {formFields.email && (
            <div className="space-y-2">
              <Label htmlFor="email">{formFields.email.label}</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...form.register("email")}
                className="w-full"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
          )}

          {formFields.firstName && (
            <div className="space-y-2">
              <Label htmlFor="firstName">{formFields.firstName.label}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                {...form.register("firstName")}
                className="w-full"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>
          )}

          {formFields.lastName && (
            <div className="space-y-2">
              <Label htmlFor="lastName">{formFields.lastName.label}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                {...form.register("lastName")}
                className="w-full"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          )}

          {formFields.phone && (
            <div className="space-y-2">
              <Label htmlFor="phone">{formFields.phone.label}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                {...form.register("phone")}
                className="w-full"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              {...form.register("terms")}
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              I agree to receive email communications and understand I can unsubscribe at any time.
            </Label>
          </div>
          {form.formState.errors.terms && (
            <p className="text-sm text-red-600">{form.formState.errors.terms.message}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-lg font-semibold"
            style={{ background: theme.gradient }}
          >
            {isSubmitting ? "Submitting..." : `Get My ${leadMagnet.type}`}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your information is secure and will never be shared with third parties.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCaptureForm;