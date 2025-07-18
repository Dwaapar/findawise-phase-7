/**
 * Session Manager - Core behavioral tracking and user personalization engine
 * Tracks user behavior, manages session data, and provides personalization insights
 */

import { z } from 'zod';

// Define user behavior tracking schemas
export const BehaviorEventSchema = z.object({
  type: z.enum(['page_visit', 'scroll_depth', 'quiz_answer', 'affiliate_click', 'time_on_site', 'cta_click', 'content_engagement']),
  timestamp: z.number(),
  data: z.record(z.any()),
  sessionId: z.string(),
  pageSlug: z.string().optional(),
  userId: z.string().optional(),
});

export const UserSessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
  startTime: z.number(),
  lastActivity: z.number(),
  totalTimeOnSite: z.number(),
  pageViews: z.number(),
  interactions: z.number(),
  deviceInfo: z.object({
    userAgent: z.string(),
    screen: z.object({
      width: z.number(),
      height: z.number(),
    }),
    timezone: z.string(),
    language: z.string(),
  }),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  preferences: z.object({
    emotions: z.array(z.string()),
    categories: z.array(z.string()),
    interactiveModules: z.array(z.string()),
  }),
  quizResults: z.array(z.object({
    quizId: z.string(),
    answers: z.record(z.any()),
    score: z.number(),
    result: z.string(),
    timestamp: z.number(),
  })),
  affiliateClicks: z.array(z.object({
    offerId: z.string(),
    offerSlug: z.string(),
    timestamp: z.number(),
    converted: z.boolean(),
  })),
  behaviors: z.array(BehaviorEventSchema),
  segment: z.enum(['new_visitor', 'returning_visitor', 'engaged_user', 'high_converter', 'researcher', 'buyer']),
  personalizationFlags: z.record(z.boolean()),
});

export type BehaviorEvent = z.infer<typeof BehaviorEventSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: UserSession | null = null;
  private behaviorQueue: BehaviorEvent[] = [];
  private isTracking = true;
  private sessionKey = 'findawise_session';
  private cookiePrefix = 'fw_';

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  constructor() {
    this.initializeSession();
    this.setupBehaviorTracking();
    this.startSessionMaintenance();
  }

  /**
   * Initialize or restore existing session
   */
  private initializeSession(): void {
    try {
      // Try to restore from localStorage
      const savedSession = localStorage.getItem(this.sessionKey);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        const validated = UserSessionSchema.parse(parsed);
        
        // Check if session is still valid (less than 24 hours old)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - validated.lastActivity < maxAge) {
          this.currentSession = validated;
          this.updateLastActivity();
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to restore session:', error);
    }

    // Create new session
    this.createNewSession();
  }

  /**
   * Create a new user session
   */
  private createNewSession(): void {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    this.currentSession = {
      sessionId,
      startTime: now,
      lastActivity: now,
      totalTimeOnSite: 0,
      pageViews: 0,
      interactions: 0,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
      preferences: {
        emotions: [],
        categories: [],
        interactiveModules: [],
      },
      quizResults: [],
      affiliateClicks: [],
      behaviors: [],
      segment: 'new_visitor',
      personalizationFlags: {},
    };

    this.saveSession();
    this.setCookie('session_id', sessionId, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Setup automatic behavior tracking
   */
  private setupBehaviorTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackBehavior('time_on_site', {
          timeSpent: Date.now() - (this.currentSession?.lastActivity || Date.now()),
        });
      } else {
        this.updateLastActivity();
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.pageYOffset;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        this.trackBehavior('scroll_depth', {
          depth: scrollPercent,
          scrollTop,
          scrollHeight,
        });
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Track clicks on interactive elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Track CTA clicks
      if (target.matches('[data-track="cta"]') || target.closest('[data-track="cta"]')) {
        this.trackBehavior('cta_click', {
          element: target.tagName,
          text: target.textContent?.trim(),
          href: (target as HTMLAnchorElement).href,
        });
      }

      // Track affiliate link clicks
      if (target.matches('a[href*="/go/"]') || target.closest('a[href*="/go/"]')) {
        const link = target.matches('a') ? target : target.closest('a');
        const href = (link as HTMLAnchorElement).href;
        const slug = href.split('/go/')[1];
        
        this.trackBehavior('affiliate_click', {
          slug,
          href,
          text: link?.textContent?.trim(),
        });
      }
    });

    // Track content engagement (reading time)
    let contentStartTime = Date.now();
    const trackContentEngagement = () => {
      const timeSpent = Date.now() - contentStartTime;
      if (timeSpent > 5000) { // Only track if user spent more than 5 seconds
        this.trackBehavior('content_engagement', {
          timeSpent,
          wordsRead: this.estimateWordsRead(),
        });
      }
    };

    // Track when user leaves the page
    window.addEventListener('beforeunload', trackContentEngagement);
  }

  /**
   * Start session maintenance (periodic saves and cleanup)
   */
  private startSessionMaintenance(): void {
    // Save session every 30 seconds
    setInterval(() => {
      this.saveSession();
      this.processQueuedBehaviors();
    }, 30000);

    // Update total time on site every minute
    setInterval(() => {
      if (this.currentSession && !document.hidden) {
        this.currentSession.totalTimeOnSite = Date.now() - this.currentSession.startTime;
        this.updateUserSegment();
      }
    }, 60000);
  }

  /**
   * Track a behavior event
   */
  trackBehavior(type: BehaviorEvent['type'], data: Record<string, any>): void {
    if (!this.isTracking || !this.currentSession) return;

    const behavior: BehaviorEvent = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.currentSession.sessionId,
      pageSlug: window.location.pathname.split('/').pop(),
    };

    this.currentSession.behaviors.push(behavior);
    this.behaviorQueue.push(behavior);
    this.currentSession.interactions++;
    
    this.updateLastActivity();
    this.updateUserSegment();
  }

  /**
   * Track page visit
   */
  trackPageVisit(pageSlug: string, pageData: Record<string, any> = {}): void {
    if (!this.currentSession) return;

    this.currentSession.pageViews++;
    
    this.trackBehavior('page_visit', {
      pageSlug,
      url: window.location.href,
      referrer: document.referrer,
      ...pageData,
    });

    // Update preferences based on page emotion and category
    if (pageData.emotion && !this.currentSession.preferences.emotions.includes(pageData.emotion)) {
      this.currentSession.preferences.emotions.push(pageData.emotion);
    }
    
    if (pageData.category && !this.currentSession.preferences.categories.includes(pageData.category)) {
      this.currentSession.preferences.categories.push(pageData.category);
    }
  }

  /**
   * Track quiz completion
   */
  trackQuizCompletion(quizId: string, answers: Record<string, any>, score: number, result: string): void {
    if (!this.currentSession) return;

    const quizResult = {
      quizId,
      answers,
      score,
      result,
      timestamp: Date.now(),
    };

    this.currentSession.quizResults.push(quizResult);
    
    this.trackBehavior('quiz_answer', {
      quizId,
      score,
      result,
      totalQuizzes: this.currentSession.quizResults.length,
    });
  }

  /**
   * Track affiliate click
   */
  trackAffiliateClick(offerSlug: string, offerId: string): void {
    if (!this.currentSession) return;

    const clickData = {
      offerId,
      offerSlug,
      timestamp: Date.now(),
      converted: false,
    };

    this.currentSession.affiliateClicks.push(clickData);
    
    this.trackBehavior('affiliate_click', {
      offerSlug,
      offerId,
      totalClicks: this.currentSession.affiliateClicks.length,
    });
  }

  /**
   * Mark affiliate conversion
   */
  markAffiliateConversion(offerSlug: string): void {
    if (!this.currentSession) return;

    const click = this.currentSession.affiliateClicks.find(c => c.offerSlug === offerSlug);
    if (click) {
      click.converted = true;
      this.updateUserSegment();
    }
  }

  /**
   * Get current session data
   */
  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  /**
   * Get user segment for personalization
   */
  getUserSegment(): UserSession['segment'] {
    return this.currentSession?.segment || 'new_visitor';
  }

  /**
   * Get personalization data
   */
  getPersonalizationData(): {
    segment: UserSession['segment'];
    preferences: UserSession['preferences'];
    quizResults: UserSession['quizResults'];
    behaviors: BehaviorEvent[];
    flags: Record<string, boolean>;
  } {
    if (!this.currentSession) {
      return {
        segment: 'new_visitor',
        preferences: { emotions: [], categories: [], interactiveModules: [] },
        quizResults: [],
        behaviors: [],
        flags: {},
      };
    }

    return {
      segment: this.currentSession.segment,
      preferences: this.currentSession.preferences,
      quizResults: this.currentSession.quizResults,
      behaviors: this.currentSession.behaviors,
      flags: this.currentSession.personalizationFlags,
    };
  }

  /**
   * Update user segment based on behavior
   */
  private updateUserSegment(): void {
    if (!this.currentSession) return;

    const { pageViews, totalTimeOnSite, affiliateClicks, quizResults, behaviors } = this.currentSession;
    const conversions = affiliateClicks.filter(c => c.converted).length;
    const conversionRate = affiliateClicks.length > 0 ? conversions / affiliateClicks.length : 0;

    // Determine user segment
    if (conversions > 0) {
      this.currentSession.segment = 'high_converter';
    } else if (affiliateClicks.length >= 5) {
      this.currentSession.segment = 'buyer';
    } else if (pageViews >= 10 && totalTimeOnSite > 600000) { // 10+ pages, 10+ minutes
      this.currentSession.segment = 'engaged_user';
    } else if (quizResults.length >= 2 && affiliateClicks.length < 3) {
      this.currentSession.segment = 'researcher';
    } else if (pageViews > 1) {
      this.currentSession.segment = 'returning_visitor';
    } else {
      this.currentSession.segment = 'new_visitor';
    }

    // Set personalization flags
    this.currentSession.personalizationFlags = {
      showPersonalizedOffers: this.currentSession.segment !== 'new_visitor',
      useAggressiveCTAs: ['buyer', 'high_converter'].includes(this.currentSession.segment),
      showSocialProof: ['researcher', 'engaged_user'].includes(this.currentSession.segment),
      prioritizeEducation: this.currentSession.segment === 'researcher',
      showUrgency: ['buyer', 'returning_visitor'].includes(this.currentSession.segment),
    };
  }

  /**
   * Get recommended content based on user behavior
   */
  getRecommendedContent(): {
    emotions: string[];
    categories: string[];
    offers: string[];
  } {
    if (!this.currentSession) {
      return { emotions: ['trust'], categories: ['general'], offers: [] };
    }

    const { preferences, quizResults, behaviors, segment } = this.currentSession;
    
    // Recommend emotions based on previous interactions
    let recommendedEmotions = [...preferences.emotions];
    
    if (segment === 'new_visitor') {
      recommendedEmotions = ['trust', 'calm'];
    } else if (segment === 'buyer') {
      recommendedEmotions = ['confidence', 'excitement'];
    } else if (segment === 'researcher') {
      recommendedEmotions = ['trust', 'relief'];
    }

    // Recommend categories based on engagement
    const categoryEngagement = behaviors
      .filter(b => b.type === 'page_visit' && b.data.category)
      .reduce((acc, b) => {
        const category = b.data.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const recommendedCategories = Object.entries(categoryEngagement)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Recommend offers based on segment
    const offerRecommendations = this.getOfferRecommendations();

    return {
      emotions: recommendedEmotions.slice(0, 3),
      categories: recommendedCategories.length > 0 ? recommendedCategories : preferences.categories,
      offers: offerRecommendations,
    };
  }

  /**
   * Get offer recommendations based on user segment and behavior
   */
  private getOfferRecommendations(): string[] {
    if (!this.currentSession) return [];

    const { segment, preferences, quizResults } = this.currentSession;
    
    // Base recommendations on segment
    const segmentOffers: Record<UserSession['segment'], string[]> = {
      new_visitor: ['free-guide', 'starter-course'],
      returning_visitor: ['premium-course', 'advanced-toolkit'],
      engaged_user: ['masterclass', 'coaching-program'],
      high_converter: ['elite-program', 'vip-access'],
      researcher: ['detailed-course', 'expert-consultation'],
      buyer: ['premium-bundle', 'exclusive-offer'],
    };

    let recommendations = segmentOffers[segment] || [];

    // Enhance with category preferences
    if (preferences.categories.includes('fitness')) {
      recommendations.unshift('fitness-transformation', 'workout-program');
    }
    if (preferences.categories.includes('finance')) {
      recommendations.unshift('investment-course', 'trading-masterclass');
    }
    if (preferences.categories.includes('wellness')) {
      recommendations.unshift('meditation-app', 'stress-relief');
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    this.currentSession = null;
    localStorage.removeItem(this.sessionKey);
    this.clearAllCookies();
    this.createNewSession();
  }

  /**
   * Export session data for analytics
   */
  exportSessionData(): string {
    return JSON.stringify(this.currentSession, null, 2);
  }

  /**
   * Import session data
   */
  importSessionData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      const validated = UserSessionSchema.parse(parsed);
      this.currentSession = validated;
      this.saveSession();
      return true;
    } catch (error) {
      console.error('Failed to import session data:', error);
      return false;
    }
  }

  // Private helper methods
  private generateSessionId(): string {
    return `fw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now();
    }
  }

  private saveSession(): void {
    if (this.currentSession) {
      localStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
    }
  }

  private setCookie(name: string, value: string, maxAge: number): void {
    const expires = new Date(Date.now() + maxAge).toUTCString();
    document.cookie = `${this.cookiePrefix}${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const cookieName = `${this.cookiePrefix}${name}=`;
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length);
      }
    }
    return null;
  }

  private clearAllCookies(): void {
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [name] = cookie.split('=');
      if (name.trim().startsWith(this.cookiePrefix)) {
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    }
  }

  private estimateWordsRead(): number {
    const content = document.querySelector('main, article, .content');
    if (!content) return 0;
    
    const text = content.textContent || '';
    return text.split(/\s+/).length;
  }

  private processQueuedBehaviors(): void {
    if (this.behaviorQueue.length === 0) return;

    // Send behaviors to backend for analysis
    const behaviors = [...this.behaviorQueue];
    this.behaviorQueue = [];

    // Send to analytics endpoint
    fetch('/api/analytics/behaviors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ behaviors }),
    }).catch(error => {
      console.warn('Failed to send behavior data:', error);
      // Re-queue behaviors for retry
      this.behaviorQueue.unshift(...behaviors);
    });
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Global session tracking utilities
export const trackPageView = (pageSlug: string, pageData?: Record<string, any>) => {
  sessionManager.trackPageVisit(pageSlug, pageData);
};

export const trackQuiz = (quizId: string, answers: Record<string, any>, score: number, result: string) => {
  sessionManager.trackQuizCompletion(quizId, answers, score, result);
};

export const trackAffiliateClick = (offerSlug: string, offerId: string) => {
  sessionManager.trackAffiliateClick(offerSlug, offerId);
};

export const getPersonalization = () => {
  return sessionManager.getPersonalizationData();
};

export const getRecommendations = () => {
  return sessionManager.getRecommendedContent();
};