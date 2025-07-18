import { 
  users, 
  affiliateNetworks,
  affiliateOffers,
  affiliateClicks,
  pageAffiliateAssignments,
  userSessions,
  behaviorEvents,
  quizResults,
  experiments,
  experimentVariants,
  userExperimentAssignments,
  experimentEvents,
  experimentResults,
  leadMagnets,
  leadForms,
  leadCaptures,
  leadFormAssignments,
  leadExperiments,
  leadActivities,
  emailCampaigns,
  type User, 
  type InsertUser,
  type AffiliateNetwork,
  type InsertAffiliateNetwork,
  type AffiliateOffer,
  type InsertAffiliateOffer,
  type AffiliateClick,
  type InsertAffiliateClick,
  type PageAffiliateAssignment,
  type InsertPageAffiliateAssignment,
  type UserSession,
  type InsertUserSession,
  type BehaviorEvent,
  type InsertBehaviorEvent,
  type QuizResult,
  type InsertQuizResult,
  type Experiment,
  type InsertExperiment,
  type ExperimentVariant,
  type InsertExperimentVariant,
  type UserExperimentAssignment,
  type InsertUserExperimentAssignment,
  type ExperimentEvent,
  type InsertExperimentEvent,
  type ExperimentResult,
  type InsertExperimentResult,
  type LeadMagnet,
  type InsertLeadMagnet,
  type LeadForm,
  type InsertLeadForm,
  type LeadCapture,
  type InsertLeadCapture,
  type LeadFormAssignment,
  type InsertLeadFormAssignment,
  type LeadExperiment,
  type InsertLeadExperiment,
  type LeadActivity,
  type InsertLeadActivity,
  type EmailCampaign,
  type InsertEmailCampaign
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Affiliate Network operations
  createAffiliateNetwork(network: InsertAffiliateNetwork): Promise<AffiliateNetwork>;
  getAffiliateNetworks(): Promise<AffiliateNetwork[]>;
  getAffiliateNetworkBySlug(slug: string): Promise<AffiliateNetwork | undefined>;
  updateAffiliateNetwork(id: number, network: Partial<InsertAffiliateNetwork>): Promise<AffiliateNetwork>;
  
  // Affiliate Offer operations
  createAffiliateOffer(offer: InsertAffiliateOffer): Promise<AffiliateOffer>;
  getAffiliateOffers(): Promise<AffiliateOffer[]>;
  getAffiliateOfferBySlug(slug: string): Promise<AffiliateOffer | undefined>;
  getAffiliateOffersByEmotion(emotion: string): Promise<AffiliateOffer[]>;
  getAffiliateOffersByCategory(category: string): Promise<AffiliateOffer[]>;
  updateAffiliateOffer(id: number, offer: Partial<InsertAffiliateOffer>): Promise<AffiliateOffer>;
  
  // Affiliate Click operations
  trackAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick>;
  getAffiliateClickStats(): Promise<any>;
  getAffiliateClicksByOffer(offerId: number): Promise<AffiliateClick[]>;
  getAffiliateClicksByDateRange(startDate: Date, endDate: Date): Promise<AffiliateClick[]>;
  
  // Page Affiliate Assignment operations
  createPageAffiliateAssignment(assignment: InsertPageAffiliateAssignment): Promise<PageAffiliateAssignment>;
  getPageAffiliateAssignments(pageSlug: string): Promise<PageAffiliateAssignment[]>;
  deletePageAffiliateAssignment(id: number): Promise<void>;
  
  // A/B Testing & Experiment operations
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  getExperiments(): Promise<Experiment[]>;
  getExperimentBySlug(slug: string): Promise<Experiment | undefined>;
  getActiveExperiments(): Promise<Experiment[]>;
  updateExperiment(id: number, experiment: Partial<InsertExperiment>): Promise<Experiment>;
  
  // Experiment Variant operations
  createExperimentVariant(variant: InsertExperimentVariant): Promise<ExperimentVariant>;
  getExperimentVariants(experimentId: number): Promise<ExperimentVariant[]>;
  getVariantById(id: number): Promise<ExperimentVariant | undefined>;
  updateExperimentVariant(id: number, variant: Partial<InsertExperimentVariant>): Promise<ExperimentVariant>;
  
  // User Experiment Assignment operations
  assignUserToExperiment(assignment: InsertUserExperimentAssignment): Promise<UserExperimentAssignment>;
  getUserExperimentAssignment(sessionId: string, experimentId: number): Promise<UserExperimentAssignment | undefined>;
  getUserExperimentAssignments(sessionId: string): Promise<UserExperimentAssignment[]>;
  
  // Experiment Event tracking
  trackExperimentEvent(event: InsertExperimentEvent): Promise<ExperimentEvent>;
  getExperimentEvents(experimentId: number, startDate?: Date, endDate?: Date): Promise<ExperimentEvent[]>;
  
  // Experiment Results and Analytics
  getExperimentResults(experimentId: number): Promise<ExperimentResult[]>;
  updateExperimentResults(result: InsertExperimentResult): Promise<ExperimentResult>;
  getExperimentAnalytics(experimentId: number): Promise<any>;
  
  // Lead Magnet operations
  createLeadMagnet(leadMagnet: InsertLeadMagnet): Promise<LeadMagnet>;
  getLeadMagnets(): Promise<LeadMagnet[]>;
  getLeadMagnetBySlug(slug: string): Promise<LeadMagnet | undefined>;
  updateLeadMagnet(id: number, leadMagnet: Partial<InsertLeadMagnet>): Promise<LeadMagnet>;
  deleteLeadMagnet(id: number): Promise<void>;
  
  // Lead Form operations
  createLeadForm(leadForm: InsertLeadForm): Promise<LeadForm>;
  getLeadForms(): Promise<LeadForm[]>;
  getLeadFormBySlug(slug: string): Promise<LeadForm | undefined>;
  getLeadFormsByPage(pageSlug: string): Promise<LeadForm[]>;
  updateLeadForm(id: number, leadForm: Partial<InsertLeadForm>): Promise<LeadForm>;
  deleteLeadForm(id: number): Promise<void>;
  
  // Lead Capture operations
  captureLeadForm(leadCapture: InsertLeadCapture): Promise<LeadCapture>;
  getLeadCaptures(startDate?: Date, endDate?: Date): Promise<LeadCapture[]>;
  getLeadCapturesByForm(leadFormId: number): Promise<LeadCapture[]>;
  getLeadCapturesByEmail(email: string): Promise<LeadCapture[]>;
  updateLeadCapture(id: number, leadCapture: Partial<InsertLeadCapture>): Promise<LeadCapture>;
  markLeadAsDelivered(id: number): Promise<void>;
  markLeadAsUnsubscribed(id: number): Promise<void>;
  
  // Lead Form Assignment operations
  createLeadFormAssignment(assignment: InsertLeadFormAssignment): Promise<LeadFormAssignment>;
  getLeadFormAssignments(pageSlug?: string): Promise<LeadFormAssignment[]>;
  deleteLeadFormAssignment(id: number): Promise<void>;
  
  // Lead Activity tracking
  trackLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity>;
  getLeadActivities(leadCaptureId: number): Promise<LeadActivity[]>;
  
  // Email Campaign operations
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  getEmailCampaignBySlug(slug: string): Promise<EmailCampaign | undefined>;
  updateEmailCampaign(id: number, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign>;
  
  // Lead Analytics
  getLeadAnalytics(startDate?: Date, endDate?: Date): Promise<any>;
  getLeadConversionRates(): Promise<any>;
  getLeadFormPerformance(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Affiliate Network operations
  async createAffiliateNetwork(network: InsertAffiliateNetwork): Promise<AffiliateNetwork> {
    const [newNetwork] = await db.insert(affiliateNetworks).values(network).returning();
    return newNetwork;
  }

  async getAffiliateNetworks(): Promise<AffiliateNetwork[]> {
    return await db.select().from(affiliateNetworks).where(eq(affiliateNetworks.isActive, true));
  }

  async getAffiliateNetworkBySlug(slug: string): Promise<AffiliateNetwork | undefined> {
    const [network] = await db.select().from(affiliateNetworks).where(eq(affiliateNetworks.slug, slug));
    return network;
  }

  async updateAffiliateNetwork(id: number, network: Partial<InsertAffiliateNetwork>): Promise<AffiliateNetwork> {
    const [updatedNetwork] = await db
      .update(affiliateNetworks)
      .set({ ...network, updatedAt: new Date() })
      .where(eq(affiliateNetworks.id, id))
      .returning();
    return updatedNetwork;
  }

  // Affiliate Offer operations
  async createAffiliateOffer(offer: InsertAffiliateOffer): Promise<AffiliateOffer> {
    const [newOffer] = await db.insert(affiliateOffers).values(offer).returning();
    return newOffer;
  }

  async getAffiliateOffers(): Promise<AffiliateOffer[]> {
    return await db.select().from(affiliateOffers).where(eq(affiliateOffers.isActive, true));
  }

  async getAffiliateOfferBySlug(slug: string): Promise<AffiliateOffer | undefined> {
    const [offer] = await db.select().from(affiliateOffers).where(eq(affiliateOffers.slug, slug));
    return offer;
  }

  async getAffiliateOffersByEmotion(emotion: string): Promise<AffiliateOffer[]> {
    return await db.select().from(affiliateOffers).where(
      and(eq(affiliateOffers.emotion, emotion), eq(affiliateOffers.isActive, true))
    );
  }

  async getAffiliateOffersByCategory(category: string): Promise<AffiliateOffer[]> {
    return await db.select().from(affiliateOffers).where(
      and(eq(affiliateOffers.category, category), eq(affiliateOffers.isActive, true))
    );
  }

  async updateAffiliateOffer(id: number, offer: Partial<InsertAffiliateOffer>): Promise<AffiliateOffer> {
    const [updatedOffer] = await db
      .update(affiliateOffers)
      .set({ ...offer, updatedAt: new Date() })
      .where(eq(affiliateOffers.id, id))
      .returning();
    return updatedOffer;
  }

  // Affiliate Click operations
  async trackAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick> {
    const [newClick] = await db.insert(affiliateClicks).values(click).returning();
    return newClick;
  }

  async getAffiliateClickStats(): Promise<any> {
    // This will return aggregated stats for the admin dashboard
    const stats = await db
      .select({
        offerId: affiliateClicks.offerId,
        clickCount: count(),
        lastClick: sql<Date>`MAX(${affiliateClicks.clickedAt})`
      })
      .from(affiliateClicks)
      .groupBy(affiliateClicks.offerId);
    
    return stats;
  }

  async getAffiliateClicksByOffer(offerId: number): Promise<AffiliateClick[]> {
    return await db.select().from(affiliateClicks)
      .where(eq(affiliateClicks.offerId, offerId))
      .orderBy(desc(affiliateClicks.clickedAt));
  }

  async getAffiliateClicksByDateRange(startDate: Date, endDate: Date): Promise<AffiliateClick[]> {
    return await db.select().from(affiliateClicks)
      .where(and(
        gte(affiliateClicks.clickedAt, startDate),
        lte(affiliateClicks.clickedAt, endDate)
      ))
      .orderBy(desc(affiliateClicks.clickedAt));
  }

  // Page Affiliate Assignment operations
  async createPageAffiliateAssignment(assignment: InsertPageAffiliateAssignment): Promise<PageAffiliateAssignment> {
    const [newAssignment] = await db.insert(pageAffiliateAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getPageAffiliateAssignments(pageSlug: string): Promise<PageAffiliateAssignment[]> {
    return await db.select().from(pageAffiliateAssignments)
      .where(and(
        eq(pageAffiliateAssignments.pageSlug, pageSlug),
        eq(pageAffiliateAssignments.isActive, true)
      ));
  }

  async deletePageAffiliateAssignment(id: number): Promise<void> {
    await db.delete(pageAffiliateAssignments).where(eq(pageAffiliateAssignments.id, id));
  }

  // User Session operations
  async createOrUpdateSession(sessionData: InsertUserSession): Promise<UserSession> {
    // Try to find existing session
    const [existingSession] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionId, sessionData.sessionId));

    if (existingSession) {
      // Update existing session
      const [updatedSession] = await db
        .update(userSessions)
        .set({
          ...sessionData,
          lastActivity: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userSessions.sessionId, sessionData.sessionId))
        .returning();
      return updatedSession;
    } else {
      // Create new session
      const [newSession] = await db
        .insert(userSessions)
        .values(sessionData)
        .returning();
      return newSession;
    }
  }

  async getSessionBySessionId(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionId, sessionId));
    return session;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ lastActivity: new Date(), updatedAt: new Date() })
      .where(eq(userSessions.sessionId, sessionId));
  }

  // Behavioral Tracking operations
  async trackBehaviorEvents(events: InsertBehaviorEvent[]): Promise<void> {
    if (events.length > 0) {
      await db.insert(behaviorEvents).values(events);
      
      // Update session interaction count for each event
      for (const event of events) {
        await db
          .update(userSessions)
          .set({
            interactions: sql`${userSessions.interactions} + 1`,
            lastActivity: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userSessions.sessionId, event.sessionId));
      }
    }
  }

  async getBehaviorsBySession(sessionId: string): Promise<BehaviorEvent[]> {
    return await db
      .select()
      .from(behaviorEvents)
      .where(eq(behaviorEvents.sessionId, sessionId))
      .orderBy(desc(behaviorEvents.timestamp));
  }

  // Quiz operations
  async saveQuizResult(quiz: InsertQuizResult): Promise<QuizResult> {
    const [newQuiz] = await db.insert(quizResults).values(quiz).returning();
    
    // Update session with quiz data
    await db
      .update(userSessions)
      .set({
        interactions: sql`${userSessions.interactions} + 1`,
        lastActivity: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userSessions.sessionId, quiz.sessionId));
    
    return newQuiz;
  }

  async getQuizResultsBySession(sessionId: string): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.sessionId, sessionId))
      .orderBy(desc(quizResults.timestamp));
  }

  // User Insights & Analytics operations
  async getUserInsights(): Promise<any> {
    // Get session statistics
    const sessionStats = await db
      .select({
        totalSessions: count(),
        avgTimeOnSite: sql<number>`AVG(${userSessions.totalTimeOnSite})`,
        avgPageViews: sql<number>`AVG(${userSessions.pageViews})`,
        avgInteractions: sql<number>`AVG(${userSessions.interactions})`,
      })
      .from(userSessions);

    // Get segment distribution
    const segmentDistribution = await db
      .select({
        segment: userSessions.segment,
        count: count(),
      })
      .from(userSessions)
      .groupBy(userSessions.segment);

    return {
      sessionStats: sessionStats[0],
      segmentDistribution,
    };
  }

  async getBehaviorHeatmap(timeframe: string): Promise<any> {
    const daysBack = timeframe === '30d' ? 30 : timeframe === '7d' ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get behavior events by page and type
    const heatmapData = await db
      .select({
        pageSlug: behaviorEvents.pageSlug,
        eventType: behaviorEvents.eventType,
        count: count(),
      })
      .from(behaviorEvents)
      .where(gte(behaviorEvents.timestamp, startDate))
      .groupBy(behaviorEvents.pageSlug, behaviorEvents.eventType);

    return {
      heatmapData,
      timeframe,
    };
  }

  async getConversionFlows(): Promise<any> {
    // Get user journey flows
    const flows = await db
      .select({
        sessionId: behaviorEvents.sessionId,
        eventCount: count(),
      })
      .from(behaviorEvents)
      .groupBy(behaviorEvents.sessionId)
      .limit(100);

    return {
      userFlows: flows,
    };
  }

  async getPersonalizationRecommendations(sessionId: string, pageSlug?: string): Promise<any> {
    const session = await this.getSessionBySessionId(sessionId);
    if (!session) {
      return {
        segment: 'new_visitor',
        recommendations: [],
        offers: [],
      };
    }

    // Get recommended offers based on segment
    const recommendedOffers = await db
      .select()
      .from(affiliateOffers)
      .where(eq(affiliateOffers.isActive, true))
      .limit(5);

    return {
      segment: session.segment,
      preferences: session.preferences,
      recommendedOffers,
      recommendations: {
        primaryCTA: this.getCTARecommendation(session.segment || 'new_visitor'),
        emotionTheme: this.getEmotionRecommendation(session.segment || 'new_visitor'),
        contentStyle: this.getContentStyleRecommendation(session.segment || 'new_visitor'),
      },
    };
  }

  private getCTARecommendation(segment: string): string {
    const ctaMap: Record<string, string> = {
      new_visitor: 'Get Started Free',
      returning_visitor: 'Continue Your Journey',
      engaged_user: 'Unlock Premium Features',
      high_converter: 'Get VIP Access',
      researcher: 'Get Detailed Guide',
      buyer: 'Buy Now - Best Price',
    };
    return ctaMap[segment] || 'Learn More';
  }

  private getEmotionRecommendation(segment: string): string {
    const emotionMap: Record<string, string> = {
      new_visitor: 'trust',
      returning_visitor: 'confidence',
      engaged_user: 'excitement',
      high_converter: 'confidence',
      researcher: 'trust',
      buyer: 'excitement',
    };
    return emotionMap[segment] || 'trust';
  }

  private getContentStyleRecommendation(segment: string): string {
    const styleMap: Record<string, string> = {
      new_visitor: 'educational',
      returning_visitor: 'promotional',
      engaged_user: 'social_proof',
      high_converter: 'urgent',
      researcher: 'educational',
      buyer: 'urgent',
    };
    return styleMap[segment] || 'educational';
  }

  // A/B Testing & Experiment operations
  async createExperiment(experiment: InsertExperiment): Promise<Experiment> {
    const [newExperiment] = await db.insert(experiments).values(experiment).returning();
    return newExperiment;
  }

  async getExperiments(): Promise<Experiment[]> {
    return await db.select().from(experiments).orderBy(desc(experiments.createdAt));
  }

  async getExperimentBySlug(slug: string): Promise<Experiment | undefined> {
    const [experiment] = await db.select().from(experiments).where(eq(experiments.slug, slug));
    return experiment;
  }

  async getActiveExperiments(): Promise<Experiment[]> {
    return await db
      .select()
      .from(experiments)
      .where(and(eq(experiments.isActive, true), eq(experiments.status, 'active')));
  }

  async updateExperiment(id: number, experiment: Partial<InsertExperiment>): Promise<Experiment> {
    const [updatedExperiment] = await db
      .update(experiments)
      .set({ ...experiment, updatedAt: new Date() })
      .where(eq(experiments.id, id))
      .returning();
    return updatedExperiment;
  }

  // Experiment Variant operations
  async createExperimentVariant(variant: InsertExperimentVariant): Promise<ExperimentVariant> {
    const [newVariant] = await db.insert(experimentVariants).values(variant).returning();
    return newVariant;
  }

  async getExperimentVariants(experimentId: number): Promise<ExperimentVariant[]> {
    return await db
      .select()
      .from(experimentVariants)
      .where(and(eq(experimentVariants.experimentId, experimentId), eq(experimentVariants.isActive, true)))
      .orderBy(experimentVariants.trafficPercentage);
  }

  async getVariantById(id: number): Promise<ExperimentVariant | undefined> {
    const [variant] = await db.select().from(experimentVariants).where(eq(experimentVariants.id, id));
    return variant;
  }

  async updateExperimentVariant(id: number, variant: Partial<InsertExperimentVariant>): Promise<ExperimentVariant> {
    const [updatedVariant] = await db
      .update(experimentVariants)
      .set({ ...variant, updatedAt: new Date() })
      .where(eq(experimentVariants.id, id))
      .returning();
    return updatedVariant;
  }

  // User Experiment Assignment operations
  async assignUserToExperiment(assignment: InsertUserExperimentAssignment): Promise<UserExperimentAssignment> {
    const [newAssignment] = await db.insert(userExperimentAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getUserExperimentAssignment(sessionId: string, experimentId: number): Promise<UserExperimentAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(userExperimentAssignments)
      .where(and(
        eq(userExperimentAssignments.sessionId, sessionId),
        eq(userExperimentAssignments.experimentId, experimentId),
        eq(userExperimentAssignments.isActive, true)
      ));
    return assignment;
  }

  async getUserExperimentAssignments(sessionId: string): Promise<UserExperimentAssignment[]> {
    return await db
      .select()
      .from(userExperimentAssignments)
      .where(and(eq(userExperimentAssignments.sessionId, sessionId), eq(userExperimentAssignments.isActive, true)));
  }

  // Experiment Event tracking
  async trackExperimentEvent(event: InsertExperimentEvent): Promise<ExperimentEvent> {
    const [newEvent] = await db.insert(experimentEvents).values(event).returning();
    return newEvent;
  }

  async getExperimentEvents(experimentId: number, startDate?: Date, endDate?: Date): Promise<ExperimentEvent[]> {
    let whereConditions = [eq(experimentEvents.experimentId, experimentId)];
    
    if (startDate && endDate) {
      whereConditions.push(
        gte(experimentEvents.timestamp, startDate),
        lte(experimentEvents.timestamp, endDate)
      );
    }
    
    return await db
      .select()
      .from(experimentEvents)
      .where(and(...whereConditions))
      .orderBy(desc(experimentEvents.timestamp));
  }

  // Experiment Results and Analytics
  async getExperimentResults(experimentId: number): Promise<ExperimentResult[]> {
    return await db
      .select()
      .from(experimentResults)
      .where(eq(experimentResults.experimentId, experimentId))
      .orderBy(desc(experimentResults.date));
  }

  async updateExperimentResults(result: InsertExperimentResult): Promise<ExperimentResult> {
    const [updatedResult] = await db.insert(experimentResults).values(result).returning();
    return updatedResult;
  }

  async getExperimentAnalytics(experimentId: number): Promise<any> {
    // Get experiment with variants
    const experiment = await db
      .select()
      .from(experiments)
      .where(eq(experiments.id, experimentId))
      .limit(1);

    const variants = await this.getExperimentVariants(experimentId);

    // Get event counts by variant
    const eventCounts = await db
      .select({
        variantId: experimentEvents.variantId,
        eventType: experimentEvents.eventType,
        count: count(),
      })
      .from(experimentEvents)
      .where(eq(experimentEvents.experimentId, experimentId))
      .groupBy(experimentEvents.variantId, experimentEvents.eventType);

    // Calculate metrics for each variant
    const variantMetrics = variants.map(variant => {
      const variantEvents = eventCounts.filter(ec => ec.variantId === variant.id);
      const impressions = variantEvents.find(ve => ve.eventType === 'impression')?.count || 0;
      const clicks = variantEvents.find(ve => ve.eventType === 'click')?.count || 0;
      const conversions = variantEvents.find(ve => ve.eventType === 'conversion')?.count || 0;

      const clickRate = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
      const conversionRate = impressions > 0 ? ((conversions / impressions) * 100).toFixed(2) : '0.00';

      return {
        ...variant,
        metrics: {
          impressions,
          clicks,
          conversions,
          clickRate: `${clickRate}%`,
          conversionRate: `${conversionRate}%`,
        },
      };
    });

    return {
      experiment: experiment[0],
      variants: variantMetrics,
      summary: {
        totalImpressions: variantMetrics.reduce((sum, v) => sum + v.metrics.impressions, 0),
        totalClicks: variantMetrics.reduce((sum, v) => sum + v.metrics.clicks, 0),
        totalConversions: variantMetrics.reduce((sum, v) => sum + v.metrics.conversions, 0),
        topPerformingVariant: variantMetrics.reduce((best, current) => 
          parseFloat(current.metrics.conversionRate) > parseFloat(best.metrics.conversionRate) ? current : best, 
          variantMetrics[0]
        ),
      },
    };
  }

  // Lead Magnet operations
  async createLeadMagnet(leadMagnet: InsertLeadMagnet): Promise<LeadMagnet> {
    const [newLeadMagnet] = await db.insert(leadMagnets).values(leadMagnet).returning();
    return newLeadMagnet;
  }

  async getLeadMagnets(): Promise<LeadMagnet[]> {
    return await db.select().from(leadMagnets).where(eq(leadMagnets.isActive, true));
  }

  async getLeadMagnetBySlug(slug: string): Promise<LeadMagnet | undefined> {
    const [leadMagnet] = await db.select().from(leadMagnets).where(eq(leadMagnets.slug, slug));
    return leadMagnet;
  }

  async updateLeadMagnet(id: number, leadMagnet: Partial<InsertLeadMagnet>): Promise<LeadMagnet> {
    const [updatedLeadMagnet] = await db
      .update(leadMagnets)
      .set({ ...leadMagnet, updatedAt: new Date() })
      .where(eq(leadMagnets.id, id))
      .returning();
    return updatedLeadMagnet;
  }

  async deleteLeadMagnet(id: number): Promise<void> {
    await db.update(leadMagnets).set({ isActive: false }).where(eq(leadMagnets.id, id));
  }

  // Lead Form operations
  async createLeadForm(leadForm: InsertLeadForm): Promise<LeadForm> {
    const [newLeadForm] = await db.insert(leadForms).values(leadForm).returning();
    return newLeadForm;
  }

  async getLeadForms(): Promise<LeadForm[]> {
    return await db.select().from(leadForms).where(eq(leadForms.isActive, true));
  }

  async getLeadFormBySlug(slug: string): Promise<LeadForm | undefined> {
    const [leadForm] = await db.select().from(leadForms).where(eq(leadForms.slug, slug));
    return leadForm;
  }

  async getLeadFormsByPage(pageSlug: string): Promise<LeadForm[]> {
    return await db
      .select({
        id: leadForms.id,
        slug: leadForms.slug,
        title: leadForms.title,
        description: leadForms.description,
        leadMagnetId: leadForms.leadMagnetId,
        formType: leadForms.formType,
        triggerConfig: leadForms.triggerConfig,
        formFields: leadForms.formFields,
        styling: leadForms.styling,
        emotion: leadForms.emotion,
        isActive: leadForms.isActive,
        createdAt: leadForms.createdAt,
        updatedAt: leadForms.updatedAt,
      })
      .from(leadForms)
      .leftJoin(leadFormAssignments, eq(leadForms.id, leadFormAssignments.leadFormId))
      .where(and(
        eq(leadForms.isActive, true),
        eq(leadFormAssignments.isActive, true),
        eq(leadFormAssignments.pageSlug, pageSlug)
      ));
  }

  async updateLeadForm(id: number, leadForm: Partial<InsertLeadForm>): Promise<LeadForm> {
    const [updatedLeadForm] = await db
      .update(leadForms)
      .set({ ...leadForm, updatedAt: new Date() })
      .where(eq(leadForms.id, id))
      .returning();
    return updatedLeadForm;
  }

  async deleteLeadForm(id: number): Promise<void> {
    await db.update(leadForms).set({ isActive: false }).where(eq(leadForms.id, id));
  }

  // Lead Capture operations
  async captureLeadForm(leadCapture: InsertLeadCapture): Promise<LeadCapture> {
    const [newLeadCapture] = await db.insert(leadCaptures).values(leadCapture).returning();
    
    // Track lead capture activity
    await this.trackLeadActivity({
      leadCaptureId: newLeadCapture.id,
      activityType: 'form_submitted',
      sessionId: newLeadCapture.sessionId,
      pageSlug: newLeadCapture.source,
      activityData: {
        leadFormId: newLeadCapture.leadFormId,
        leadMagnetId: newLeadCapture.leadMagnetId,
        email: newLeadCapture.email,
      },
    });
    
    return newLeadCapture;
  }

  async getLeadCaptures(startDate?: Date, endDate?: Date): Promise<LeadCapture[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(leadCaptures)
        .where(and(
          gte(leadCaptures.createdAt, startDate),
          lte(leadCaptures.createdAt, endDate)
        ))
        .orderBy(desc(leadCaptures.createdAt));
    }
    
    return await db.select().from(leadCaptures).orderBy(desc(leadCaptures.createdAt));
  }

  async getLeadCapturesByForm(leadFormId: number): Promise<LeadCapture[]> {
    return await db
      .select()
      .from(leadCaptures)
      .where(eq(leadCaptures.leadFormId, leadFormId))
      .orderBy(desc(leadCaptures.createdAt));
  }

  async getLeadCapturesByEmail(email: string): Promise<LeadCapture[]> {
    return await db
      .select()
      .from(leadCaptures)
      .where(eq(leadCaptures.email, email))
      .orderBy(desc(leadCaptures.createdAt));
  }

  async updateLeadCapture(id: number, leadCapture: Partial<InsertLeadCapture>): Promise<LeadCapture> {
    const [updatedLeadCapture] = await db
      .update(leadCaptures)
      .set({ ...leadCapture, updatedAt: new Date() })
      .where(eq(leadCaptures.id, id))
      .returning();
    return updatedLeadCapture;
  }

  async markLeadAsDelivered(id: number): Promise<void> {
    await db
      .update(leadCaptures)
      .set({ isDelivered: true, deliveredAt: new Date(), updatedAt: new Date() })
      .where(eq(leadCaptures.id, id));
  }

  async markLeadAsUnsubscribed(id: number): Promise<void> {
    await db
      .update(leadCaptures)
      .set({ unsubscribedAt: new Date(), updatedAt: new Date() })
      .where(eq(leadCaptures.id, id));
  }

  // Lead Form Assignment operations
  async createLeadFormAssignment(assignment: InsertLeadFormAssignment): Promise<LeadFormAssignment> {
    const [newAssignment] = await db.insert(leadFormAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getLeadFormAssignments(pageSlug?: string): Promise<LeadFormAssignment[]> {
    if (pageSlug) {
      return await db
        .select()
        .from(leadFormAssignments)
        .where(and(
          eq(leadFormAssignments.isActive, true),
          eq(leadFormAssignments.pageSlug, pageSlug)
        ))
        .orderBy(leadFormAssignments.priority);
    }
    
    return await db
      .select()
      .from(leadFormAssignments)
      .where(eq(leadFormAssignments.isActive, true))
      .orderBy(leadFormAssignments.priority);
  }

  async deleteLeadFormAssignment(id: number): Promise<void> {
    await db.delete(leadFormAssignments).where(eq(leadFormAssignments.id, id));
  }

  // Lead Activity tracking
  async trackLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const [newActivity] = await db.insert(leadActivities).values(activity).returning();
    return newActivity;
  }

  async getLeadActivities(leadCaptureId: number): Promise<LeadActivity[]> {
    return await db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadCaptureId, leadCaptureId))
      .orderBy(desc(leadActivities.timestamp));
  }

  // Email Campaign operations
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [newCampaign] = await db.insert(emailCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns).where(eq(emailCampaigns.isActive, true));
  }

  async getEmailCampaignBySlug(slug: string): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.slug, slug));
    return campaign;
  }

  async updateEmailCampaign(id: number, campaign: Partial<InsertEmailCampaign>): Promise<EmailCampaign> {
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set({ ...campaign, updatedAt: new Date() })
      .where(eq(emailCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  // Lead Analytics
  async getLeadAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const start = startDate || thirtyDaysAgo;
    const end = endDate || new Date();
    
    // Get lead captures in date range
    const leads = await db
      .select()
      .from(leadCaptures)
      .where(and(
        gte(leadCaptures.createdAt, start),
        lte(leadCaptures.createdAt, end)
      ));
    
    // Get form performance
    const formPerformance = await db
      .select({
        leadFormId: leadCaptures.leadFormId,
        totalCaptures: count(),
        delivered: sql<number>`COUNT(CASE WHEN ${leadCaptures.isDelivered} THEN 1 END)`,
        unsubscribed: sql<number>`COUNT(CASE WHEN ${leadCaptures.unsubscribedAt} IS NOT NULL THEN 1 END)`,
      })
      .from(leadCaptures)
      .where(and(
        gte(leadCaptures.createdAt, start),
        lte(leadCaptures.createdAt, end)
      ))
      .groupBy(leadCaptures.leadFormId);
    
    // Group by day
    const leadsByDay = leads.reduce((acc, lead) => {
      const date = lead.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const chartData = Object.entries(leadsByDay).map(([date, leadCount]) => ({
      date,
      leads: leadCount,
      delivered: leads.filter(l => l.createdAt?.toISOString().split('T')[0] === date && l.isDelivered).length,
    }));
    
    return {
      totalLeads: leads.length,
      deliveredLeads: leads.filter(l => l.isDelivered).length,
      unsubscribedLeads: leads.filter(l => l.unsubscribedAt).length,
      deliveryRate: leads.length > 0 ? (leads.filter(l => l.isDelivered).length / leads.length * 100).toFixed(2) : '0',
      chartData: chartData.sort((a, b) => a.date.localeCompare(b.date)),
      formPerformance,
    };
  }

  async getLeadConversionRates(): Promise<any> {
    // Get conversion rates by form
    const formConversions = await db
      .select({
        leadFormId: leadCaptures.leadFormId,
        totalSubmissions: count(),
        deliveredCount: sql<number>`COUNT(CASE WHEN ${leadCaptures.isDelivered} THEN 1 END)`,
      })
      .from(leadCaptures)
      .groupBy(leadCaptures.leadFormId);
    
    return formConversions.map(conversion => ({
      ...conversion,
      deliveryRate: conversion.totalSubmissions > 0 ? 
        (conversion.deliveredCount / conversion.totalSubmissions * 100).toFixed(2) : '0',
    }));
  }

  async getLeadFormPerformance(): Promise<any> {
    // Get detailed form performance metrics
    const formStats = await db
      .select({
        leadFormId: leadCaptures.leadFormId,
        totalCaptures: count(),
        uniqueEmails: sql<number>`COUNT(DISTINCT ${leadCaptures.email})`,
        delivered: sql<number>`COUNT(CASE WHEN ${leadCaptures.isDelivered} THEN 1 END)`,
        unsubscribed: sql<number>`COUNT(CASE WHEN ${leadCaptures.unsubscribedAt} IS NOT NULL THEN 1 END)`,
        avgTimeToDelivery: sql<number>`AVG(EXTRACT(EPOCH FROM (${leadCaptures.deliveredAt} - ${leadCaptures.createdAt})))`,
      })
      .from(leadCaptures)
      .groupBy(leadCaptures.leadFormId);
    
    return formStats.map(stat => ({
      ...stat,
      deliveryRate: stat.totalCaptures > 0 ? (stat.delivered / stat.totalCaptures * 100).toFixed(2) : '0',
      unsubscribeRate: stat.totalCaptures > 0 ? (stat.unsubscribed / stat.totalCaptures * 100).toFixed(2) : '0',
      avgTimeToDeliveryHours: stat.avgTimeToDelivery ? (stat.avgTimeToDelivery / 3600).toFixed(2) : '0',
    }));
  }
}

export const storage = new DatabaseStorage();
