/**
 * Personalization Engine - Content customization based on user behavior and segments
 * Provides personalized content recommendations, CTA optimization, and offer targeting
 */

import { sessionManager, type UserSession, type BehaviorEvent } from './sessionManager';
import { emotionMap } from '@/config/emotionMap';

export interface PersonalizationConfig {
  emotion?: string;
  ctaText?: string;
  ctaStyle?: 'subtle' | 'standard' | 'aggressive' | 'urgent';
  offerPriority?: string[];
  contentModifications?: {
    showSocialProof?: boolean;
    showUrgency?: boolean;
    showPersonalizedGreeting?: boolean;
    highlightBenefits?: string[];
  };
  recommendedContent?: {
    emotions: string[];
    categories: string[];
    nextPages: string[];
  };
}

export interface UserSegmentConfig {
  segment: UserSession['segment'];
  ctaVariations: {
    primary: string;
    secondary: string;
    urgent: string;
  };
  emotionPreferences: string[];
  offerTypes: string[];
  contentStyle: 'educational' | 'promotional' | 'social_proof' | 'urgent';
  conversionOptimizations: {
    showReviews: boolean;
    showCountdown: boolean;
    showLimitedOffer: boolean;
    showPersonalization: boolean;
  };
}

export class PersonalizationEngine {
  private static instance: PersonalizationEngine;
  private segmentConfigs: Record<UserSession['segment'], UserSegmentConfig>;

  static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine();
    }
    return PersonalizationEngine.instance;
  }

  constructor() {
    this.segmentConfigs = this.initializeSegmentConfigs();
  }

  /**
   * Initialize segment-based configurations
   */
  private initializeSegmentConfigs(): Record<UserSession['segment'], UserSegmentConfig> {
    return {
      new_visitor: {
        segment: 'new_visitor',
        ctaVariations: {
          primary: 'Get Started Free',
          secondary: 'Learn More',
          urgent: 'Start Your Journey Today',
        },
        emotionPreferences: ['trust', 'calm'],
        offerTypes: ['free_trial', 'starter_guide', 'introduction'],
        contentStyle: 'educational',
        conversionOptimizations: {
          showReviews: true,
          showCountdown: false,
          showLimitedOffer: false,
          showPersonalization: false,
        },
      },
      returning_visitor: {
        segment: 'returning_visitor',
        ctaVariations: {
          primary: 'Continue Your Progress',
          secondary: 'See What\'s New',
          urgent: 'Don\'t Miss Out - Act Now',
        },
        emotionPreferences: ['confidence', 'excitement'],
        offerTypes: ['premium_upgrade', 'advanced_course', 'exclusive_content'],
        contentStyle: 'promotional',
        conversionOptimizations: {
          showReviews: false,
          showCountdown: true,
          showLimitedOffer: true,
          showPersonalization: true,
        },
      },
      engaged_user: {
        segment: 'engaged_user',
        ctaVariations: {
          primary: 'Take the Next Step',
          secondary: 'Unlock Premium Features',
          urgent: 'Limited Time - Upgrade Now',
        },
        emotionPreferences: ['confidence', 'excitement', 'trust'],
        offerTypes: ['premium_course', 'coaching', 'masterclass'],
        contentStyle: 'social_proof',
        conversionOptimizations: {
          showReviews: true,
          showCountdown: true,
          showLimitedOffer: true,
          showPersonalization: true,
        },
      },
      high_converter: {
        segment: 'high_converter',
        ctaVariations: {
          primary: 'Get VIP Access',
          secondary: 'Join Elite Program',
          urgent: 'Exclusive Opportunity',
        },
        emotionPreferences: ['confidence', 'excitement'],
        offerTypes: ['vip_program', 'elite_course', 'exclusive_access'],
        contentStyle: 'urgent',
        conversionOptimizations: {
          showReviews: false,
          showCountdown: true,
          showLimitedOffer: true,
          showPersonalization: true,
        },
      },
      researcher: {
        segment: 'researcher',
        ctaVariations: {
          primary: 'Get Detailed Information',
          secondary: 'Download Complete Guide',
          urgent: 'Access Full Research',
        },
        emotionPreferences: ['trust', 'relief'],
        offerTypes: ['detailed_guide', 'research_report', 'expert_consultation'],
        contentStyle: 'educational',
        conversionOptimizations: {
          showReviews: true,
          showCountdown: false,
          showLimitedOffer: false,
          showPersonalization: true,
        },
      },
      buyer: {
        segment: 'buyer',
        ctaVariations: {
          primary: 'Buy Now - Best Price',
          secondary: 'Add to Cart',
          urgent: 'Order Now - Limited Stock',
        },
        emotionPreferences: ['confidence', 'excitement'],
        offerTypes: ['premium_product', 'bundle_deal', 'bestseller'],
        contentStyle: 'urgent',
        conversionOptimizations: {
          showReviews: true,
          showCountdown: true,
          showLimitedOffer: true,
          showPersonalization: true,
        },
      },
    };
  }

  /**
   * Get personalized configuration for current user
   */
  getPersonalizationConfig(pageSlug: string, baseConfig: any): PersonalizationConfig {
    const session = sessionManager.getCurrentSession();
    if (!session) {
      return this.getDefaultConfig(pageSlug, baseConfig);
    }

    const segmentConfig = this.segmentConfigs[session.segment];
    const personalizationData = sessionManager.getPersonalizationData();
    
    return {
      emotion: this.selectOptimalEmotion(baseConfig.emotion, segmentConfig, personalizationData),
      ctaText: this.selectOptimalCTA(baseConfig.cta?.text, segmentConfig, personalizationData),
      ctaStyle: this.selectCTAStyle(segmentConfig, personalizationData),
      offerPriority: this.prioritizeOffers(segmentConfig, personalizationData),
      contentModifications: this.getContentModifications(segmentConfig, personalizationData),
      recommendedContent: this.getRecommendedContent(segmentConfig, personalizationData),
    };
  }

  /**
   * Select optimal emotion theme based on user preferences and segment
   */
  private selectOptimalEmotion(
    baseEmotion: string,
    segmentConfig: UserSegmentConfig,
    personalizationData: any
  ): string {
    // If user has strong emotion preferences, use them
    if (personalizationData.preferences.emotions.length > 0) {
      const preferredEmotion = personalizationData.preferences.emotions[0];
      if (emotionMap[preferredEmotion]) {
        return preferredEmotion;
      }
    }

    // Use segment-based emotion preference
    const segmentEmotions = segmentConfig.emotionPreferences;
    if (segmentEmotions.includes(baseEmotion)) {
      return baseEmotion;
    }

    // Return segment's primary emotion preference
    return segmentEmotions[0] || baseEmotion;
  }

  /**
   * Select optimal CTA text based on user behavior
   */
  private selectOptimalCTA(
    baseCTA: string,
    segmentConfig: UserSegmentConfig,
    personalizationData: any
  ): string {
    const { flags } = personalizationData;
    
    if (flags.useAggressiveCTAs) {
      return segmentConfig.ctaVariations.urgent;
    }
    
    if (flags.showPersonalizedOffers) {
      return segmentConfig.ctaVariations.primary;
    }
    
    return baseCTA || segmentConfig.ctaVariations.secondary;
  }

  /**
   * Select CTA style based on user segment and behavior
   */
  private selectCTAStyle(
    segmentConfig: UserSegmentConfig,
    personalizationData: any
  ): PersonalizationConfig['ctaStyle'] {
    const { segment } = personalizationData;
    const { flags } = personalizationData;

    if (flags.useAggressiveCTAs || segment === 'buyer') {
      return 'urgent';
    }
    
    if (segment === 'high_converter' || flags.showUrgency) {
      return 'aggressive';
    }
    
    if (segment === 'new_visitor' || segment === 'researcher') {
      return 'subtle';
    }
    
    return 'standard';
  }

  /**
   * Prioritize offers based on user segment and behavior
   */
  private prioritizeOffers(
    segmentConfig: UserSegmentConfig,
    personalizationData: any
  ): string[] {
    const { segment, preferences, quizResults, behaviors } = personalizationData;
    
    // Start with segment-based offer types
    let prioritizedOffers = [...segmentConfig.offerTypes];
    
    // Boost offers based on category preferences
    if (preferences.categories.includes('fitness')) {
      prioritizedOffers.unshift('fitness_program', 'workout_guide', 'nutrition_plan');
    }
    
    if (preferences.categories.includes('finance')) {
      prioritizedOffers.unshift('investment_course', 'trading_guide', 'financial_planning');
    }
    
    if (preferences.categories.includes('wellness')) {
      prioritizedOffers.unshift('meditation_app', 'stress_relief', 'mindfulness_course');
    }
    
    if (preferences.categories.includes('business')) {
      prioritizedOffers.unshift('business_course', 'entrepreneur_guide', 'marketing_toolkit');
    }
    
    // Boost based on quiz results
    quizResults.forEach(quiz => {
      if (quiz.score > 80) {
        prioritizedOffers.unshift('advanced_program', 'expert_level');
      } else if (quiz.score < 40) {
        prioritizedOffers.unshift('beginner_guide', 'starter_course');
      }
    });
    
    // Remove duplicates and limit to top 10
    return [...new Set(prioritizedOffers)].slice(0, 10);
  }

  /**
   * Get content modifications based on personalization
   */
  private getContentModifications(
    segmentConfig: UserSegmentConfig,
    personalizationData: any
  ): PersonalizationConfig['contentModifications'] {
    const { flags, segment } = personalizationData;
    const optimizations = segmentConfig.conversionOptimizations;
    
    return {
      showSocialProof: optimizations.showReviews || flags.showSocialProof,
      showUrgency: optimizations.showCountdown || flags.showUrgency,
      showPersonalizedGreeting: optimizations.showPersonalization,
      highlightBenefits: this.getHighlightedBenefits(segment, personalizationData),
    };
  }

  /**
   * Get benefits to highlight based on user profile
   */
  private getHighlightedBenefits(
    segment: UserSession['segment'],
    personalizationData: any
  ): string[] {
    const benefits: Record<UserSession['segment'], string[]> = {
      new_visitor: ['risk_free', 'money_back_guarantee', 'beginner_friendly'],
      returning_visitor: ['exclusive_content', 'member_benefits', 'progress_tracking'],
      engaged_user: ['advanced_features', 'community_access', 'expert_support'],
      high_converter: ['vip_treatment', 'priority_support', 'exclusive_bonuses'],
      researcher: ['detailed_information', 'scientific_backing', 'expert_credentials'],
      buyer: ['best_value', 'limited_time', 'immediate_access'],
    };
    
    let segmentBenefits = benefits[segment] || [];
    
    // Add category-specific benefits
    const { categories } = personalizationData.preferences;
    if (categories.includes('fitness')) {
      segmentBenefits.push('proven_results', 'transformation_guarantee');
    }
    if (categories.includes('finance')) {
      segmentBenefits.push('roi_guarantee', 'risk_management');
    }
    if (categories.includes('wellness')) {
      segmentBenefits.push('stress_reduction', 'life_improvement');
    }
    
    return segmentBenefits.slice(0, 5);
  }

  /**
   * Get recommended content based on user profile
   */
  private getRecommendedContent(
    segmentConfig: UserSegmentConfig,
    personalizationData: any
  ): PersonalizationConfig['recommendedContent'] {
    const recommendations = sessionManager.getRecommendedContent();
    
    return {
      emotions: recommendations.emotions,
      categories: recommendations.categories,
      nextPages: this.getRecommendedPages(segmentConfig, personalizationData),
    };
  }

  /**
   * Get recommended pages based on user behavior
   */
  private getRecommendedPages(
    segmentConfig: UserSegmentConfig,
    personalizationData: any
  ): string[] {
    const { segment, preferences, behaviors } = personalizationData;
    
    // Get pages user hasn't visited yet from their preferred categories
    const visitedPages = behaviors
      .filter((b: BehaviorEvent) => b.type === 'page_visit')
      .map((b: BehaviorEvent) => b.data.pageSlug);
    
    const recommendedPages: Record<UserSession['segment'], string[]> = {
      new_visitor: ['getting-started-guide', 'free-resources', 'success-stories'],
      returning_visitor: ['advanced-strategies', 'member-exclusive', 'latest-updates'],
      engaged_user: ['expert-interviews', 'case-studies', 'community-challenges'],
      high_converter: ['vip-content', 'exclusive-offers', 'premium-resources'],
      researcher: ['detailed-analysis', 'research-reports', 'expert-opinions'],
      buyer: ['product-comparisons', 'best-deals', 'customer-reviews'],
    };
    
    let pages = recommendedPages[segment] || [];
    
    // Add category-specific pages
    if (preferences.categories.includes('fitness')) {
      pages.push('workout-plans', 'nutrition-guides', 'transformation-stories');
    }
    if (preferences.categories.includes('finance')) {
      pages.push('investment-strategies', 'market-analysis', 'portfolio-tools');
    }
    if (preferences.categories.includes('wellness')) {
      pages.push('meditation-guides', 'stress-management', 'mindfulness-techniques');
    }
    
    // Filter out already visited pages
    return pages.filter(page => !visitedPages.includes(page)).slice(0, 6);
  }

  /**
   * Get default configuration for non-tracked users
   */
  private getDefaultConfig(pageSlug: string, baseConfig: any): PersonalizationConfig {
    return {
      emotion: baseConfig.emotion || 'trust',
      ctaText: baseConfig.cta?.text || 'Get Started',
      ctaStyle: 'standard',
      offerPriority: ['starter_guide', 'free_trial', 'introduction'],
      contentModifications: {
        showSocialProof: true,
        showUrgency: false,
        showPersonalizedGreeting: false,
        highlightBenefits: ['risk_free', 'beginner_friendly'],
      },
      recommendedContent: {
        emotions: ['trust', 'calm'],
        categories: ['general'],
        nextPages: ['getting-started-guide', 'free-resources'],
      },
    };
  }

  /**
   * A/B test different personalizations
   */
  runABTest(testName: string, variations: PersonalizationConfig[]): PersonalizationConfig {
    const session = sessionManager.getCurrentSession();
    if (!session) {
      return variations[0];
    }

    // Use session ID to deterministically assign variation
    const hash = this.hashString(session.sessionId + testName);
    const variationIndex = hash % variations.length;
    
    // Track A/B test participation
    sessionManager.trackBehavior('ab_test_participation', {
      testName,
      variation: variationIndex,
      sessionId: session.sessionId,
    });
    
    return variations[variationIndex];
  }

  /**
   * Get conversion optimization recommendations
   */
  getConversionOptimizations(pageSlug: string): {
    recommendations: string[];
    urgencyLevel: 'low' | 'medium' | 'high';
    trustSignals: string[];
    socialProof: string[];
  } {
    const session = sessionManager.getCurrentSession();
    if (!session) {
      return {
        recommendations: ['add_reviews', 'show_guarantees'],
        urgencyLevel: 'low',
        trustSignals: ['money_back_guarantee', 'secure_payment'],
        socialProof: ['customer_reviews', 'success_stories'],
      };
    }

    const segmentConfig = this.segmentConfigs[session.segment];
    const personalizationData = sessionManager.getPersonalizationData();
    
    const recommendations = [];
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
    
    // Determine urgency level
    if (session.segment === 'buyer' || session.segment === 'high_converter') {
      urgencyLevel = 'high';
      recommendations.push('show_countdown', 'limited_offer', 'stock_scarcity');
    } else if (session.segment === 'returning_visitor' || session.segment === 'engaged_user') {
      urgencyLevel = 'medium';
      recommendations.push('show_discount', 'member_exclusive');
    } else {
      urgencyLevel = 'low';
      recommendations.push('build_trust', 'provide_value');
    }
    
    // Trust signals based on segment
    const trustSignals = [];
    if (session.segment === 'new_visitor' || session.segment === 'researcher') {
      trustSignals.push('money_back_guarantee', 'secure_payment', 'expert_credentials');
    }
    if (session.segment === 'buyer') {
      trustSignals.push('secure_checkout', 'verified_reviews');
    }
    
    // Social proof based on segment
    const socialProof = [];
    if (segmentConfig.conversionOptimizations.showReviews) {
      socialProof.push('customer_reviews', 'success_stories');
    }
    if (session.segment === 'engaged_user') {
      socialProof.push('community_testimonials', 'expert_endorsements');
    }
    
    return {
      recommendations,
      urgencyLevel,
      trustSignals,
      socialProof,
    };
  }

  // Helper method for A/B test hash
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const personalizationEngine = PersonalizationEngine.getInstance();

// Helper functions for easy access
export const getPersonalizedConfig = (pageSlug: string, baseConfig: any): PersonalizationConfig => {
  return personalizationEngine.getPersonalizationConfig(pageSlug, baseConfig);
};

export const getConversionOptimizations = (pageSlug: string) => {
  return personalizationEngine.getConversionOptimizations(pageSlug);
};

export const runABTest = (testName: string, variations: PersonalizationConfig[]): PersonalizationConfig => {
  return personalizationEngine.runABTest(testName, variations);
};