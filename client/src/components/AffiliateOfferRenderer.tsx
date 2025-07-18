import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Shield, TrendingUp } from "lucide-react";
import { emotionMap } from "@/config/emotionMap";
import { sessionManager, trackAffiliateClick, getPersonalization } from "@/lib/sessionManager";
import { useEffect, useState } from "react";

interface AffiliateOffer {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  emotion: string;
  targetUrl: string;
  ctaText: string;
  commission: string;
  isActive: boolean;
}

interface AffiliateOfferRendererProps {
  pageSlug: string;
  emotion: string;
  position?: "header" | "sidebar" | "footer" | "inline";
  className?: string;
  userSegment?: string;
  recommendations?: any;
}

function AffiliateOfferCard({ offer, emotion, position }: { 
  offer: AffiliateOffer; 
  emotion: string; 
  position?: string;
}) {
  const emotionColors = emotionMap[emotion as keyof typeof emotionMap] || emotionMap.trust;
  
  const handleAffiliateClick = async (offerSlug: string, pageSlug: string) => {
    try {
      // Track click with session manager
      await trackAffiliateClick({
        offerSlug,
        pageSlug,
        position: position || 'inline',
        emotion,
        timestamp: new Date().toISOString(),
        sessionId: sessionManager.getSessionId(),
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          screenResolution: `${screen.width}x${screen.height}`,
        }
      });

      // Navigate to affiliate redirect with tracking
      window.open(`/go/${offerSlug}?ref=${pageSlug}&utm_source=findawise&utm_medium=web&utm_campaign=${emotion}&session=${sessionManager.getSessionId()}`, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track affiliate click:', error);
      // Fallback to direct navigation
      window.open(`/go/${offerSlug}`, '_blank', 'noopener,noreferrer');
    }
  };

  const getPositionIcon = () => {
    switch (position) {
      case "header": return <TrendingUp className="h-4 w-4" />;
      case "sidebar": return <Star className="h-4 w-4" />;
      case "footer": return <Shield className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg border-l-4 ${
        position === 'sidebar' ? 'max-w-sm' : ''
      }`}
      style={{ 
        borderLeftColor: emotionColors.primary,
        background: `linear-gradient(135deg, ${emotionColors.background} 0%, white 100%)`
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold" style={{ color: emotionColors.text }}>
            {offer.title}
          </CardTitle>
          {getPositionIcon()}
        </div>
        {offer.description && (
          <CardDescription className="text-sm text-gray-600">
            {offer.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: emotionColors.primary, color: emotionColors.primary }}
          >
            {offer.category}
          </Badge>
          {offer.commission && (
            <span 
              className="text-sm font-medium"
              style={{ color: emotionColors.primary }}
            >
              {offer.commission}
            </span>
          )}
        </div>
        
        <Button
          onClick={() => handleAffiliateClick(offer.slug, window.location.pathname.split('/').pop() || '')}
          className="w-full font-medium transition-all duration-200 hover:transform hover:scale-105"
          style={{
            backgroundColor: emotionColors.primary,
            color: 'white',
            borderColor: emotionColors.primary
          }}
          rel="nofollow noopener noreferrer"
        >
          {offer.ctaText || 'Get Started'}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Powered by Findawise Affiliate Network
        </p>
      </CardContent>
    </Card>
  );
}

export default function AffiliateOfferRenderer({ 
  pageSlug, 
  emotion, 
  position = "inline",
  className = "",
  userSegment,
  recommendations
}: AffiliateOfferRendererProps) {
  const [personalizedOffers, setPersonalizedOffers] = useState<any[]>([]);
  
  const { data: affiliateOffers, isLoading, error } = useQuery({
    queryKey: [`/api/page/${pageSlug}/affiliate-offers`],
    enabled: !!pageSlug
  });

  // Apply personalization to offers
  useEffect(() => {
    const applyPersonalization = async () => {
      if (!affiliateOffers) return;
      
      try {
        const sessionId = sessionManager.getSessionId();
        const personalizationData = await getPersonalization(pageSlug);
        
        let processedOffers = [...affiliateOffers];
        
        // If we have personalized recommendations, prioritize them
        if (personalizationData?.recommendedOffers?.length > 0) {
          const recommendedIds = personalizationData.recommendedOffers.map((o: any) => o.id);
          processedOffers = processedOffers.sort((a: any, b: any) => {
            const aRecommended = recommendedIds.includes(a.offer?.id);
            const bRecommended = recommendedIds.includes(b.offer?.id);
            if (aRecommended && !bRecommended) return -1;
            if (!aRecommended && bRecommended) return 1;
            return 0;
          });
        }

        // Apply segment-based filtering
        if (userSegment) {
          // For high converters, show premium offers first
          if (userSegment === 'high_converter') {
            processedOffers = processedOffers.filter((assignment: any) => 
              assignment.offer?.category === 'premium' || assignment.offer?.category === 'finance'
            ).concat(processedOffers.filter((assignment: any) => 
              assignment.offer?.category !== 'premium' && assignment.offer?.category !== 'finance'
            ));
          }
          // For researchers, show educational/trust-based offers
          else if (userSegment === 'researcher') {
            processedOffers = processedOffers.filter((assignment: any) => 
              assignment.offer?.emotion === 'trust' || assignment.offer?.category === 'education'
            ).concat(processedOffers.filter((assignment: any) => 
              assignment.offer?.emotion !== 'trust' && assignment.offer?.category !== 'education'
            ));
          }
        }

        setPersonalizedOffers(processedOffers);
      } catch (error) {
        console.error('Personalization failed:', error);
        setPersonalizedOffers(affiliateOffers);
      }
    };

    applyPersonalization();
  }, [affiliateOffers, userSegment, pageSlug]);

  const displayOffers = personalizedOffers.length > 0 ? personalizedOffers : affiliateOffers;

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !displayOffers || displayOffers.length === 0) {
    return null;
  }

  // Filter offers by position if specified
  const filteredOffers = displayOffers.filter((assignment: any) => 
    !position || assignment.position === position
  );

  if (filteredOffers.length === 0) {
    return null;
  }

  const containerClasses = {
    header: "flex flex-wrap gap-4 justify-center mb-6",
    sidebar: "space-y-4",
    footer: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8",
    inline: "grid grid-cols-1 md:grid-cols-2 gap-4 my-6"
  };

  return (
    <div className={`${containerClasses[position]} ${className}`}>
      {filteredOffers.map((assignment: any) => 
        assignment.offer && (
          <AffiliateOfferCard
            key={assignment.id}
            offer={assignment.offer}
            emotion={emotion}
            position={position}
          />
        )
      )}
    </div>
  );
}