// React hooks for localization functionality
import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
// Constants for supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'US', isDefault: true },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'FR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'ES' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'DE' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'IN' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'JP' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'BR' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'RU' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'SA', direction: 'rtl' },
] as const;

// Utility function for text interpolation
function interpolateTranslation(text: string, variables: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

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

// Constants and utility functions
const DEFAULT_LANGUAGE = 'en';
const FALLBACK_LANGUAGE = 'en';

// Translation cache
const translationCache = new Map<string, Record<string, string>>();

// Language detection and initialization
function detectBrowserLanguage(): string {
  if (typeof window !== 'undefined' && window.navigator) {
    const browserLang = window.navigator.language.split('-')[0];
    return browserLang;
  }
  return DEFAULT_LANGUAGE;
}

function getStoredLanguagePreference(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('preferred-language');
  }
  return null;
}

function setStoredLanguagePreference(language: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('preferred-language', language);
  }
}

function isValidLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

function getLanguageInfo(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

function isRTLLanguage(code: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(code);
}

function getTextDirection(code: string): 'ltr' | 'rtl' {
  return isRTLLanguage(code) ? 'rtl' : 'ltr';
}

function getPluralForm(count: number, language: string, forms: any): string {
  // Simplified plural form logic
  if (count === 0 && forms.zero) return forms.zero;
  if (count === 1 && forms.one) return forms.one;
  return forms.other || forms.many || forms.few || '';
}

async function detectUserLanguage(): Promise<string> {
  // 1. Check stored preference first
  const stored = getStoredLanguagePreference();
  if (stored && isValidLanguageCode(stored)) {
    return stored;
  }

  // 2. Check browser language
  const browserLang = detectBrowserLanguage();
  if (browserLang && isValidLanguageCode(browserLang)) {
    return browserLang;
  }

  // 3. Fallback to default
  return DEFAULT_LANGUAGE;
}

// Fetch translations from API
async function fetchTranslations(language: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/translations/${language}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const translations = data.data || {};
    
    // Cache the translations
    translationCache.set(language, translations);
    
    return translations;
  } catch (error) {
    console.error(`Failed to fetch translations for ${language}:`, error);
    return translationCache.get(language) || {};
  }
}

// Core hook for localization
export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}

// Language preference hook for easy language switching
export function useLanguagePreference() {
  const { currentLanguage, setLanguage, translate } = useLocalization();
  const [isChanging, setIsChanging] = useState(false);
  
  const changeLanguage = useCallback(async (newLanguage: string) => {
    if (newLanguage === currentLanguage || isChanging) return;
    
    setIsChanging(true);
    try {
      await setLanguage(newLanguage);
      setStoredLanguagePreference(newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  }, [currentLanguage, setLanguage, isChanging]);

  return {
    currentLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    isChanging,
    languageInfo: getLanguageInfo(currentLanguage),
    isRTL: isRTLLanguage(currentLanguage),
    textDirection: getTextDirection(currentLanguage),
    translate
  };
}

// Provider component
export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Initialize language detection
  useEffect(() => {
    const initializeLanguage = async () => {
      const detectedLanguage = await detectUserLanguage();
      setCurrentLanguage(detectedLanguage);
      setIsInitialized(true);

      // Track language detection
      try {
        await fetch('/api/analytics/localization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'language_detection',
            languageCode: detectedLanguage,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Failed to track language detection:', error);
      }
    };

    initializeLanguage();
  }, []);

  // Language switching mutation
  const languageMutation = useMutation({
    mutationFn: async (newLanguage: string) => {
      if (!isValidLanguageCode(newLanguage)) {
        throw new Error('Invalid language code');
      }

      // Update stored preference
      setStoredLanguagePreference(newLanguage);
      
      // Update server preference
      await fetch('/api/user-language-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredLanguage: newLanguage,
          detectionMethod: 'manual',
          isManualOverride: true,
        }),
      });

      return newLanguage;
    },
    onSuccess: (newLanguage) => {
      setCurrentLanguage(newLanguage);
      // Invalidate translation queries to force reload
      queryClient.invalidateQueries({ queryKey: ['/api/translations'] });
    },
  });

  // Translation fetching
  const { data: translations = {}, isLoading } = useQuery({
    queryKey: ['/api/translations', currentLanguage],
    queryFn: () => fetchTranslations(currentLanguage),
    enabled: isInitialized && !!currentLanguage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Translation function with fallbacks
  const translate = useCallback(
    (key: string, variables: Record<string, string | number> = {}, fallback?: string) => {
      const translation = translations[key] || fallback || key;
      return interpolateTranslation(translation, variables);
    },
    [translations]
  );

  // Plural translation function
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

  // Currency formatting
  const formatCurrency = useCallback(
    (amount: number, currency: string = 'USD') => {
      try {
        return new Intl.NumberFormat(currentLanguage, {
          style: 'currency',
          currency,
        }).format(amount);
      } catch {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        }).format(amount);
      }
    },
    [currentLanguage]
  );

  // Date formatting
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

  // Number formatting
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

  return React.createElement(
    LocalizationContext.Provider,
    { value: contextValue },
    children
  );
}

// Hook for localized content
export function useLocalizedContent(contentType: string, contentId: string) {
  const { currentLanguage } = useLocalization();
  
  return useQuery({
    queryKey: ['/api/content', contentType, contentId, currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/content/${contentType}/${contentId}/${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch localized content');
      return response.json();
    },
  });
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

// Translation key builder helper - simplified version
export const t = {
  create: () => ({
    page: (slug: string) => ({
      title: () => `pages.${slug}.title`,
      description: () => `pages.${slug}.description`,
      keywords: () => `pages.${slug}.keywords`,
      content: (section: string) => `pages.${slug}.content.${section}`,
      cta: (id: string) => `pages.${slug}.cta.${id}`,
    }),
    ui: {
      common: (key: string) => `ui.common.${key}`,
      navigation: (key: string) => `ui.navigation.${key}`,
      buttons: (key: string) => `ui.buttons.${key}`,
      messages: (key: string) => `ui.messages.${key}`,
    },
    dashboard: (section: string) => ({
      title: () => `dashboard.${section}.title`,
      description: () => `dashboard.${section}.description`,
      labels: (key: string) => `dashboard.${section}.labels.${key}`,
    }),
  })
};