// Translation Service for Auto-Translation using Multiple Providers
import axios from 'axios';

export interface TranslationProvider {
  name: string;
  translate: (text: string, targetLang: string, sourceLang?: string) => Promise<TranslationResult>;
  detectLanguage?: (text: string) => Promise<string>;
  getSupportedLanguages?: () => Promise<string[]>;
  maxTextLength: number;
  isAvailable: () => Promise<boolean>;
}

export interface TranslationResult {
  translatedText: string;
  confidence: number;
  provider: string;
  detectedSourceLanguage?: string;
  alternatives?: string[];
}

export interface BatchTranslationRequest {
  texts: string[];
  targetLanguage: string;
  sourceLanguage?: string;
  context?: string;
  category?: string;
}

export interface BatchTranslationResult {
  translations: TranslationResult[];
  totalTokens: number;
  processingTime: number;
  errors: string[];
}

// LibreTranslate Provider (Free, Self-hostable)
class LibreTranslateProvider implements TranslationProvider {
  name = 'LibreTranslate';
  maxTextLength = 5000;
  private baseURL = 'https://libretranslate.de';
  private apiKey?: string;

  constructor(baseURL?: string, apiKey?: string) {
    if (baseURL) this.baseURL = baseURL;
    if (apiKey) this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/languages`, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async translate(text: string, targetLang: string, sourceLang = 'en'): Promise<TranslationResult> {
    try {
      const payload: any = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      };

      if (this.apiKey) {
        payload.api_key = this.apiKey;
      }

      const response = await axios.post(`${this.baseURL}/translate`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      return {
        translatedText: response.data.translatedText,
        confidence: 0.8, // LibreTranslate doesn't provide confidence scores
        provider: this.name,
        detectedSourceLanguage: sourceLang
      };
    } catch (error: any) {
      throw new Error(`LibreTranslate error: ${error.message}`);
    }
  }

  async getSupportedLanguages(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/languages`);
      return response.data.map((lang: any) => lang.code);
    } catch {
      return ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'hi'];
    }
  }
}

// Google Translate Provider (Demo/Limited)
class GoogleTranslateProvider implements TranslationProvider {
  name = 'Google Translate';
  maxTextLength = 5000;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResult> {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
      
      const payload: any = {
        q: text,
        target: targetLang,
        format: 'text'
      };

      if (sourceLang) {
        payload.source = sourceLang;
      }

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      const translation = response.data.data.translations[0];
      
      return {
        translatedText: translation.translatedText,
        confidence: 0.95,
        provider: this.name,
        detectedSourceLanguage: translation.detectedSourceLanguage || sourceLang
      };
    } catch (error: any) {
      throw new Error(`Google Translate error: ${error.message}`);
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const url = `https://translation.googleapis.com/language/detect/v2?key=${this.apiKey}`;
      const response = await axios.post(url, { q: text });
      return response.data.data.detections[0][0].language;
    } catch {
      return 'en';
    }
  }
}

// HuggingFace Translation Provider (Free with API key)
class HuggingFaceProvider implements TranslationProvider {
  name = 'HuggingFace';
  maxTextLength = 1000;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async translate(text: string, targetLang: string, sourceLang = 'en'): Promise<TranslationResult> {
    try {
      // HuggingFace uses specific model names for language pairs
      const modelName = this.getModelName(sourceLang, targetLang);
      
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${modelName}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const translatedText = response.data[0]?.translation_text || text;
      
      return {
        translatedText,
        confidence: 0.85,
        provider: this.name,
        detectedSourceLanguage: sourceLang
      };
    } catch (error: any) {
      throw new Error(`HuggingFace error: ${error.message}`);
    }
  }

  private getModelName(sourceLang: string, targetLang: string): string {
    const modelMap: Record<string, string> = {
      'en-fr': 'Helsinki-NLP/opus-mt-en-fr',
      'en-es': 'Helsinki-NLP/opus-mt-en-es',
      'en-de': 'Helsinki-NLP/opus-mt-en-de',
      'en-it': 'Helsinki-NLP/opus-mt-en-it',
      'en-pt': 'Helsinki-NLP/opus-mt-en-pt',
      'en-ru': 'Helsinki-NLP/opus-mt-en-ru',
      'en-zh': 'Helsinki-NLP/opus-mt-en-zh',
      'en-ja': 'Helsinki-NLP/opus-mt-en-jap',
      'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
      'en-ar': 'Helsinki-NLP/opus-mt-en-ar',
    };

    const key = `${sourceLang}-${targetLang}`;
    return modelMap[key] || 'Helsinki-NLP/opus-mt-en-fr'; // Fallback
  }
}

// Fallback/Mock Provider for Development
class FallbackProvider implements TranslationProvider {
  name = 'Fallback';
  maxTextLength = 10000;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async translate(text: string, targetLang: string, sourceLang = 'en'): Promise<TranslationResult> {
    // Simple mock translation with language prefix
    const mockTranslations: Record<string, string> = {
      'fr': `[FR] ${text}`,
      'es': `[ES] ${text}`,
      'de': `[DE] ${text}`,
      'hi': `[HI] ${text}`,
      'zh': `[ZH] ${text}`,
      'ja': `[JA] ${text}`,
      'pt': `[PT] ${text}`,
      'ru': `[RU] ${text}`,
      'ar': `[AR] ${text}`,
    };

    const translatedText = mockTranslations[targetLang] || text;
    
    return {
      translatedText,
      confidence: 0.5,
      provider: this.name,
      detectedSourceLanguage: sourceLang
    };
  }
}

// Main Translation Service
export class TranslationService {
  private providers: TranslationProvider[] = [];
  private fallbackProvider: TranslationProvider;
  private cache = new Map<string, TranslationResult>();
  private maxCacheSize = 10000;

  constructor() {
    this.fallbackProvider = new FallbackProvider();
    this.initializeProviders();
  }

  private async initializeProviders(): Promise<void> {
    // Initialize LibreTranslate (always available)
    this.providers.push(new LibreTranslateProvider());

    // Initialize Google Translate if API key available
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (googleApiKey) {
      this.providers.push(new GoogleTranslateProvider(googleApiKey));
    }

    // Initialize HuggingFace if API key available
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (hfApiKey) {
      this.providers.push(new HuggingFaceProvider(hfApiKey));
    }

    // Test provider availability
    for (const provider of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          console.warn(`Translation provider ${provider.name} is not available`);
        }
      } catch (error) {
        console.error(`Error testing provider ${provider.name}:`, error);
      }
    }
  }

  private getCacheKey(text: string, targetLang: string, sourceLang: string): string {
    return `${sourceLang}-${targetLang}-${text.substring(0, 100)}`;
  }

  async translateText(
    text: string,
    targetLang: string,
    sourceLang = 'en',
    options: { useCache?: boolean; preferredProvider?: string } = {}
  ): Promise<TranslationResult> {
    const { useCache = true, preferredProvider } = options;

    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, provider: `${cached.provider} (cached)` };
      }
    }

    // If source and target are the same, return original
    if (sourceLang === targetLang) {
      return {
        translatedText: text,
        confidence: 1.0,
        provider: 'No translation needed',
        detectedSourceLanguage: sourceLang
      };
    }

    let lastError: Error | null = null;
    
    // Try preferred provider first
    if (preferredProvider) {
      const provider = this.providers.find(p => p.name === preferredProvider);
      if (provider) {
        try {
          const result = await provider.translate(text, targetLang, sourceLang);
          this.updateCache(text, targetLang, sourceLang, result);
          return result;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Preferred provider ${preferredProvider} failed:`, error);
        }
      }
    }

    // Try available providers in order of preference
    for (const provider of this.providers) {
      if (preferredProvider && provider.name === preferredProvider) {
        continue; // Already tried
      }

      try {
        // Check text length limit
        if (text.length > provider.maxTextLength) {
          continue;
        }

        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          continue;
        }

        const result = await provider.translate(text, targetLang, sourceLang);
        this.updateCache(text, targetLang, sourceLang, result);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    // Fallback to mock provider
    console.warn('All translation providers failed, using fallback');
    try {
      const result = await this.fallbackProvider.translate(text, targetLang, sourceLang);
      return result;
    } catch (error) {
      throw new Error(`All translation providers failed. Last error: ${lastError?.message}`);
    }
  }

  async translateBatch(request: BatchTranslationRequest): Promise<BatchTranslationResult> {
    const startTime = Date.now();
    const results: TranslationResult[] = [];
    const errors: string[] = [];
    let totalTokens = 0;

    for (const text of request.texts) {
      try {
        const result = await this.translateText(
          text,
          request.targetLanguage,
          request.sourceLanguage
        );
        results.push(result);
        totalTokens += text.length;
      } catch (error) {
        errors.push(`Failed to translate: "${text.substring(0, 50)}...": ${(error as Error).message}`);
        // Add fallback result
        results.push({
          translatedText: text, // Use original as fallback
          confidence: 0,
          provider: 'Error fallback',
          detectedSourceLanguage: request.sourceLanguage || 'en'
        });
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      translations: results,
      totalTokens,
      processingTime,
      errors
    };
  }

  private updateCache(text: string, targetLang: string, sourceLang: string, result: TranslationResult): void {
    const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
    
    // Simple LRU eviction
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, result);
  }

  async getAvailableProviders(): Promise<{ name: string; available: boolean }[]> {
    const results = [];
    
    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        results.push({ name: provider.name, available });
      } catch {
        results.push({ name: provider.name, available: false });
      }
    }
    
    return results;
  }

  getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Utility method to split long text for translation
  splitTextForTranslation(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const sentenceWithPunctuation = trimmedSentence + '.';
      
      if (currentChunk.length + sentenceWithPunctuation.length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + sentenceWithPunctuation;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentenceWithPunctuation;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }
}

// Singleton instance
export const translationService = new TranslationService();