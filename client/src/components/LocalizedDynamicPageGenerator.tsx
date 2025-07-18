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
import { useLocalization, useLocalizedContent } from "@/hooks/useLocalization";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface LocalizedDynamicPageGeneratorProps {
  pageConfig: PageConfig;
}

const LocalizedDynamicPageGenerator = ({ pageConfig }: LocalizedDynamicPageGeneratorProps) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [personalizedConfig, setPersonalizedConfig] = useState<PageConfig>(pageConfig);
  const [recommendations, setRecommendations] = useState<any>(null);
  
  const { 
    translate, 
    currentLanguage, 
    isRTL, 
    textDirection, 
    formatDate, 
    formatCurrency 
  } = useLocalization();
  
  // Get localized content for this page
  const { data: localizedContent, isLoading: isLoadingLocalized } = useLocalizedContent(
    'page', 
    pageConfig.slug
  );
  
  const theme = emotionMap[personalizedConfig.emotion];

  useEffect(() => {
    const initializePersonalization = async () => {
      try {
        // Initialize session and track page view with language
        await sessionManager.initSession();
        await trackPageView(pageConfig.slug, { language: currentLanguage });

        // Get personalization recommendations
        const personalizationData = await getPersonalization(pageConfig.slug);
        const recommendationData = await getRecommendations(pageConfig.slug);

        // Apply personalization to config
        const optimizedConfig = getPersonalizedConfig(pageConfig, personalizationData);
        const conversionOptimizations = getConversionOptimizations(personalizationData, pageConfig);

        // Apply localized content if available
        let finalConfig = optimizedConfig;
        if (localizedContent && !isLoadingLocalized) {
          finalConfig = {
            ...optimizedConfig,
            title: localizedContent.customTranslations?.title || 
                   translate(`pages.${pageConfig.slug}.title`, {}, optimizedConfig.title),
            description: localizedContent.customTranslations?.description || 
                        translate(`pages.${pageConfig.slug}.description`, {}, optimizedConfig.description),
            meta: {
              ...optimizedConfig.meta,
              keywords: localizedContent.customTranslations?.keywords || 
                       translate(`pages.${pageConfig.slug}.keywords`, {}, optimizedConfig.meta?.keywords || ''),
            }
          };
        }

        setPersonalizedConfig({
          ...finalConfig,
          emotion: conversionOptimizations.emotionTheme || finalConfig.emotion,
        });
        
        setRecommendations({
          ...recommendationData,
          ...conversionOptimizations,
        });

        // Set localized meta tags dynamically
        const localizedTitle = translate(`pages.${pageConfig.slug}.title`, {}, finalConfig.title);
        const localizedDescription = translate(`pages.${pageConfig.slug}.description`, {}, finalConfig.description);
        
        document.title = `${localizedTitle} | ${translate('ui.common.siteName', {}, 'Findawise Empire')}`;
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = textDirection;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', localizedDescription);
        } else {
          const newMetaDescription = document.createElement('meta');
          newMetaDescription.setAttribute('name', 'description');
          newMetaDescription.setAttribute('content', localizedDescription);
          document.head.appendChild(newMetaDescription);
        }

        // Add hreflang tags for SEO
        const hreflangContainer = document.querySelector('head');
        if (hreflangContainer) {
          // Remove existing hreflang tags
          const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
          existingHreflang.forEach(tag => tag.remove());

          // Add new hreflang tags
          const supportedLanguages = ['en', 'fr', 'es', 'de', 'hi', 'zh', 'ja', 'pt', 'ru', 'ar'];
          supportedLanguages.forEach(lang => {
            const hreflangTag = document.createElement('link');
            hreflangTag.setAttribute('rel', 'alternate');
            hreflangTag.setAttribute('hreflang', lang);
            hreflangTag.setAttribute('href', `${window.location.origin}/${lang}/page/${pageConfig.slug}`);
            hreflangContainer.appendChild(hreflangTag);
          });

          // Add x-default
          const defaultHreflang = document.createElement('link');
          defaultHreflang.setAttribute('rel', 'alternate');
          defaultHreflang.setAttribute('hreflang', 'x-default');
          defaultHreflang.setAttribute('href', `${window.location.origin}/page/${pageConfig.slug}`);
          hreflangContainer.appendChild(defaultHreflang);
        }

      } catch (error) {
        console.error('Personalization initialization failed:', error);
        setPersonalizedConfig(pageConfig);
      }
    };

    initializePersonalization();

    // Add localized keywords meta tag
    if (pageConfig.meta?.keywords) {
      const localizedKeywords = translate(`pages.${pageConfig.slug}.keywords`, {}, pageConfig.meta.keywords);
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', localizedKeywords);
      } else {
        const newMetaKeywords = document.createElement('meta');
        newMetaKeywords.setAttribute('name', 'keywords');
        newMetaKeywords.setAttribute('content', localizedKeywords);
        document.head.appendChild(newMetaKeywords);
      }
    }
  }, [pageConfig, currentLanguage, localizedContent, isLoadingLocalized, translate, textDirection]);

  useEffect(() => {
    const loadContent = async () => {
      if (personalizedConfig.contentFile) {
        try {
          const response = await fetch(`/src/content/${personalizedConfig.contentFile}`);
          const contentText = await response.text();
          setContent(contentText);
        } catch (error) {
          console.error('Error loading content:', error);
          setContent(translate(`pages.${pageConfig.slug}.content.main`, {}, 'Content not available.'));
        }
      }
      setLoading(false);
    };

    loadContent();
  }, [personalizedConfig.contentFile, translate, pageConfig.slug]);

  const renderInteractiveModule = () => {
    const moduleProps = {
      config: personalizedConfig.moduleConfig,
      theme,
      currentLanguage,
      translate
    };

    switch (personalizedConfig.interactiveModule) {
      case 'quiz':
        return <QuizModule {...moduleProps} />;
      case 'calculator':
        return <CalculatorModule {...moduleProps} />;
      case 'comparison':
        return <ComparisonModule {...moduleProps} />;
      case 'timer':
        return <TimerModule {...moduleProps} />;
      default:
        return null;
    }
  };

  if (loading || isLoadingLocalized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      dir={textDirection}
      style={{
        '--primary': theme.primary,
        '--secondary': theme.secondary,
        '--accent': theme.accent,
        '--background': theme.background,
        '--text': theme.text
      } as React.CSSProperties}
    >
      {/* Header with Language Switcher */}
      <header className={`bg-white shadow-sm border-b border-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <h1 className="text-xl font-semibold text-slate-900">
                {translate('ui.common.siteName', {}, 'Findawise Empire')}
              </h1>
            </div>
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            {translate(`pages.${personalizedConfig.slug}.title`, {}, personalizedConfig.title)}
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            {translate(`pages.${personalizedConfig.slug}.description`, {}, personalizedConfig.description)}
          </p>
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-center'}`}>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
              {translate(`ui.common.niche`, {}, 'Niche')}: {translate(`niches.${personalizedConfig.niche}`, {}, personalizedConfig.niche)}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
              {translate(`ui.common.emotion`, {}, 'Emotion')}: {translate(`emotions.${personalizedConfig.emotion}`, {}, personalizedConfig.emotion)}
            </span>
          </div>
        </div>

        {/* Lead Capture Forms */}
        <LeadCaptureRenderer 
          pageSlug={personalizedConfig.slug}
          position="header"
          currentLanguage={currentLanguage}
          translate={translate}
        />

        {/* Interactive Module */}
        {personalizedConfig.interactiveModule && (
          <Card className="mb-8">
            <CardContent className="p-6">
              {renderInteractiveModule()}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {content && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <BlogContentRenderer 
                content={content}
                emotion={personalizedConfig.emotion}
                pageSlug={personalizedConfig.slug}
                currentLanguage={currentLanguage}
                translate={translate}
              />
            </CardContent>
          </Card>
        )}

        {/* Affiliate Offers */}
        <AffiliateOfferRenderer 
          pageSlug={personalizedConfig.slug}
          niche={personalizedConfig.niche}
          emotion={personalizedConfig.emotion}
          recommendations={recommendations}
          currentLanguage={currentLanguage}
          translate={translate}
          formatCurrency={formatCurrency}
        />

        {/* Lead Capture Forms */}
        <LeadCaptureRenderer 
          pageSlug={personalizedConfig.slug}
          position="footer"
          currentLanguage={currentLanguage}
          translate={translate}
        />

        {/* Localized Call-to-Action */}
        <div className={`text-center mt-12 ${isRTL ? 'text-right' : 'text-left'}`}>
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primary }}>
                {translate(`pages.${personalizedConfig.slug}.cta.title`, {}, 'Ready to Get Started?')}
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                {translate(`pages.${personalizedConfig.slug}.cta.description`, {}, 'Take action now and transform your life.')}
              </p>
              <Button 
                size="lg" 
                className="text-white font-semibold"
                style={{ backgroundColor: theme.primary }}
              >
                {translate(`pages.${personalizedConfig.slug}.cta.button`, {}, 'Get Started Today')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className={`bg-slate-900 text-white py-8 mt-16 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p>&copy; {new Date().getFullYear()} {translate('ui.common.siteName', {}, 'Findawise Empire')}. {translate('ui.common.allRightsReserved', {}, 'All rights reserved.')}</p>
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <LanguageSwitcher variant="ghost" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LocalizedDynamicPageGenerator;