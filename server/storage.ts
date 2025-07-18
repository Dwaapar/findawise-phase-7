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
  globalUserProfiles,
  deviceFingerprints,
  userProfileMergeHistory,
  analyticsEvents,
  sessionBridge,
  analyticsSyncStatus,
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
  type InsertEmailCampaign,
  type GlobalUserProfile,
  type InsertGlobalUserProfile,
  type DeviceFingerprint,
  type InsertDeviceFingerprint,
  type UserProfileMergeHistory,
  type InsertUserProfileMergeHistory,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type SessionBridge,
  type InsertSessionBridge,
  type AnalyticsSyncStatus,
  type InsertAnalyticsSyncStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

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

  // ===========================================
  // CROSS-DEVICE USER PROFILES & ANALYTICS SYNC
  // ===========================================

  // Global User Profile operations
  createGlobalUserProfile(profile: InsertGlobalUserProfile): Promise<GlobalUserProfile>;
  getGlobalUserProfile(id: number): Promise<GlobalUserProfile | undefined>;
  getGlobalUserProfileByUUID(uuid: string): Promise<GlobalUserProfile | undefined>;
  getGlobalUserProfileByEmail(email: string): Promise<GlobalUserProfile | undefined>;
  getGlobalUserProfileByPhone(phone: string): Promise<GlobalUserProfile | undefined>;
  updateGlobalUserProfile(id: number, profile: Partial<InsertGlobalUserProfile>): Promise<GlobalUserProfile>;
  getAllGlobalUserProfiles(limit?: number, offset?: number): Promise<GlobalUserProfile[]>;
  searchGlobalUserProfiles(query: string): Promise<GlobalUserProfile[]>;
  
  // Device Fingerprint operations
  createDeviceFingerprint(fingerprint: InsertDeviceFingerprint): Promise<DeviceFingerprint>;
  getDeviceFingerprint(fingerprint: string): Promise<DeviceFingerprint | undefined>;
  getDeviceFingerprintsByUser(globalUserId: number): Promise<DeviceFingerprint[]>;
  updateDeviceFingerprint(id: number, fingerprint: Partial<InsertDeviceFingerprint>): Promise<DeviceFingerprint>;
  
  // User Profile Merge operations
  mergeUserProfiles(masterProfileId: number, mergedProfileId: number, reason: string, confidence: number): Promise<void>;
  getUserProfileMergeHistory(masterProfileId: number): Promise<UserProfileMergeHistory[]>;
  
  // Analytics Events operations
  trackAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  trackAnalyticsEventBatch(events: InsertAnalyticsEvent[]): Promise<AnalyticsEvent[]>;
  getAnalyticsEvents(filters?: {
    sessionId?: string;
    globalUserId?: number;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AnalyticsEvent[]>;
  getAnalyticsEventsByUser(globalUserId: number, limit?: number): Promise<AnalyticsEvent[]>;
  getAnalyticsEventsBySession(sessionId: string): Promise<AnalyticsEvent[]>;
  processAnalyticsEvents(batchId: string): Promise<void>;
  
  // Session Bridge operations
  createSessionBridge(bridge: InsertSessionBridge): Promise<SessionBridge>;
  getSessionBridge(sessionId: string): Promise<SessionBridge | undefined>;
  updateSessionBridge(id: number, bridge: Partial<InsertSessionBridge>): Promise<SessionBridge>;
  linkSessionToGlobalUser(sessionId: string, globalUserId: number, method: string, confidence: number): Promise<void>;
  
  // Analytics Sync Status operations
  createAnalyticsSyncStatus(status: InsertAnalyticsSyncStatus): Promise<AnalyticsSyncStatus>;
  getAnalyticsSyncStatus(sessionId: string): Promise<AnalyticsSyncStatus | undefined>;
  updateAnalyticsSyncStatus(id: number, status: Partial<InsertAnalyticsSyncStatus>): Promise<AnalyticsSyncStatus>;
  
  // Cross-device User Recognition
  findUserByFingerprint(fingerprint: string): Promise<GlobalUserProfile | undefined>;
  findUserByEmail(email: string, createIfNotExists?: boolean): Promise<GlobalUserProfile>;
  findUserByPhone(phone: string, createIfNotExists?: boolean): Promise<GlobalUserProfile>;
  identifyUser(sessionId: string, identifiers: {
    email?: string;
    phone?: string;
    fingerprint?: string;
    deviceInfo?: any;
  }): Promise<GlobalUserProfile>;
  
  // Analytics Dashboard Data
  getComprehensiveAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    globalUserId?: number;
    deviceType?: string;
    eventType?: string;
  }): Promise<any>;
  getUserJourney(globalUserId: number): Promise<any>;
  getCrossDeviceStats(): Promise<any>;
  getEngagementMetrics(globalUserId?: number): Promise<any>;
  getConversionFunnelData(funnelType?: string): Promise<any>;
  
  // Export/Import functionality
  exportUserData(globalUserId: number): Promise<any>;
  exportAnalyticsData(filters?: any): Promise<any>;
  importAnalyticsData(data: any): Promise<void>;
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

  // ===========================================
  // CROSS-DEVICE USER PROFILES & ANALYTICS SYNC
  // ===========================================

  // Global User Profile operations
  async createGlobalUserProfile(profile: InsertGlobalUserProfile): Promise<GlobalUserProfile> {
    const [newProfile] = await db.insert(globalUserProfiles).values(profile).returning();
    return newProfile;
  }

  async getGlobalUserProfile(id: number): Promise<GlobalUserProfile | undefined> {
    const [profile] = await db.select().from(globalUserProfiles).where(eq(globalUserProfiles.id, id));
    return profile;
  }

  async getGlobalUserProfileByUUID(uuid: string): Promise<GlobalUserProfile | undefined> {
    const [profile] = await db.select().from(globalUserProfiles).where(eq(globalUserProfiles.uuid, uuid));
    return profile;
  }

  async getGlobalUserProfileByEmail(email: string): Promise<GlobalUserProfile | undefined> {
    const [profile] = await db.select().from(globalUserProfiles).where(eq(globalUserProfiles.email, email));
    return profile;
  }

  async getGlobalUserProfileByPhone(phone: string): Promise<GlobalUserProfile | undefined> {
    const [profile] = await db.select().from(globalUserProfiles).where(eq(globalUserProfiles.phone, phone));
    return profile;
  }

  async updateGlobalUserProfile(id: number, profile: Partial<InsertGlobalUserProfile>): Promise<GlobalUserProfile> {
    const [updatedProfile] = await db
      .update(globalUserProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(globalUserProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getAllGlobalUserProfiles(limit: number = 100, offset: number = 0): Promise<GlobalUserProfile[]> {
    return await db.select().from(globalUserProfiles)
      .where(eq(globalUserProfiles.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(globalUserProfiles.createdAt));
  }

  async searchGlobalUserProfiles(query: string): Promise<GlobalUserProfile[]> {
    return await db.select().from(globalUserProfiles)
      .where(and(
        eq(globalUserProfiles.isActive, true),
        sql`(
          ${globalUserProfiles.email} ILIKE ${`%${query}%`} OR
          ${globalUserProfiles.firstName} ILIKE ${`%${query}%`} OR
          ${globalUserProfiles.lastName} ILIKE ${`%${query}%`} OR
          ${globalUserProfiles.phone} ILIKE ${`%${query}%`}
        )`
      ))
      .limit(50);
  }

  // Device Fingerprint operations
  async createDeviceFingerprint(fingerprint: InsertDeviceFingerprint): Promise<DeviceFingerprint> {
    const [newFingerprint] = await db.insert(deviceFingerprints).values(fingerprint).returning();
    return newFingerprint;
  }

  async getDeviceFingerprint(fingerprint: string): Promise<DeviceFingerprint | undefined> {
    const [device] = await db.select().from(deviceFingerprints).where(eq(deviceFingerprints.fingerprint, fingerprint));
    return device;
  }

  async getDeviceFingerprintsByUser(globalUserId: number): Promise<DeviceFingerprint[]> {
    return await db.select().from(deviceFingerprints)
      .where(and(
        eq(deviceFingerprints.globalUserId, globalUserId),
        eq(deviceFingerprints.isActive, true)
      ))
      .orderBy(desc(deviceFingerprints.lastSeen));
  }

  async updateDeviceFingerprint(id: number, fingerprint: Partial<InsertDeviceFingerprint>): Promise<DeviceFingerprint> {
    const [updatedFingerprint] = await db
      .update(deviceFingerprints)
      .set({ ...fingerprint, updatedAt: new Date() })
      .where(eq(deviceFingerprints.id, id))
      .returning();
    return updatedFingerprint;
  }

  // User Profile Merge operations
  async mergeUserProfiles(masterProfileId: number, mergedProfileId: number, reason: string, confidence: number): Promise<void> {
    // Get the profiles to merge
    const masterProfile = await this.getGlobalUserProfile(masterProfileId);
    const mergedProfile = await this.getGlobalUserProfile(mergedProfileId);
    
    if (!masterProfile || !mergedProfile) {
      throw new Error('Profile not found for merging');
    }

    // Merge the data
    const mergedData = {
      totalSessions: (masterProfile.totalSessions || 0) + (mergedProfile.totalSessions || 0),
      totalPageViews: (masterProfile.totalPageViews || 0) + (mergedProfile.totalPageViews || 0),
      totalInteractions: (masterProfile.totalInteractions || 0) + (mergedProfile.totalInteractions || 0),
      totalTimeOnSite: (masterProfile.totalTimeOnSite || 0) + (mergedProfile.totalTimeOnSite || 0),
      conversionCount: (masterProfile.conversionCount || 0) + (mergedProfile.conversionCount || 0),
      lifetimeValue: (masterProfile.lifetimeValue || 0) + (mergedProfile.lifetimeValue || 0),
      firstVisit: masterProfile.firstVisit && mergedProfile.firstVisit ? 
        (masterProfile.firstVisit < mergedProfile.firstVisit ? masterProfile.firstVisit : mergedProfile.firstVisit) : 
        (masterProfile.firstVisit || mergedProfile.firstVisit),
      lastVisit: masterProfile.lastVisit && mergedProfile.lastVisit ? 
        (masterProfile.lastVisit > mergedProfile.lastVisit ? masterProfile.lastVisit : mergedProfile.lastVisit) : 
        (masterProfile.lastVisit || mergedProfile.lastVisit),
      mergedFromSessions: [
        ...(masterProfile.mergedFromSessions as string[] || []),
        ...(mergedProfile.mergedFromSessions as string[] || [])
      ]
    };

    // Update master profile
    await this.updateGlobalUserProfile(masterProfileId, mergedData);

    // Update session bridges to point to master profile
    await db
      .update(sessionBridge)
      .set({ globalUserId: masterProfileId })
      .where(eq(sessionBridge.globalUserId, mergedProfileId));

    // Update device fingerprints to point to master profile
    await db
      .update(deviceFingerprints)
      .set({ globalUserId: masterProfileId, updatedAt: new Date() })
      .where(eq(deviceFingerprints.globalUserId, mergedProfileId));

    // Update analytics events to point to master profile
    await db
      .update(analyticsEvents)
      .set({ globalUserId: masterProfileId })
      .where(eq(analyticsEvents.globalUserId, mergedProfileId));

    // Record the merge history
    await db.insert(userProfileMergeHistory).values({
      masterProfileId,
      mergedProfileId,
      mergeReason: reason,
      mergeConfidence: confidence,
      mergeData: { masterProfile, mergedProfile },
      mergedBy: 'system'
    });

    // Delete the merged profile
    await db.delete(globalUserProfiles).where(eq(globalUserProfiles.id, mergedProfileId));
  }

  async getUserProfileMergeHistory(masterProfileId: number): Promise<UserProfileMergeHistory[]> {
    return await db.select().from(userProfileMergeHistory)
      .where(eq(userProfileMergeHistory.masterProfileId, masterProfileId))
      .orderBy(desc(userProfileMergeHistory.mergedAt));
  }

  // Analytics Events operations
  async trackAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [newEvent] = await db.insert(analyticsEvents).values(event).returning();
    return newEvent;
  }

  async trackAnalyticsEventBatch(events: InsertAnalyticsEvent[]): Promise<AnalyticsEvent[]> {
    if (events.length === 0) return [];
    return await db.insert(analyticsEvents).values(events).returning();
  }

  async getAnalyticsEvents(filters: {
    sessionId?: string;
    globalUserId?: number;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<AnalyticsEvent[]> {
    const { sessionId, globalUserId, eventType, startDate, endDate, limit = 100, offset = 0 } = filters;
    
    let whereConditions = [];
    if (sessionId) whereConditions.push(eq(analyticsEvents.sessionId, sessionId));
    if (globalUserId) whereConditions.push(eq(analyticsEvents.globalUserId, globalUserId));
    if (eventType) whereConditions.push(eq(analyticsEvents.eventType, eventType));
    if (startDate && endDate) {
      whereConditions.push(
        gte(analyticsEvents.serverTimestamp, startDate),
        lte(analyticsEvents.serverTimestamp, endDate)
      );
    }

    return await db.select().from(analyticsEvents)
      .where(whereConditions.length > 0 ? and(...whereConditions) : sql`true`)
      .orderBy(desc(analyticsEvents.serverTimestamp))
      .limit(limit)
      .offset(offset);
  }

  async getAnalyticsEventsByUser(globalUserId: number, limit: number = 100): Promise<AnalyticsEvent[]> {
    return await db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.globalUserId, globalUserId))
      .orderBy(desc(analyticsEvents.serverTimestamp))
      .limit(limit);
  }

  async getAnalyticsEventsBySession(sessionId: string): Promise<AnalyticsEvent[]> {
    return await db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.sessionId, sessionId))
      .orderBy(desc(analyticsEvents.serverTimestamp));
  }

  async processAnalyticsEvents(batchId: string): Promise<void> {
    await db
      .update(analyticsEvents)
      .set({ isProcessed: true })
      .where(eq(analyticsEvents.batchId, batchId));
  }

  // Session Bridge operations
  async createSessionBridge(bridge: InsertSessionBridge): Promise<SessionBridge> {
    const [newBridge] = await db.insert(sessionBridge).values(bridge).returning();
    return newBridge;
  }

  async getSessionBridge(sessionId: string): Promise<SessionBridge | undefined> {
    const [bridge] = await db.select().from(sessionBridge).where(eq(sessionBridge.sessionId, sessionId));
    return bridge;
  }

  async updateSessionBridge(id: number, bridge: Partial<InsertSessionBridge>): Promise<SessionBridge> {
    const [updatedBridge] = await db
      .update(sessionBridge)
      .set(bridge)
      .where(eq(sessionBridge.id, id))
      .returning();
    return updatedBridge;
  }

  async linkSessionToGlobalUser(sessionId: string, globalUserId: number, method: string, confidence: number): Promise<void> {
    const existingBridge = await this.getSessionBridge(sessionId);
    
    if (existingBridge) {
      await this.updateSessionBridge(existingBridge.id, {
        globalUserId,
        linkMethod: method,
        linkConfidence: confidence
      });
    } else {
      await this.createSessionBridge({
        sessionId,
        globalUserId,
        linkMethod: method,
        linkConfidence: confidence
      });
    }
  }

  // Analytics Sync Status operations
  async createAnalyticsSyncStatus(status: InsertAnalyticsSyncStatus): Promise<AnalyticsSyncStatus> {
    const [newStatus] = await db.insert(analyticsSyncStatus).values(status).returning();
    return newStatus;
  }

  async getAnalyticsSyncStatus(sessionId: string): Promise<AnalyticsSyncStatus | undefined> {
    const [status] = await db.select().from(analyticsSyncStatus).where(eq(analyticsSyncStatus.sessionId, sessionId));
    return status;
  }

  async updateAnalyticsSyncStatus(id: number, status: Partial<InsertAnalyticsSyncStatus>): Promise<AnalyticsSyncStatus> {
    const [updatedStatus] = await db
      .update(analyticsSyncStatus)
      .set({ ...status, updatedAt: new Date() })
      .where(eq(analyticsSyncStatus.id, id))
      .returning();
    return updatedStatus;
  }

  // Cross-device User Recognition
  async findUserByFingerprint(fingerprint: string): Promise<GlobalUserProfile | undefined> {
    const deviceFingerprint = await this.getDeviceFingerprint(fingerprint);
    if (!deviceFingerprint?.globalUserId) return undefined;
    
    return await this.getGlobalUserProfile(deviceFingerprint.globalUserId);
  }

  async findUserByEmail(email: string, createIfNotExists: boolean = false): Promise<GlobalUserProfile> {
    let profile = await this.getGlobalUserProfileByEmail(email);
    
    if (!profile && createIfNotExists) {
      profile = await this.createGlobalUserProfile({
        uuid: randomUUID(),
        email,
        firstVisit: new Date(),
        lastVisit: new Date()
      });
    }
    
    if (!profile) {
      throw new Error('User not found');
    }
    
    return profile;
  }

  async findUserByPhone(phone: string, createIfNotExists: boolean = false): Promise<GlobalUserProfile> {
    let profile = await this.getGlobalUserProfileByPhone(phone);
    
    if (!profile && createIfNotExists) {
      profile = await this.createGlobalUserProfile({
        uuid: randomUUID(),
        phone,
        firstVisit: new Date(),
        lastVisit: new Date()
      });
    }
    
    if (!profile) {
      throw new Error('User not found');
    }
    
    return profile;
  }

  async identifyUser(sessionId: string, identifiers: {
    email?: string;
    phone?: string;
    fingerprint?: string;
    deviceInfo?: any;
  }): Promise<GlobalUserProfile> {
    const { email, phone, fingerprint, deviceInfo } = identifiers;
    
    // Try to find existing user by email first (highest confidence)
    if (email) {
      const userByEmail = await this.getGlobalUserProfileByEmail(email);
      if (userByEmail) {
        await this.linkSessionToGlobalUser(sessionId, userByEmail.id, 'email', 95);
        return userByEmail;
      }
    }

    // Try to find existing user by phone (high confidence)
    if (phone) {
      const userByPhone = await this.getGlobalUserProfileByPhone(phone);
      if (userByPhone) {
        await this.linkSessionToGlobalUser(sessionId, userByPhone.id, 'phone', 90);
        return userByPhone;
      }
    }

    // Try to find existing user by fingerprint (medium confidence)
    if (fingerprint) {
      const userByFingerprint = await this.findUserByFingerprint(fingerprint);
      if (userByFingerprint) {
        await this.linkSessionToGlobalUser(sessionId, userByFingerprint.id, 'fingerprint', 70);
        return userByFingerprint;
      }
    }

    // Create new user if not found
    const newUser = await this.createGlobalUserProfile({
      uuid: randomUUID(),
      email,
      phone,
      firstVisit: new Date(),
      lastVisit: new Date(),
      totalSessions: 1
    });

    // Link session to new user
    await this.linkSessionToGlobalUser(sessionId, newUser.id, 'created', 100);

    // Create device fingerprint if provided
    if (fingerprint && deviceInfo) {
      await this.createDeviceFingerprint({
        fingerprint,
        globalUserId: newUser.id,
        deviceInfo,
        browserInfo: deviceInfo.browserInfo || {},
        confidenceScore: 80
      });
    }

    return newUser;
  }

  // Analytics Dashboard Data
  async getComprehensiveAnalytics(filters: {
    startDate?: Date;
    endDate?: Date;
    globalUserId?: number;
    deviceType?: string;
    eventType?: string;
  } = {}): Promise<any> {
    const { startDate, endDate, globalUserId, deviceType, eventType } = filters;
    
    // Get basic metrics
    const totalUsers = await db.select({ count: count() }).from(globalUserProfiles);
    const totalSessions = await db.select({ count: count() }).from(sessionBridge);
    const totalEvents = await db.select({ count: count() }).from(analyticsEvents);
    
    // Get events with filters
    const events = await this.getAnalyticsEvents({
      globalUserId,
      eventType,
      startDate,
      endDate,
      limit: 10000
    });

    // Process events for charts
    const eventsByDay = events.reduce((acc, event) => {
      const date = event.serverTimestamp?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByType = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByDevice = events.reduce((acc, event) => {
      const device = event.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalUsers: totalUsers[0].count,
        totalSessions: totalSessions[0].count,
        totalEvents: totalEvents[0].count,
        avgEventsPerUser: totalUsers[0].count > 0 ? (totalEvents[0].count / totalUsers[0].count).toFixed(2) : '0'
      },
      charts: {
        eventsByDay: Object.entries(eventsByDay).map(([date, count]) => ({ date, count })),
        eventsByType: Object.entries(eventsByType).map(([type, count]) => ({ type, count })),
        eventsByDevice: Object.entries(eventsByDevice).map(([device, count]) => ({ device, count }))
      },
      filters: { startDate, endDate, globalUserId, deviceType, eventType }
    };
  }

  async getUserJourney(globalUserId: number): Promise<any> {
    const events = await this.getAnalyticsEventsByUser(globalUserId, 1000);
    const user = await this.getGlobalUserProfile(globalUserId);
    const devices = await this.getDeviceFingerprintsByUser(globalUserId);
    
    const journeySteps = events.map(event => ({
      timestamp: event.serverTimestamp,
      eventType: event.eventType,
      pageSlug: event.pageSlug,
      eventAction: event.eventAction,
      deviceType: event.deviceType,
      sessionId: event.sessionId
    }));

    return {
      user,
      devices,
      journeySteps: journeySteps.slice(0, 100), // Latest 100 steps
      summary: {
        totalEvents: events.length,
        deviceCount: devices.length,
        sessionCount: new Set(events.map(e => e.sessionId)).size,
        firstEvent: events[events.length - 1]?.serverTimestamp,
        lastEvent: events[0]?.serverTimestamp
      }
    };
  }

  async getCrossDeviceStats(): Promise<any> {
    const usersWithMultipleDevices = await db
      .select({
        globalUserId: deviceFingerprints.globalUserId,
        deviceCount: count()
      })
      .from(deviceFingerprints)
      .where(eq(deviceFingerprints.isActive, true))
      .groupBy(deviceFingerprints.globalUserId)
      .having(sql`COUNT(*) > 1`);

    const totalUsers = await db.select({ count: count() }).from(globalUserProfiles);
    const totalDevices = await db.select({ count: count() }).from(deviceFingerprints);

    return {
      totalUsers: totalUsers[0].count,
      totalDevices: totalDevices[0].count,
      usersWithMultipleDevices: usersWithMultipleDevices.length,
      crossDeviceRate: totalUsers[0].count > 0 ? 
        (usersWithMultipleDevices.length / totalUsers[0].count * 100).toFixed(2) : '0',
      avgDevicesPerUser: totalUsers[0].count > 0 ? 
        (totalDevices[0].count / totalUsers[0].count).toFixed(2) : '0'
    };
  }

  async getEngagementMetrics(globalUserId?: number): Promise<any> {
    let whereCondition = globalUserId ? eq(analyticsEvents.globalUserId, globalUserId) : sql`true`;
    
    const engagementData = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
        avgProcessingDelay: sql<number>`AVG(${analyticsEvents.processingDelay})`
      })
      .from(analyticsEvents)
      .where(whereCondition)
      .groupBy(analyticsEvents.eventType);

    const sessionEngagement = await db
      .select({
        sessionId: analyticsEvents.sessionId,
        eventCount: count(),
        sessionDuration: sql<number>`MAX(${analyticsEvents.serverTimestamp}) - MIN(${analyticsEvents.serverTimestamp})`
      })
      .from(analyticsEvents)
      .where(whereCondition)
      .groupBy(analyticsEvents.sessionId);

    return {
      eventTypes: engagementData,
      avgEventsPerSession: sessionEngagement.length > 0 ? 
        (sessionEngagement.reduce((sum, s) => sum + s.eventCount, 0) / sessionEngagement.length).toFixed(2) : '0',
      avgSessionDuration: sessionEngagement.length > 0 ? 
        (sessionEngagement.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / sessionEngagement.length / 1000).toFixed(2) : '0'
    };
  }

  async getConversionFunnelData(funnelType: string = 'default'): Promise<any> {
    // Define funnel steps based on event types
    const funnelSteps = [
      { name: 'Page View', eventType: 'page_view' },
      { name: 'Interaction', eventType: 'interaction' },
      { name: 'Lead Capture', eventType: 'lead_capture' },
      { name: 'Conversion', eventType: 'conversion' }
    ];

    const funnelData = await Promise.all(
      funnelSteps.map(async (step) => {
        const stepCount = await db
          .select({ count: count() })
          .from(analyticsEvents)
          .where(eq(analyticsEvents.eventType, step.eventType));
        
        return {
          step: step.name,
          count: stepCount[0].count,
          eventType: step.eventType
        };
      })
    );

    // Calculate conversion rates
    const funnelWithRates = funnelData.map((step, index) => {
      const previousStep = index > 0 ? funnelData[index - 1] : null;
      const conversionRate = previousStep && previousStep.count > 0 ? 
        (step.count / previousStep.count * 100).toFixed(2) : '100';
      
      return {
        ...step,
        conversionRate: `${conversionRate}%`
      };
    });

    return {
      funnelSteps: funnelWithRates,
      totalConversions: funnelData[funnelData.length - 1].count,
      overallConversionRate: funnelData[0].count > 0 ? 
        (funnelData[funnelData.length - 1].count / funnelData[0].count * 100).toFixed(2) : '0'
    };
  }

  // Export/Import functionality
  async exportUserData(globalUserId: number): Promise<any> {
    const user = await this.getGlobalUserProfile(globalUserId);
    if (!user) throw new Error('User not found');

    const events = await this.getAnalyticsEventsByUser(globalUserId);
    const devices = await this.getDeviceFingerprintsByUser(globalUserId);
    const mergeHistory = await this.getUserProfileMergeHistory(globalUserId);

    return {
      user,
      events,
      devices,
      mergeHistory,
      exportedAt: new Date().toISOString()
    };
  }

  async exportAnalyticsData(filters: any = {}): Promise<any> {
    const analytics = await this.getComprehensiveAnalytics(filters);
    const crossDeviceStats = await this.getCrossDeviceStats();
    const engagementMetrics = await this.getEngagementMetrics();
    const conversionFunnel = await this.getConversionFunnelData();

    return {
      analytics,
      crossDeviceStats,
      engagementMetrics,
      conversionFunnel,
      exportedAt: new Date().toISOString(),
      filters
    };
  }

  async importAnalyticsData(data: any): Promise<void> {
    // This would be implemented based on specific import requirements
    // For now, just validate the data structure
    if (!data.analytics || !data.exportedAt) {
      throw new Error('Invalid import data structure');
    }
    
    // Implementation would depend on the specific import format
    // and what data needs to be imported
  }
}

export const storage = new DatabaseStorage();
