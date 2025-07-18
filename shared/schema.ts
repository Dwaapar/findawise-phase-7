import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Sessions table for behavioral tracking
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userId: varchar("user_id", { length: 255 }),
  startTime: timestamp("start_time").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  totalTimeOnSite: integer("total_time_on_site").default(0), // in milliseconds
  pageViews: integer("page_views").default(0),
  interactions: integer("interactions").default(0),
  deviceInfo: jsonb("device_info"),
  location: jsonb("location"),
  preferences: jsonb("preferences"),
  segment: varchar("segment", { length: 50 }).default("new_visitor"),
  personalizationFlags: jsonb("personalization_flags"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Behavior Events table for detailed tracking
export const behaviorEvents = pgTable("behavior_events", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventData: jsonb("event_data"),
  pageSlug: varchar("page_slug", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: varchar("user_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz Results table
export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  quizId: varchar("quiz_id", { length: 255 }).notNull(),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  result: text("result").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: varchar("user_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Affiliate Networks table - stores affiliate program configurations
export const affiliateNetworks = pgTable("affiliate_networks", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  baseUrl: text("base_url").notNull(),
  trackingParams: jsonb("tracking_params"), // JSON object for tracking parameters
  cookieSettings: jsonb("cookie_settings"), // JSON object for cookie configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Affiliate Offers table - stores individual affiliate offers
export const affiliateOffers = pgTable("affiliate_offers", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => affiliateNetworks.id),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  emotion: varchar("emotion", { length: 50 }),
  targetUrl: text("target_url").notNull(),
  ctaText: varchar("cta_text", { length: 100 }),
  commission: varchar("commission", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Affiliate Clicks table - tracks all affiliate link clicks
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").references(() => affiliateOffers.id),
  sessionId: varchar("session_id", { length: 255 }),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  referrerUrl: text("referrer_url"),
  sourcePage: varchar("source_page", { length: 255 }),
  clickedAt: timestamp("clicked_at").defaultNow(),
  conversionTracked: boolean("conversion_tracked").default(false),
  metadata: jsonb("metadata"), // Additional tracking data
});

// Page Affiliate Assignments table - links pages to affiliate offers
export const pageAffiliateAssignments = pgTable("page_affiliate_assignments", {
  id: serial("id").primaryKey(),
  pageSlug: varchar("page_slug", { length: 255 }).notNull(),
  offerId: integer("offer_id").references(() => affiliateOffers.id),
  position: varchar("position", { length: 50 }), // header, sidebar, footer, inline, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertAffiliateNetworkSchema = createInsertSchema(affiliateNetworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateOfferSchema = createInsertSchema(affiliateOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertPageAffiliateAssignmentSchema = createInsertSchema(pageAffiliateAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBehaviorEventSchema = createInsertSchema(behaviorEvents).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

// Types
export type InsertAffiliateNetwork = z.infer<typeof insertAffiliateNetworkSchema>;
export type AffiliateNetwork = typeof affiliateNetworks.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertBehaviorEvent = z.infer<typeof insertBehaviorEventSchema>;
export type BehaviorEvent = typeof behaviorEvents.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

export type InsertAffiliateOffer = z.infer<typeof insertAffiliateOfferSchema>;
export type AffiliateOffer = typeof affiliateOffers.$inferSelect;

export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;

export type InsertPageAffiliateAssignment = z.infer<typeof insertPageAffiliateAssignmentSchema>;
export type PageAffiliateAssignment = typeof pageAffiliateAssignments.$inferSelect;

// A/B Testing & Experimentation Framework

// Experiments table - defines A/B tests
export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'page', 'offer', 'cta', 'quiz', 'content'
  targetEntity: varchar("target_entity", { length: 255 }).notNull(), // page slug, offer id, etc.
  trafficAllocation: integer("traffic_allocation").default(100), // percentage of traffic to include
  status: varchar("status", { length: 20 }).default("draft"), // draft, active, paused, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdBy: varchar("created_by", { length: 255 }),
  metadata: jsonb("metadata"), // additional configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Experiment Variants table - different versions in each experiment
export const experimentVariants = pgTable("experiment_variants", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id").references(() => experiments.id),
  slug: varchar("slug", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  trafficPercentage: integer("traffic_percentage").notNull(), // percentage of experiment traffic
  configuration: jsonb("configuration").notNull(), // variant-specific config (text, colors, etc.)
  isControl: boolean("is_control").default(false), // marks the control variant
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Experiment Assignments table - tracks which variant each user sees
export const userExperimentAssignments = pgTable("user_experiment_assignments", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  experimentId: integer("experiment_id").references(() => experiments.id),
  variantId: integer("variant_id").references(() => experimentVariants.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  userId: varchar("user_id", { length: 255 }), // if user is logged in
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }), // for cross-session tracking
  isActive: boolean("is_active").default(true),
});

// Experiment Events table - tracks all experiment-related events
export const experimentEvents = pgTable("experiment_events", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  experimentId: integer("experiment_id").references(() => experiments.id),
  variantId: integer("variant_id").references(() => experimentVariants.id),
  eventType: varchar("event_type", { length: 50 }).notNull(), // impression, click, conversion, bounce
  eventValue: varchar("event_value", { length: 255 }), // additional event data
  pageSlug: varchar("page_slug", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: varchar("user_id", { length: 255 }),
  metadata: jsonb("metadata"), // additional tracking data
});

// Experiment Results table - aggregated metrics per variant
export const experimentResults = pgTable("experiment_results", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id").references(() => experiments.id),
  variantId: integer("variant_id").references(() => experimentVariants.id),
  date: timestamp("date").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  bounces: integer("bounces").default(0),
  uniqueUsers: integer("unique_users").default(0),
  conversionRate: varchar("conversion_rate", { length: 10 }), // stored as percentage string
  clickThroughRate: varchar("click_through_rate", { length: 10 }),
  bounceRate: varchar("bounce_rate", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for A/B testing
export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExperimentVariantSchema = createInsertSchema(experimentVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserExperimentAssignmentSchema = createInsertSchema(userExperimentAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertExperimentEventSchema = createInsertSchema(experimentEvents).omit({
  id: true,
  timestamp: true,
});

export const insertExperimentResultSchema = createInsertSchema(experimentResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for A/B testing
export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experiments.$inferSelect;

export type InsertExperimentVariant = z.infer<typeof insertExperimentVariantSchema>;
export type ExperimentVariant = typeof experimentVariants.$inferSelect;

export type InsertUserExperimentAssignment = z.infer<typeof insertUserExperimentAssignmentSchema>;
export type UserExperimentAssignment = typeof userExperimentAssignments.$inferSelect;

export type InsertExperimentEvent = z.infer<typeof insertExperimentEventSchema>;
export type ExperimentEvent = typeof experimentEvents.$inferSelect;

export type InsertExperimentResult = z.infer<typeof insertExperimentResultSchema>;
export type ExperimentResult = typeof experimentResults.$inferSelect;

// Lead Magnet & Email Capture System

// Lead Magnets table - defines different lead magnets/opt-in offers
export const leadMagnets = pgTable("lead_magnets", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'ebook', 'checklist', 'video', 'course', 'toolkit', 'quiz_result'
  deliveryMethod: varchar("delivery_method", { length: 50 }).notNull(), // 'email', 'download', 'redirect', 'webhook'
  deliveryUrl: text("delivery_url"), // URL for download or redirect
  deliveryConfig: jsonb("delivery_config"), // Additional delivery configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead Forms table - configures lead capture forms
export const leadForms = pgTable("lead_forms", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  leadMagnetId: integer("lead_magnet_id").references(() => leadMagnets.id),
  formType: varchar("form_type", { length: 50 }).notNull(), // 'popup', 'inline', 'sidebar', 'exit_intent', 'scroll_trigger'
  triggerConfig: jsonb("trigger_config"), // When/how to show the form
  formFields: jsonb("form_fields").notNull(), // Form field configuration
  styling: jsonb("styling"), // Custom styling options
  emotion: varchar("emotion", { length: 50 }), // Emotion theme to use
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead Captures table - stores captured leads
export const leadCaptures = pgTable("lead_captures", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  leadFormId: integer("lead_form_id").references(() => leadForms.id),
  leadMagnetId: integer("lead_magnet_id").references(() => leadMagnets.id),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  additionalData: jsonb("additional_data"), // Extra form fields
  source: varchar("source", { length: 100 }), // Page/source where lead was captured
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  referrerUrl: text("referrer_url"),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  utmTerm: varchar("utm_term", { length: 100 }),
  utmContent: varchar("utm_content", { length: 100 }),
  isVerified: boolean("is_verified").default(false),
  isDelivered: boolean("is_delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead Form Assignments table - links forms to pages/positions
export const leadFormAssignments = pgTable("lead_form_assignments", {
  id: serial("id").primaryKey(),
  leadFormId: integer("lead_form_id").references(() => leadForms.id),
  pageSlug: varchar("page_slug", { length: 255 }), // null means all pages
  position: varchar("position", { length: 50 }).notNull(), // 'header', 'sidebar', 'footer', 'inline', 'popup'
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead Experiments table - A/B test lead capture forms
export const leadExperiments = pgTable("lead_experiments", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id").references(() => experiments.id),
  leadFormId: integer("lead_form_id").references(() => leadForms.id),
  variantId: integer("variant_id").references(() => experimentVariants.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead Activities table - tracks lead interactions
export const leadActivities = pgTable("lead_activities", {
  id: serial("id").primaryKey(),
  leadCaptureId: integer("lead_capture_id").references(() => leadCaptures.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // 'email_sent', 'email_opened', 'link_clicked', 'form_submitted', 'page_visited'
  activityData: jsonb("activity_data"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: varchar("session_id", { length: 255 }),
  pageSlug: varchar("page_slug", { length: 255 }),
  metadata: jsonb("metadata"),
});

// Email Campaigns table - manage email sequences
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  leadMagnetId: integer("lead_magnet_id").references(() => leadMagnets.id),
  emailSequence: jsonb("email_sequence").notNull(), // Array of email templates
  triggerType: varchar("trigger_type", { length: 50 }).notNull(), // 'immediate', 'delayed', 'behavior_based'
  triggerConfig: jsonb("trigger_config"), // When to send emails
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for Lead Capture System
export const insertLeadMagnetSchema = createInsertSchema(leadMagnets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadFormSchema = createInsertSchema(leadForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadCaptureSchema = createInsertSchema(leadCaptures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadFormAssignmentSchema = createInsertSchema(leadFormAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertLeadExperimentSchema = createInsertSchema(leadExperiments).omit({
  id: true,
  createdAt: true,
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  timestamp: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for Lead Capture System
export type InsertLeadMagnet = z.infer<typeof insertLeadMagnetSchema>;
export type LeadMagnet = typeof leadMagnets.$inferSelect;

export type InsertLeadForm = z.infer<typeof insertLeadFormSchema>;
export type LeadForm = typeof leadForms.$inferSelect;

export type InsertLeadCapture = z.infer<typeof insertLeadCaptureSchema>;
export type LeadCapture = typeof leadCaptures.$inferSelect;

export type InsertLeadFormAssignment = z.infer<typeof insertLeadFormAssignmentSchema>;
export type LeadFormAssignment = typeof leadFormAssignments.$inferSelect;

export type InsertLeadExperiment = z.infer<typeof insertLeadExperimentSchema>;
export type LeadExperiment = typeof leadExperiments.$inferSelect;

export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;

export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;

// ===========================================
// CROSS-DEVICE USER PROFILES & FINGERPRINTING
// ===========================================

// Global User Profiles table - master user profiles across all devices
export const globalUserProfiles = pgTable("global_user_profiles", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 36 }).notNull().unique(), // Master UUID for the user
  email: varchar("email", { length: 255 }).unique(), // Primary email for merging
  phone: varchar("phone", { length: 20 }).unique(), // Primary phone for merging
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  mergedFromSessions: jsonb("merged_from_sessions"), // Array of session IDs that were merged into this profile
  totalSessions: integer("total_sessions").default(0),
  totalPageViews: integer("total_page_views").default(0),
  totalInteractions: integer("total_interactions").default(0),
  totalTimeOnSite: integer("total_time_on_site").default(0), // in milliseconds
  firstVisit: timestamp("first_visit"),
  lastVisit: timestamp("last_visit"),
  preferredDeviceType: varchar("preferred_device_type", { length: 50 }), // mobile, desktop, tablet
  preferredBrowser: varchar("preferred_browser", { length: 50 }),
  preferredOS: varchar("preferred_os", { length: 50 }),
  locationData: jsonb("location_data"), // Aggregated location info
  preferences: jsonb("preferences"), // User preferences and settings
  segments: jsonb("segments"), // User segments array
  tags: jsonb("tags"), // User tags array
  customAttributes: jsonb("custom_attributes"), // Additional custom data
  lifetimeValue: integer("lifetime_value").default(0), // in cents
  conversionCount: integer("conversion_count").default(0),
  leadQualityScore: integer("lead_quality_score").default(0), // 0-100
  engagementScore: integer("engagement_score").default(0), // 0-100
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device Fingerprints table - tracks unique device fingerprints
export const deviceFingerprints = pgTable("device_fingerprints", {
  id: serial("id").primaryKey(),
  fingerprint: varchar("fingerprint", { length: 255 }).notNull().unique(),
  globalUserId: integer("global_user_id").references(() => globalUserProfiles.id),
  deviceInfo: jsonb("device_info").notNull(), // Screen resolution, timezone, language, etc.
  browserInfo: jsonb("browser_info").notNull(), // User agent, plugins, canvas fingerprint
  hardwareInfo: jsonb("hardware_info"), // CPU, GPU, memory info
  networkInfo: jsonb("network_info"), // IP history, connection type
  confidenceScore: integer("confidence_score").default(0), // 0-100, how confident we are in this fingerprint
  sessionCount: integer("session_count").default(0),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Profile Merge History table - tracks profile merges
export const userProfileMergeHistory = pgTable("user_profile_merge_history", {
  id: serial("id").primaryKey(),
  masterProfileId: integer("master_profile_id").references(() => globalUserProfiles.id),
  mergedProfileId: integer("merged_profile_id"), // ID of the profile that was merged (now deleted)
  mergedSessionIds: jsonb("merged_session_ids"), // Array of session IDs that were merged
  mergeReason: varchar("merge_reason", { length: 100 }).notNull(), // 'email_match', 'phone_match', 'fingerprint_match', 'manual'
  mergeConfidence: integer("merge_confidence").default(0), // 0-100
  mergeData: jsonb("merge_data"), // Additional merge information
  mergedAt: timestamp("merged_at").defaultNow(),
  mergedBy: varchar("merged_by", { length: 255 }), // System or user ID
});

// Analytics Events table - comprehensive event tracking
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 36 }).notNull().unique(), // UUID for deduplication
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  globalUserId: integer("global_user_id").references(() => globalUserProfiles.id),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventCategory: varchar("event_category", { length: 100 }),
  eventAction: varchar("event_action", { length: 100 }),
  eventLabel: varchar("event_label", { length: 255 }),
  eventValue: integer("event_value"),
  pageSlug: varchar("page_slug", { length: 255 }),
  pageTitle: varchar("page_title", { length: 255 }),
  referrerUrl: text("referrer_url"),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  utmTerm: varchar("utm_term", { length: 100 }),
  utmContent: varchar("utm_content", { length: 100 }),
  deviceType: varchar("device_type", { length: 50 }),
  browserName: varchar("browser_name", { length: 50 }),
  browserVersion: varchar("browser_version", { length: 50 }),
  operatingSystem: varchar("operating_system", { length: 50 }),
  screenResolution: varchar("screen_resolution", { length: 50 }),
  language: varchar("language", { length: 10 }),
  timezone: varchar("timezone", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  country: varchar("country", { length: 5 }),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  coordinates: jsonb("coordinates"), // {lat, lng}
  customData: jsonb("custom_data"), // Additional event-specific data
  serverTimestamp: timestamp("server_timestamp").defaultNow(),
  clientTimestamp: timestamp("client_timestamp"),
  processingDelay: integer("processing_delay"), // milliseconds between client and server
  isProcessed: boolean("is_processed").default(false),
  batchId: varchar("batch_id", { length: 36 }), // For batch processing
  createdAt: timestamp("created_at").defaultNow(),
});

// Session Bridge table - links sessions to global user profiles
export const sessionBridge = pgTable("session_bridge", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  globalUserId: integer("global_user_id").references(() => globalUserProfiles.id),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  linkMethod: varchar("link_method", { length: 50 }).notNull(), // 'email', 'phone', 'fingerprint', 'manual'
  linkConfidence: integer("link_confidence").default(0), // 0-100
  linkData: jsonb("link_data"), // Additional linking information
  linkedAt: timestamp("linked_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Analytics Sync Status table - tracks sync status for client-server analytics
export const analyticsSyncStatus = pgTable("analytics_sync_status", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  globalUserId: integer("global_user_id").references(() => globalUserProfiles.id),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  lastClientEventId: varchar("last_client_event_id", { length: 36 }),
  lastServerEventId: varchar("last_server_event_id", { length: 36 }),
  pendingEventCount: integer("pending_event_count").default(0),
  syncVersion: varchar("sync_version", { length: 10 }).default("1.0"),
  clientVersion: varchar("client_version", { length: 20 }),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  syncErrors: jsonb("sync_errors"), // Array of sync errors
  isHealthy: boolean("is_healthy").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for cross-device system
export const insertGlobalUserProfileSchema = createInsertSchema(globalUserProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceFingerprintSchema = createInsertSchema(deviceFingerprints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileMergeHistorySchema = createInsertSchema(userProfileMergeHistory).omit({
  id: true,
  mergedAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  serverTimestamp: true,
  createdAt: true,
});

export const insertSessionBridgeSchema = createInsertSchema(sessionBridge).omit({
  id: true,
  linkedAt: true,
});

export const insertAnalyticsSyncStatusSchema = createInsertSchema(analyticsSyncStatus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for cross-device system
export type InsertGlobalUserProfile = z.infer<typeof insertGlobalUserProfileSchema>;
export type GlobalUserProfile = typeof globalUserProfiles.$inferSelect;

export type InsertDeviceFingerprint = z.infer<typeof insertDeviceFingerprintSchema>;
export type DeviceFingerprint = typeof deviceFingerprints.$inferSelect;

export type InsertUserProfileMergeHistory = z.infer<typeof insertUserProfileMergeHistorySchema>;
export type UserProfileMergeHistory = typeof userProfileMergeHistory.$inferSelect;

export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

export type InsertSessionBridge = z.infer<typeof insertSessionBridgeSchema>;
export type SessionBridge = typeof sessionBridge.$inferSelect;

export type InsertAnalyticsSyncStatus = z.infer<typeof insertAnalyticsSyncStatusSchema>;
export type AnalyticsSyncStatus = typeof analyticsSyncStatus.$inferSelect;
