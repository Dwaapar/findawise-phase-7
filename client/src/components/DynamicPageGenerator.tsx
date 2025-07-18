import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { emotionMap } from "@/config/emotionMap";
import { PageConfig } from "@/types/config";
import QuizModule from "@/components/InteractiveModules/QuizModule";
import CalculatorModule from "@/components/InteractiveModules/CalculatorModule";
import ComparisonModule from "@/components/InteractiveModules/ComparisonModule";
import TimerModule from "@/components/InteractiveModules/TimerModule";
import BlogContentRenderer from "@/components/BlogContentRenderer";
import AffiliateOfferRenderer from "@/components/AffiliateOfferRenderer";
import LeadCaptureRenderer from "@/components/LeadCaptureRenderer";
import { sessionManager, trackPageView, getPersonalization, getRecommendations } from "@/lib/sessionManager";
import { getPersonalizedConfig, getConversionOptimizations } from "@/lib/personalizationEngine";

interface DynamicPageGeneratorProps {
  pageConfig: PageConfig;
}

const DynamicPageGenerator = ({ pageConfig }: DynamicPageGeneratorProps) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [personalizedConfig, setPersonalizedConfig] = useState<PageConfig>(pageConfig);
  const [recommendations, setRecommendations] = useState<any>(null);
  const theme = emotionMap[personalizedConfig.emotion];

  useEffect(() => {
    const initializePersonalization = async () => {
      try {
        // Initialize session and track page view
        await sessionManager.initSession();
        await trackPageView(pageConfig.slug);

        // Get personalization recommendations
        const personalizationData = await getPersonalization(pageConfig.slug);
        const recommendationData = await getRecommendations(pageConfig.slug);

        // Apply personalization to config
        const optimizedConfig = getPersonalizedConfig(pageConfig, personalizationData);
        const conversionOptimizations = getConversionOptimizations(personalizationData, pageConfig);

        setPersonalizedConfig({
          ...optimizedConfig,
          emotion: conversionOptimizations.emotionTheme || optimizedConfig.emotion,
        });
        setRecommendations({
          ...recommendationData,
          ...conversionOptimizations,
        });

        // Set meta tags dynamically with personalized content
        document.title = `${optimizedConfig.title} | Findawise Empire`;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', optimizedConfig.description);
        } else {
          const newMetaDescription = document.createElement('meta');
          newMetaDescription.setAttribute('name', 'description');
          newMetaDescription.setAttribute('content', optimizedConfig.description);
          document.head.appendChild(newMetaDescription);
        }
      } catch (error) {
        console.error('Personalization initialization failed:', error);
        // Fallback to default config
        setPersonalizedConfig(pageConfig);
      }
    };

    initializePersonalization();

    // Add keywords meta tag
    if (pageConfig.meta?.keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', pageConfig.meta.keywords);
      } else {
        const newMetaKeywords = document.createElement('meta');
        newMetaKeywords.setAttribute('name', 'keywords');
        newMetaKeywords.setAttribute('content', pageConfig.meta.keywords);
        document.head.appendChild(newMetaKeywords);
      }
    }

    // Load content from content pointer
    const loadContent = async () => {
      try {
        const response = await fetch(`/src/${personalizedConfig.contentPointer}`);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent("Content not found");
        }
      } catch (error) {
        setContent("Error loading content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [pageConfig, personalizedConfig]);

  const renderInteractiveModule = () => {
    const moduleProps = { 
      emotion: personalizedConfig.emotion, 
      pageConfig: personalizedConfig,
      recommendations: recommendations 
    };
    
    switch (personalizedConfig.interactiveModule) {
      case "quiz":
        return <QuizModule {...moduleProps} />;
      case "calculator":
        return <CalculatorModule {...moduleProps} />;
      case "comparison":
        return <ComparisonModule {...moduleProps} />;
      case "timer":
        return <TimerModule {...moduleProps} />;
      default:
        return (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600">Interactive module "{personalizedConfig.interactiveModule}" not found</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with emotion theme */}
      <div 
        className="py-12 px-6 text-white"
        style={{ background: theme.gradient }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{personalizedConfig.title}</h1>
          <p className="text-xl opacity-90 mb-4">{personalizedConfig.description}</p>
          <div className="flex items-center gap-4 text-sm mb-6">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {theme.name} Theme
            </span>
            <span className="opacity-80">
              {personalizedConfig.interactiveModule.charAt(0).toUpperCase() + personalizedConfig.interactiveModule.slice(1)} Module
            </span>
            <span className="opacity-80">
              {personalizedConfig.niche.charAt(0).toUpperCase() + personalizedConfig.niche.slice(1)} Niche
            </span>
            {recommendations?.segment && (
              <span className="bg-white/30 px-3 py-1 rounded-full">
                {recommendations.segment.replace('_', ' ')} Experience
              </span>
            )}
          </div>
          
          {/* Header Affiliate Offers */}
          <AffiliateOfferRenderer 
            pageSlug={personalizedConfig.slug} 
            emotion={personalizedConfig.emotion} 
            position="header"
            className="mt-6"
            userSegment={recommendations?.segment}
            recommendations={recommendations}
          />
          
          {/* Header Lead Capture */}
          <LeadCaptureRenderer 
            pageSlug={personalizedConfig.slug} 
            emotion={personalizedConfig.emotion} 
            position="header"
            userSegment={recommendations?.segment}
            className="mt-4"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Interactive Module */}
            <div className="mb-8">
              {renderInteractiveModule()}
            </div>

            {/* Inline Affiliate Offers */}
            <AffiliateOfferRenderer 
              pageSlug={personalizedConfig.slug} 
              emotion={personalizedConfig.emotion} 
              position="inline"
              className="mb-8"
              userSegment={recommendations?.segment}
              recommendations={recommendations}
            />
            
            {/* Inline Lead Capture */}
            <LeadCaptureRenderer 
              pageSlug={personalizedConfig.slug} 
              emotion={personalizedConfig.emotion} 
              position="inline"
              userSegment={recommendations?.segment}
              className="mb-8"
            />

            {/* Blog Content */}
            <BlogContentRenderer 
              pageConfig={personalizedConfig} 
              className="mb-8"
              userSegment={recommendations?.segment}
              recommendations={recommendations}
            />

            {/* CTA Section */}
            <div className="text-center">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
                style={{ 
                  background: theme.gradient,
                  color: 'white',
                  border: 'none'
                }}
                onClick={() => window.location.href = personalizedConfig.cta.link}
              >
                {recommendations?.primaryCTA || personalizedConfig.cta.text}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Sidebar Affiliate Offers */}
              <AffiliateOfferRenderer 
                pageSlug={personalizedConfig.slug} 
                emotion={personalizedConfig.emotion} 
                position="sidebar"
                userSegment={recommendations?.segment}
                recommendations={recommendations}
              />
              
              {/* Sidebar Lead Capture */}
              <LeadCaptureRenderer 
                pageSlug={personalizedConfig.slug} 
                emotion={personalizedConfig.emotion} 
                position="sidebar"
                userSegment={recommendations?.segment}
              />
            </div>
          </div>
        </div>

        {/* Footer Affiliate Offers */}
        <AffiliateOfferRenderer 
          pageSlug={personalizedConfig.slug} 
          emotion={personalizedConfig.emotion} 
          position="footer"
          className="mt-12"
          userSegment={recommendations?.segment}
          recommendations={recommendations}
        />
        
        {/* Footer Lead Capture */}
        <LeadCaptureRenderer 
          pageSlug={personalizedConfig.slug} 
          emotion={personalizedConfig.emotion} 
          position="footer"
          userSegment={recommendations?.segment}
          className="mt-8"
        />
      </div>
      
      {/* Popup Lead Capture */}
      <LeadCaptureRenderer 
        pageSlug={personalizedConfig.slug} 
        emotion={personalizedConfig.emotion} 
        position="popup"
        userSegment={recommendations?.segment}
      />
    </div>
  );
};

export default DynamicPageGenerator;
