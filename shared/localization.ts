import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core Language Configuration Schema
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // en, fr, es, de, hi, etc.
  name: varchar("name", { length: 100 }).notNull(), // English, French, Spanish, etc.
  nativeName: varchar("native_name", { length: 100 }).notNull(), // English, Français, Español, etc.
  direction: varchar("direction", { length: 3 }).default("ltr"), // ltr or rtl
  region: varchar("region", { length: 10 }), // US, CA, FR, ES, IN, etc.
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  fallbackLanguage: varchar("fallback_language", { length: 10 }).default("en"),
  completeness: integer("completeness").default(0), // 0-100% translation coverage
  autoTranslate: boolean("auto_translate").default(true),
  customSettings: jsonb("custom_settings"), // Language-specific formatting, currency, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Translation Keys and Content
export const translationKeys = pgTable("translation_keys", {
  id: serial("id").primaryKey(),
  keyPath: varchar("key_path", { length: 500 }).notNull().unique(), // pages.home.title, offers.cta.button, etc.
  category: varchar("category", { length: 100 }).notNull(), // page, offer, form, email, dashboard, etc.
  context: text("context"), // Additional context for translators
  defaultValue: text("default_value").notNull(), // Default English content
  interpolationVars: jsonb("interpolation_vars"), // Variables for dynamic content
  isPlural: boolean("is_plural").default(false),
  priority: integer("priority").default(1), // 1=critical, 2=important, 3=optional
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Translated Content
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  keyId: integer("key_id").references(() => translationKeys.id),
  languageCode: varchar("language_code", { length: 10 }).references(() => languages.code),
  translatedValue: text("translated_value").notNull(),
  isAutoTranslated: boolean("is_auto_translated").default(false),
  isVerified: boolean("is_verified").default(false),
  quality: integer("quality").default(0), // 0-100 quality score
  lastReviewed: timestamp("last_reviewed"),
  reviewerId: varchar("reviewer_id", { length: 255 }),
  metadata: jsonb("metadata"), // Translation provider, confidence, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Language Preferences
export const userLanguagePreferences = pgTable("user_language_preferences", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).references(() => languages.code),
  detectedLanguage: varchar("detected_language", { length: 10 }),
  detectionMethod: varchar("detection_method", { length: 50 }), // browser, geoip, manual, etc.
  autoDetect: boolean("auto_detect").default(true),
  browserLanguages: jsonb("browser_languages"), // Array of browser accept-language
  geoLocation: jsonb("geo_location"), // Country, region from IP
  isManualOverride: boolean("is_manual_override").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Localized Content Assignments
export const localizedContentAssignments = pgTable("localized_content_assignments", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 100 }).notNull(), // page, offer, form, email, etc.
  contentId: varchar("content_id", { length: 255 }).notNull(), // slug, id, or identifier
  languageCode: varchar("language_code", { length: 10 }).references(() => languages.code),
  translationKeys: jsonb("translation_keys").notNull(), // Array of key paths
  customTranslations: jsonb("custom_translations"), // Override translations
  seoSettings: jsonb("seo_settings"), // hreflang, meta, canonical, etc.
  routingSettings: jsonb("routing_settings"), // URL patterns, redirects
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics for Localization
export const localizationAnalytics = pgTable("localization_analytics", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  languageCode: varchar("language_code", { length: 10 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // language_switch, content_view, translation_fallback
  contentType: varchar("content_type", { length: 100 }),
  contentId: varchar("content_id", { length: 255 }),
  keyPath: varchar("key_path", { length: 500 }),
  fallbackUsed: boolean("fallback_used").default(false),
  translationQuality: integer("translation_quality"),
  userFeedback: jsonb("user_feedback"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for validation
export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationKeySchema = createInsertSchema(translationKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLanguagePreferenceSchema = createInsertSchema(userLanguagePreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocalizedContentAssignmentSchema = createInsertSchema(localizedContentAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocalizationAnalyticsSchema = createInsertSchema(localizationAnalytics).omit({
  id: true,
  timestamp: true,
  createdAt: true,
});

// Type exports
export type Language = typeof languages.$inferSelect;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type TranslationKey = typeof translationKeys.$inferSelect;
export type InsertTranslationKey = z.infer<typeof insertTranslationKeySchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type UserLanguagePreference = typeof userLanguagePreferences.$inferSelect;
export type InsertUserLanguagePreference = z.infer<typeof insertUserLanguagePreferenceSchema>;
export type LocalizedContentAssignment = typeof localizedContentAssignments.$inferSelect;
export type InsertLocalizedContentAssignment = z.infer<typeof insertLocalizedContentAssignmentSchema>;
export type LocalizationAnalytics = typeof localizationAnalytics.$inferSelect;
export type InsertLocalizationAnalytics = z.infer<typeof insertLocalizationAnalyticsSchema>;

// Supported languages configuration
export const SUPPORTED_LANGUAGES = [
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

// Translation categories for organization
export const TRANSLATION_CATEGORIES = {
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

// Default translation key structure
export interface TranslationKeyStructure {
  pages: {
    [pageSlug: string]: {
      title: string;
      description: string;
      keywords: string;
      content: {
        [sectionId: string]: string;
      };
      cta: {
        [ctaId: string]: string;
      };
    };
  };
  offers: {
    [offerSlug: string]: {
      title: string;
      description: string;
      cta: string;
      features: string[];
    };
  };
  forms: {
    [formId: string]: {
      title: string;
      fields: {
        [fieldId: string]: {
          label: string;
          placeholder: string;
          validation: string;
        };
      };
      submit: string;
      success: string;
      error: string;
    };
  };
  ui: {
    navigation: {
      [navItem: string]: string;
    };
    common: {
      [key: string]: string;
    };
    buttons: {
      [buttonId: string]: string;
    };
    messages: {
      [messageId: string]: string;
    };
  };
  emails: {
    [templateId: string]: {
      subject: string;
      body: string;
      footer: string;
    };
  };
  dashboard: {
    [sectionId: string]: {
      title: string;
      description: string;
      labels: {
        [labelId: string]: string;
      };
    };
  };
}

// Translation utility functions
export function interpolateTranslation(text: string, variables: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

export function getPluralForm(count: number, language: string, forms: any): string {
  // Simplified plural form logic for common languages
  if (typeof forms === 'string') return forms;
  
  if (language === 'en') {
    if (count === 0 && forms.zero) return forms.zero;
    if (count === 1) return forms.one || forms.singular || forms.few;
    return forms.other || forms.many || forms.plural;
  }
  
  // Default fallback
  return forms.other || forms.many || forms.one || '';
}

export function formatCurrency(amount: number, language: string, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
}

export function formatDate(date: Date, language: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(language, options).format(date);
  } catch (error) {
    return date.toLocaleDateString();
  }
}

export function formatNumber(number: number, language: string, options?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(language, options).format(number);
  } catch (error) {
    return number.toString();
  }
}