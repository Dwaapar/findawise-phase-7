// Client-side localization configuration and utilities
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

const TRANSLATION_CATEGORIES = {
  PAGE: 'page',
  OFFER: 'offer',
  FORM: 'form',
  EMAIL: 'email',
  DASHBOARD: 'dashboard',
  UI: 'ui',
  ERROR: 'error',
  SEO: 'seo',
  CTA: 'cta',
  CONTENT: 'content',
} as const;

// Default language and fallback settings
export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'en';

// Browser language detection
export function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  
  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language];
  
  for (const lang of browserLanguages) {
    // Extract language code (e.g., 'en-US' -> 'en')
    const langCode = lang.split('-')[0].toLowerCase();
    
    // Check if we support this language
    if (SUPPORTED_LANGUAGES.some(supported => supported.code === langCode)) {
      return langCode;
    }
  }
  
  return DEFAULT_LANGUAGE;
}

// Geo-location based language detection (basic implementation)
export function detectGeoLanguage(): Promise<string> {
  return new Promise((resolve) => {
    // In a real implementation, this would use a geolocation service
    // For now, we'll use a simple timezone-based approach
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const geoMapping: Record<string, string> = {
        'Europe/Paris': 'fr',
        'Europe/Madrid': 'es',
        'Europe/Berlin': 'de',
        'Asia/Kolkata': 'hi',
        'Asia/Shanghai': 'zh',
        'Asia/Tokyo': 'ja',
        'America/Sao_Paulo': 'pt',
        'Europe/Moscow': 'ru',
        'Asia/Riyadh': 'ar',
      };
      
      for (const [tz, lang] of Object.entries(geoMapping)) {
        if (timezone.includes(tz.split('/')[1])) {
          resolve(lang);
          return;
        }
      }
    } catch (error) {
      console.warn('Geo-language detection failed:', error);
    }
    
    resolve(DEFAULT_LANGUAGE);
  });
}

// Language preference storage
export const LANGUAGE_STORAGE_KEY = 'findawise_language_preference';

export function getStoredLanguagePreference(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(LANGUAGE_STORAGE_KEY);
}

export function setStoredLanguagePreference(language: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

// URL routing configuration for localized content
export interface LocalizedRoute {
  pattern: string;
  component: string;
  languages: string[];
  seoSettings: {
    hreflang: Record<string, string>;
    canonical: string;
    alternates: Record<string, string>;
  };
}

// Default localized routing patterns
export const LOCALIZED_ROUTES: LocalizedRoute[] = [
  {
    pattern: '/:lang?/page/:slug',
    component: 'DynamicPage',
    languages: SUPPORTED_LANGUAGES.map(l => l.code),
    seoSettings: {
      hreflang: {},
      canonical: '/page/:slug',
      alternates: {},
    },
  },
  {
    pattern: '/:lang?/offer/:slug',
    component: 'OfferPage',
    languages: SUPPORTED_LANGUAGES.map(l => l.code),
    seoSettings: {
      hreflang: {},
      canonical: '/offer/:slug',
      alternates: {},
    },
  },
  {
    pattern: '/:lang?/admin/:section',
    component: 'AdminDashboard',
    languages: ['en'], // Admin only in English for now
    seoSettings: {
      hreflang: {},
      canonical: '/admin/:section',
      alternates: {},
    },
  },
];

// Translation key path utilities
export class TranslationKeyBuilder {
  private keyPath: string[] = [];

  static create(): TranslationKeyBuilder {
    return new TranslationKeyBuilder();
  }

  page(slug: string): TranslationKeyBuilder {
    this.keyPath = ['pages', slug];
    return this;
  }

  offer(slug: string): TranslationKeyBuilder {
    this.keyPath = ['offers', slug];
    return this;
  }

  form(formId: string): TranslationKeyBuilder {
    this.keyPath = ['forms', formId];
    return this;
  }

  ui(section: string): TranslationKeyBuilder {
    this.keyPath = ['ui', section];
    return this;
  }

  email(templateId: string): TranslationKeyBuilder {
    this.keyPath = ['emails', templateId];
    return this;
  }

  dashboard(sectionId: string): TranslationKeyBuilder {
    this.keyPath = ['dashboard', sectionId];
    return this;
  }

  field(field: string): TranslationKeyBuilder {
    this.keyPath.push(field);
    return this;
  }

  nested(path: string): TranslationKeyBuilder {
    this.keyPath.push(path);
    return this;
  }

  build(): string {
    return this.keyPath.join('.');
  }
}

// Translation interpolation utilities
export function interpolateTranslation(
  template: string,
  variables: Record<string, string | number> = {}
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : match;
  });
}

// Pluralization utilities
export function getPluralForm(
  count: number,
  language: string,
  forms: { zero?: string; one?: string; few?: string; many?: string; other: string }
): string {
  // Simplified pluralization rules - in production, use a proper library like Intl.PluralRules
  const rules = new Intl.PluralRules(language);
  const rule = rules.select(count);
  
  return forms[rule as keyof typeof forms] || forms.other;
}

// RTL language support
export function isRTLLanguage(language: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
}

// Currency and number formatting
export function formatCurrency(
  amount: number,
  language: string,
  currency: string = 'USD'
): string {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    // Fallback to USD formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

export function formatNumber(
  number: number,
  language: string,
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat(language, options).format(number);
  } catch (error) {
    return new Intl.NumberFormat('en-US', options).format(number);
  }
}

// Date and time formatting
export function formatDate(
  date: Date,
  language: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    return new Intl.DateTimeFormat(language, options).format(date);
  } catch (error) {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}

// Language-specific text direction
export function getTextDirection(language: string): 'ltr' | 'rtl' {
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
}

// Language validation
export function isValidLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

export function getLanguageInfo(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

// SEO hreflang generation
export function generateHreflangTags(
  currentPath: string,
  availableLanguages: string[]
): Record<string, string> {
  const hreflang: Record<string, string> = {};
  
  for (const lang of availableLanguages) {
    if (lang === DEFAULT_LANGUAGE) {
      hreflang['x-default'] = currentPath;
      hreflang[lang] = currentPath;
    } else {
      hreflang[lang] = `/${lang}${currentPath}`;
    }
  }
  
  return hreflang;
}

// Translation cache management
export class TranslationCache {
  private cache = new Map<string, Map<string, string>>();
  private maxSize = 1000;

  set(language: string, key: string, value: string): void {
    if (!this.cache.has(language)) {
      this.cache.set(language, new Map());
    }
    
    const langCache = this.cache.get(language)!;
    
    // Simple LRU eviction
    if (langCache.size >= this.maxSize) {
      const firstKey = langCache.keys().next().value;
      langCache.delete(firstKey);
    }
    
    langCache.set(key, value);
  }

  get(language: string, key: string): string | undefined {
    return this.cache.get(language)?.get(key);
  }

  clear(language?: string): void {
    if (language) {
      this.cache.delete(language);
    } else {
      this.cache.clear();
    }
  }

  getStats(): { totalEntries: number; languageCount: number } {
    let totalEntries = 0;
    for (const langCache of this.cache.values()) {
      totalEntries += langCache.size;
    }
    return {
      totalEntries,
      languageCount: this.cache.size,
    };
  }
}

export const translationCache = new TranslationCache();