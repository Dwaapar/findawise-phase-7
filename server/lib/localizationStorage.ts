// Server-side localization storage and management
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { 
  languages, 
  translationKeys, 
  translations, 
  userLanguagePreferences,
  localizedContentAssignments,
  localizationAnalytics,
  type Language,
  type InsertLanguage,
  type TranslationKey,
  type InsertTranslationKey,
  type Translation,
  type InsertTranslation,
  type UserLanguagePreference,
  type InsertUserLanguagePreference,
  type LocalizedContentAssignment,
  type InsertLocalizedContentAssignment,
  type LocalizationAnalytics,
  type InsertLocalizationAnalytics,
  SUPPORTED_LANGUAGES
} from "@shared/localization";

export class LocalizationStorage {
  // Language Management
  async createLanguage(data: InsertLanguage): Promise<Language> {
    const [language] = await db.insert(languages).values(data).returning();
    return language;
  }

  async getAllLanguages(): Promise<Language[]> {
    return db.select().from(languages).where(eq(languages.isActive, true)).orderBy(languages.name);
  }

  async getLanguageByCode(code: string): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.code, code));
    return language;
  }

  async updateLanguage(code: string, updates: Partial<InsertLanguage>): Promise<Language | undefined> {
    const [language] = await db
      .update(languages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(languages.code, code))
      .returning();
    return language;
  }

  async getDefaultLanguage(): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.isDefault, true));
    return language;
  }

  // Translation Keys Management
  async createTranslationKey(data: InsertTranslationKey): Promise<TranslationKey> {
    const [key] = await db.insert(translationKeys).values(data).returning();
    return key;
  }

  async getTranslationKey(keyPath: string): Promise<TranslationKey | undefined> {
    const [key] = await db.select().from(translationKeys).where(eq(translationKeys.keyPath, keyPath));
    return key;
  }

  async getAllTranslationKeys(category?: string): Promise<TranslationKey[]> {
    const query = db.select().from(translationKeys);
    
    if (category) {
      return query.where(eq(translationKeys.category, category)).orderBy(translationKeys.keyPath);
    }
    
    return query.orderBy(translationKeys.category, translationKeys.keyPath);
  }

  async updateTranslationKey(keyPath: string, updates: Partial<InsertTranslationKey>): Promise<TranslationKey | undefined> {
    const [key] = await db
      .update(translationKeys)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(translationKeys.keyPath, keyPath))
      .returning();
    return key;
  }

  async deleteTranslationKey(keyPath: string): Promise<boolean> {
    // First delete all translations for this key
    const key = await this.getTranslationKey(keyPath);
    if (!key) return false;

    await db.delete(translations).where(eq(translations.keyId, key.id));
    await db.delete(translationKeys).where(eq(translationKeys.id, key.id));
    
    return true;
  }

  // Translations Management
  async createTranslation(data: InsertTranslation): Promise<Translation> {
    const [translation] = await db.insert(translations).values(data).returning();
    return translation;
  }

  async getTranslation(keyId: number, languageCode: string): Promise<Translation | undefined> {
    const [translation] = await db
      .select()
      .from(translations)
      .where(and(
        eq(translations.keyId, keyId),
        eq(translations.languageCode, languageCode)
      ));
    return translation;
  }

  async getTranslationByKeyPath(keyPath: string, languageCode: string): Promise<string | undefined> {
    const result = await db
      .select({
        translatedValue: translations.translatedValue,
        defaultValue: translationKeys.defaultValue,
        isAutoTranslated: translations.isAutoTranslated
      })
      .from(translationKeys)
      .leftJoin(translations, and(
        eq(translations.keyId, translationKeys.id),
        eq(translations.languageCode, languageCode)
      ))
      .where(eq(translationKeys.keyPath, keyPath));

    if (result.length === 0) return undefined;

    const row = result[0];
    return row.translatedValue || row.defaultValue;
  }

  async getAllTranslations(languageCode: string): Promise<Record<string, string>> {
    const result = await db
      .select({
        keyPath: translationKeys.keyPath,
        translatedValue: translations.translatedValue,
        defaultValue: translationKeys.defaultValue
      })
      .from(translationKeys)
      .leftJoin(translations, and(
        eq(translations.keyId, translationKeys.id),
        eq(translations.languageCode, languageCode)
      ))
      .orderBy(translationKeys.keyPath);

    const translationsMap: Record<string, string> = {};
    
    for (const row of result) {
      translationsMap[row.keyPath] = row.translatedValue || row.defaultValue;
    }

    return translationsMap;
  }

  async updateTranslation(
    keyId: number, 
    languageCode: string, 
    updates: Partial<InsertTranslation>
  ): Promise<Translation | undefined> {
    const [translation] = await db
      .update(translations)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(translations.keyId, keyId),
        eq(translations.languageCode, languageCode)
      ))
      .returning();
    return translation;
  }

  async upsertTranslation(data: InsertTranslation): Promise<Translation> {
    // Try to find existing translation
    const existing = await this.getTranslation(data.keyId!, data.languageCode!);
    
    if (existing) {
      const [updated] = await db
        .update(translations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(translations.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(translations).values(data).returning();
      return created;
    }
  }

  // Batch operations
  async createTranslationKeysBatch(keys: InsertTranslationKey[]): Promise<TranslationKey[]> {
    if (keys.length === 0) return [];
    return db.insert(translationKeys).values(keys).returning();
  }

  async createTranslationsBatch(translationsData: InsertTranslation[]): Promise<Translation[]> {
    if (translationsData.length === 0) return [];
    return db.insert(translations).values(translationsData).returning();
  }

  async updateTranslationsBatch(
    updates: Array<{ keyId: number; languageCode: string; data: Partial<InsertTranslation> }>
  ): Promise<void> {
    if (updates.length === 0) return;

    // Use transaction for batch updates
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(translations)
          .set({ ...update.data, updatedAt: new Date() })
          .where(and(
            eq(translations.keyId, update.keyId),
            eq(translations.languageCode, update.languageCode)
          ));
      }
    });
  }

  // User Language Preferences
  async createUserLanguagePreference(data: InsertUserLanguagePreference): Promise<UserLanguagePreference> {
    const [preference] = await db.insert(userLanguagePreferences).values(data).returning();
    return preference;
  }

  async getUserLanguagePreference(sessionId: string): Promise<UserLanguagePreference | undefined> {
    const [preference] = await db
      .select()
      .from(userLanguagePreferences)
      .where(eq(userLanguagePreferences.sessionId, sessionId))
      .orderBy(desc(userLanguagePreferences.updatedAt));
    return preference;
  }

  async updateUserLanguagePreference(
    sessionId: string, 
    updates: Partial<InsertUserLanguagePreference>
  ): Promise<UserLanguagePreference | undefined> {
    const [preference] = await db
      .update(userLanguagePreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userLanguagePreferences.sessionId, sessionId))
      .returning();
    return preference;
  }

  async upsertUserLanguagePreference(data: InsertUserLanguagePreference): Promise<UserLanguagePreference> {
    const existing = await this.getUserLanguagePreference(data.sessionId!);
    
    if (existing) {
      const [updated] = await db
        .update(userLanguagePreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userLanguagePreferences.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userLanguagePreferences).values(data).returning();
      return created;
    }
  }

  // Localized Content Assignments
  async createLocalizedContentAssignment(data: InsertLocalizedContentAssignment): Promise<LocalizedContentAssignment> {
    const [assignment] = await db.insert(localizedContentAssignments).values(data).returning();
    return assignment;
  }

  async getLocalizedContentAssignment(
    contentType: string, 
    contentId: string, 
    languageCode: string
  ): Promise<LocalizedContentAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(localizedContentAssignments)
      .where(and(
        eq(localizedContentAssignments.contentType, contentType),
        eq(localizedContentAssignments.contentId, contentId),
        eq(localizedContentAssignments.languageCode, languageCode),
        eq(localizedContentAssignments.isActive, true)
      ));
    return assignment;
  }

  async getAllLocalizedContentAssignments(contentType?: string): Promise<LocalizedContentAssignment[]> {
    const query = db.select().from(localizedContentAssignments).where(eq(localizedContentAssignments.isActive, true));
    
    if (contentType) {
      return query.where(eq(localizedContentAssignments.contentType, contentType));
    }
    
    return query;
  }

  // Analytics
  async trackLocalizationEvent(data: InsertLocalizationAnalytics): Promise<LocalizationAnalytics> {
    const [event] = await db.insert(localizationAnalytics).values(data).returning();
    return event;
  }

  async getLocalizationAnalytics(
    languageCode?: string,
    eventType?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<LocalizationAnalytics[]> {
    let query = db.select().from(localizationAnalytics);
    
    const conditions = [];
    
    if (languageCode) {
      conditions.push(eq(localizationAnalytics.languageCode, languageCode));
    }
    
    if (eventType) {
      conditions.push(eq(localizationAnalytics.eventType, eventType));
    }
    
    if (startDate) {
      conditions.push(sql`${localizationAnalytics.timestamp} >= ${startDate}`);
    }
    
    if (endDate) {
      conditions.push(sql`${localizationAnalytics.timestamp} <= ${endDate}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(localizationAnalytics.timestamp));
  }

  async getLanguageUsageStats(): Promise<Array<{ languageCode: string; count: number; percentage: number }>> {
    const result = await db
      .select({
        languageCode: localizationAnalytics.languageCode,
        count: sql<number>`count(*)`.as('count')
      })
      .from(localizationAnalytics)
      .where(eq(localizationAnalytics.eventType, 'content_view'))
      .groupBy(localizationAnalytics.languageCode)
      .orderBy(desc(sql`count(*)`));

    const total = result.reduce((sum, item) => sum + item.count, 0);
    
    return result.map(item => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0
    }));
  }

  // Translation completeness tracking
  async getTranslationCompleteness(languageCode: string): Promise<{ total: number; translated: number; percentage: number }> {
    const totalKeys = await db
      .select({ count: sql<number>`count(*)` })
      .from(translationKeys);

    const translatedKeys = await db
      .select({ count: sql<number>`count(*)` })
      .from(translations)
      .where(eq(translations.languageCode, languageCode));

    const total = totalKeys[0]?.count || 0;
    const translated = translatedKeys[0]?.count || 0;
    const percentage = total > 0 ? (translated / total) * 100 : 0;

    return { total, translated, percentage };
  }

  // Initialize default languages and translation keys
  async initializeDefaultLanguages(): Promise<void> {
    const existingLanguages = await this.getAllLanguages();
    const existingCodes = existingLanguages.map(lang => lang.code);

    const missingLanguages = SUPPORTED_LANGUAGES.filter(
      lang => !existingCodes.includes(lang.code)
    );

    if (missingLanguages.length > 0) {
      await this.createLanguagesBatch(missingLanguages);
    }
  }

  async createLanguagesBatch(languages: typeof SUPPORTED_LANGUAGES): Promise<Language[]> {
    if (languages.length === 0) return [];
    return db.insert(languages).values(languages as InsertLanguage[]).returning();
  }

  // Auto-translation integration
  async markTranslationAsAutoTranslated(
    keyId: number, 
    languageCode: string, 
    quality: number = 80
  ): Promise<void> {
    await db
      .update(translations)
      .set({
        isAutoTranslated: true,
        quality,
        updatedAt: new Date()
      })
      .where(and(
        eq(translations.keyId, keyId),
        eq(translations.languageCode, languageCode)
      ));
  }

  async getUntranslatedKeys(languageCode: string, limit: number = 100): Promise<TranslationKey[]> {
    const result = await db
      .select({ key: translationKeys })
      .from(translationKeys)
      .leftJoin(translations, and(
        eq(translations.keyId, translationKeys.id),
        eq(translations.languageCode, languageCode)
      ))
      .where(sql`${translations.id} IS NULL`)
      .limit(limit);

    return result.map(row => row.key);
  }
}

export const localizationStorage = new LocalizationStorage();