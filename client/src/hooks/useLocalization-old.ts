// React hooks for localization functionality
import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  detectBrowserLanguage, 
  detectGeoLanguage, 
  getStoredLanguagePreference, 
  setStoredLanguagePreference,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  isValidLanguageCode,
  getLanguageInfo,
  interpolateTranslation,
  getPluralForm,
  isRTLLanguage,
  getTextDirection,
  translationCache,
  TranslationKeyBuilder,
  SUPPORTED_LANGUAGES
} from '@/config/localization';

// Localization Context
interface LocalizationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
  availableLanguages: typeof SUPPORTED_LANGUAGES;
  translate: (key: string, variables?: Record<string, string | number>, fallback?: string) => string;
  translatePlural: (key: string, count: number, variables?: Record<string, string | number>) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  isRTL: boolean;
  textDirection: 'ltr' | 'rtl';
  languageInfo: typeof SUPPORTED_LANGUAGES[0] | undefined;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Language detection and initialization
async function detectUserLanguage(): Promise<string> {
  // 1. Check stored preference first
  const stored = getStoredLanguagePreference();
  if (stored && isValidLanguageCode(stored)) {
    return stored;
  }

  // 2. Check browser language
  const browserLang = detectBrowserLanguage();
  if (browserLang !== DEFAULT_LANGUAGE) {
    return browserLang;
  }

  // 3. Try geo-location detection
  try {
    const geoLang = await detectGeoLanguage();
    if (geoLang !== DEFAULT_LANGUAGE && isValidLanguageCode(geoLang)) {
      return geoLang;
    }
  } catch (error) {
    console.warn('Geo-language detection failed:', error);
  }

  return DEFAULT_LANGUAGE;
}

// Translation fetch function
async function fetchTranslations(language: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/translations/${language}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch translations for ${language}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch translations:', error);
    return {};
  }
}

// Translation function with caching
function createTranslationFunction(
  translations: Record<string, string>,
  language: string
) {
  return function translate(
    key: string, 
    variables: Record<string, string | number> = {},
    fallback?: string
  ): string {
    // Check cache first
    let translation = translationCache.get(language, key);
    
    if (!translation) {
      // Check loaded translations
      translation = translations[key];
      
      if (translation) {
        // Cache the translation
        translationCache.set(language, key, translation);
      }
    }

    // Fallback chain
    if (!translation) {
      // Try fallback language if different from current
      if (language !== FALLBACK_LANGUAGE) {
        const fallbackTranslation = translationCache.get(FALLBACK_LANGUAGE, key);
        if (fallbackTranslation) {
          translation = fallbackTranslation;
        }
      }
      
      // Use provided fallback or key itself
      if (!translation) {
        translation = fallback || key;
      }
    }

    // Interpolate variables
    return interpolateTranslation(translation, variables);
  };
}

// Main localization hook
export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}

// Language preference hook
export function useLanguagePreference() {
  const { currentLanguage, setLanguage, availableLanguages } = useLocalization();
  const queryClient = useQueryClient();

  const changeLanguage = useMutation({
    mutationFn: async (newLanguage: string) => {
      if (!isValidLanguageCode(newLanguage)) {
        throw new Error(`Invalid language code: ${newLanguage}`);
      }

      // Store preference
      setStoredLanguagePreference(newLanguage);
      
      // Track language change event
      await fetch('/api/analytics/localization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'language_switch',
          languageCode: newLanguage,
          previousLanguage: currentLanguage,
          timestamp: new Date().toISOString(),
        }),
      });

      return newLanguage;
    },
    onSuccess: (newLanguage) => {
      setLanguage(newLanguage);
      // Invalidate translations cache
      queryClient.invalidateQueries({ queryKey: ['translations'] });
    },
  });

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage: changeLanguage.mutate,
    isChanging: changeLanguage.isPending,
  };
}

// Translation data hook
export function useTranslations(language: string) {
  return useQuery({
    queryKey: ['translations', language],
    queryFn: () => fetchTranslations(language),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Auto-translation hook
export function useAutoTranslation() {
  const { currentLanguage } = useLocalization();
  const queryClient = useQueryClient();

  const autoTranslate = useMutation({
    mutationFn: async ({ texts, targetLanguage, context }: {
      texts: string[];
      targetLanguage?: string;
      context?: string;
    }) => {
      const response = await fetch('/api/translations/auto-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts,
          targetLanguage: targetLanguage || currentLanguage,
          sourceLanguage: 'en',
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Auto-translation failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate translations cache to get fresh data
      queryClient.invalidateQueries({ queryKey: ['translations'] });
    },
  });

  return {
    autoTranslate: autoTranslate.mutate,
    isTranslating: autoTranslate.isPending,
    error: autoTranslate.error,
  };
}

// Localized content hook
export function useLocalizedContent(contentType: string, contentId: string) {
  const { currentLanguage } = useLocalization();

  return useQuery({
    queryKey: ['localized-content', contentType, contentId, currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/content/${contentType}/${contentId}/${currentLanguage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch localized content');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Translation key builder hook
export function useTranslationKeys() {
  return {
    page: (slug: string) => TranslationKeyBuilder.create().page(slug),
    offer: (slug: string) => TranslationKeyBuilder.create().offer(slug),
    form: (formId: string) => TranslationKeyBuilder.create().form(formId),
    ui: (section: string) => TranslationKeyBuilder.create().ui(section),
    email: (templateId: string) => TranslationKeyBuilder.create().email(templateId),
    dashboard: (sectionId: string) => TranslationKeyBuilder.create().dashboard(sectionId),
  };
}

// Localization Provider Component
interface LocalizationProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export function LocalizationProvider({ 
  children, 
  defaultLanguage = DEFAULT_LANGUAGE 
}: LocalizationProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language detection
  useEffect(() => {
    detectUserLanguage().then((detectedLanguage) => {
      setCurrentLanguage(detectedLanguage);
      setIsInitialized(true);
    });
  }, []);

  // Load translations for current language
  const { data: translations = {}, isLoading } = useTranslations(currentLanguage);

  // Create translation function
  const translate = useCallback(
    (key: string, variables?: Record<string, string | number>, fallback?: string) => {
      return createTranslationFunction(translations, currentLanguage)(key, variables, fallback);
    },
    [translations, currentLanguage]
  );

  // Create plural translation function
  const translatePlural = useCallback(
    (key: string, count: number, variables: Record<string, string | number> = {}) => {
      const forms = {
        zero: translations[`${key}.zero`],
        one: translations[`${key}.one`],
        few: translations[`${key}.few`],
        many: translations[`${key}.many`],
        other: translations[`${key}.other`] || translations[key] || key
      };

      const selectedForm = getPluralForm(count, currentLanguage, forms);
      return interpolateTranslation(selectedForm, { ...variables, count });
    },
    [translations, currentLanguage]
  );

  // Format functions
  const formatCurrency = useCallback(
    (amount: number, currency = 'USD') => {
      try {
        return new Intl.NumberFormat(currentLanguage, {
          style: 'currency',
          currency,
        }).format(amount);
      } catch {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      }
    },
    [currentLanguage]
  );

  const formatDate = useCallback(
    (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
      try {
        return new Intl.DateTimeFormat(currentLanguage, options).format(date);
      } catch {
        return new Intl.DateTimeFormat('en-US', options).format(date);
      }
    },
    [currentLanguage]
  );

  const formatNumber = useCallback(
    (number: number, options: Intl.NumberFormatOptions = {}) => {
      try {
        return new Intl.NumberFormat(currentLanguage, options).format(number);
      } catch {
        return new Intl.NumberFormat('en-US', options).format(number);
      }
    },
    [currentLanguage]
  );

  // Language info
  const languageInfo = getLanguageInfo(currentLanguage);
  const isRTL = isRTLLanguage(currentLanguage);
  const textDirection = getTextDirection(currentLanguage);

  const contextValue: LocalizationContextType = {
    currentLanguage,
    setLanguage: setCurrentLanguage,
    isLoading: !isInitialized || isLoading,
    availableLanguages: SUPPORTED_LANGUAGES,
    translate,
    translatePlural,
    formatCurrency,
    formatDate,
    formatNumber,
    isRTL,
    textDirection,
    languageInfo,
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
}

// Hook for tracking localization analytics
export function useLocalizationAnalytics() {
  const { currentLanguage } = useLocalization();

  const trackEvent = useCallback(
    async (eventType: string, data: Record<string, any> = {}) => {
      try {
        await fetch('/api/analytics/localization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            languageCode: currentLanguage,
            ...data,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Failed to track localization event:', error);
      }
    },
    [currentLanguage]
  );

  return { trackEvent };
}