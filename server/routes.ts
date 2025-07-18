import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAffiliateNetworkSchema,
  insertAffiliateOfferSchema,
  insertAffiliateClickSchema,
  insertPageAffiliateAssignmentSchema,
  insertExperimentSchema,
  insertExperimentVariantSchema,
  insertUserExperimentAssignmentSchema,
  insertExperimentEventSchema,
  insertBehaviorEventSchema,
  insertUserSessionSchema,
  insertQuizResultSchema,
  insertLeadMagnetSchema,
  insertLeadFormSchema,
  insertLeadCaptureSchema,
  insertLeadFormAssignmentSchema,
  insertLeadActivitySchema,
  insertEmailCampaignSchema,
  insertGlobalUserProfileSchema,
  insertDeviceFingerprintSchema,
  insertAnalyticsEventSchema,
  insertSessionBridgeSchema,
  insertAnalyticsSyncStatusSchema
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

// Utility function to generate session ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Device fingerprinting utility
function generateDeviceFingerprint(req: any): string {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const ip = getClientIP(req);
  
  // Create a simple fingerprint based on available headers
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;
  return Buffer.from(fingerprint).toString('base64').substring(0, 64);
}

// Analytics event batching utility
const eventBatchQueue: Map<string, any[]> = new Map();
const BATCH_SIZE = 100;
const BATCH_TIMEOUT = 5000; // 5 seconds

async function addEventToBatch(sessionId: string, event: any): Promise<void> {
  if (!eventBatchQueue.has(sessionId)) {
    eventBatchQueue.set(sessionId, []);
  }
  
  const batch = eventBatchQueue.get(sessionId)!;
  batch.push(event);
  
  if (batch.length >= BATCH_SIZE) {
    await processBatch(sessionId);
  }
}

async function processBatch(sessionId: string): Promise<void> {
  const batch = eventBatchQueue.get(sessionId);
  if (!batch || batch.length === 0) return;
  
  try {
    const batchId = randomUUID();
    const eventsWithBatch = batch.map(event => ({ ...event, batchId }));
    
    await storage.trackAnalyticsEventBatch(eventsWithBatch);
    eventBatchQueue.set(sessionId, []);
    
    // Process the batch
    setTimeout(() => storage.processAnalyticsEvents(batchId), 1000);
  } catch (error) {
    console.error('Error processing event batch:', error);
  }
}

// Auto-process batches every 5 seconds
setInterval(async () => {
  for (const [sessionId] of eventBatchQueue.entries()) {
    await processBatch(sessionId);
  }
}, BATCH_TIMEOUT);

// Utility function to get client IP
function getClientIP(req: any): string {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : null) || 'unknown';
}

// Utility function to set affiliate tracking cookies
function setAffiliateTrackingCookies(res: any, network: any, offer: any): void {
  const cookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax' as const
  };

  // Standard affiliate tracking cookies
  res.cookie('aff_network', network.slug, cookieOptions);
  res.cookie('aff_offer', offer.slug, cookieOptions);
  res.cookie('aff_timestamp', Date.now().toString(), cookieOptions);

  // Network-specific cookies
  if (network.cookieSettings) {
    const cookieSettings = network.cookieSettings as any;
    Object.keys(cookieSettings).forEach(key => {
      res.cookie(key, cookieSettings[key], cookieOptions);
    });
  }
}

// A/B Testing Utility Functions
function assignUserToVariant(sessionId: string, variants: any[]): any {
  // Use session ID for consistent assignment
  const hashCode = sessionId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const normalizedHash = Math.abs(hashCode) % 100;
  let cumulativePercentage = 0;
  
  for (const variant of variants) {
    cumulativePercentage += variant.trafficPercentage;
    if (normalizedHash < cumulativePercentage) {
      return variant;
    }
  }
  
  // Fallback to control variant
  return variants.find(v => v.isControl) || variants[0];
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ===========================================
  // ANALYTICS API ENDPOINTS
  // ===========================================
  
  // Get comprehensive click analytics
  app.get('/api/analytics/overview', async (req, res) => {
    try {
      const stats = await storage.getAffiliateClickStats();
      
      // Get total clicks in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentClicks = await storage.getAffiliateClicksByDateRange(thirtyDaysAgo, new Date());
      
      // Calculate metrics
      const totalClicks = recentClicks.length;
      const uniqueSessions = new Set(recentClicks.map(click => click.sessionId)).size;
      const conversions = recentClicks.filter(click => click.conversionTracked).length;
      const conversionRate = totalClicks > 0 ? (conversions / totalClicks * 100).toFixed(2) : '0';
      
      // Group clicks by day
      const clicksByDay = recentClicks.reduce((acc, click) => {
        const date = click.clickedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const chartData = Object.entries(clicksByDay).map(([date, clicks]) => ({
        date,
        clicks,
        conversions: recentClicks.filter(click => 
          click.clickedAt?.toISOString().split('T')[0] === date && click.conversionTracked
        ).length
      }));
      
      res.json({
        totalClicks,
        uniqueSessions,
        conversions,
        conversionRate: parseFloat(conversionRate),
        chartData: chartData.sort((a, b) => a.date.localeCompare(b.date)),
        topOffers: stats.slice(0, 10)
      });
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      res.status(500).json({ error: 'Failed to get analytics overview' });
    }
  });
  
  // Get analytics for specific offer
  app.get('/api/analytics/offers/:offerId', async (req, res) => {
    try {
      const offerId = parseInt(req.params.offerId);
      const clicks = await storage.getAffiliateClicksByOffer(offerId);
      
      // Calculate metrics
      const totalClicks = clicks.length;
      const uniqueSessions = new Set(clicks.map(click => click.sessionId)).size;
      const conversions = clicks.filter(click => click.conversionTracked).length;
      const conversionRate = totalClicks > 0 ? (conversions / totalClicks * 100).toFixed(2) : '0';
      
      // Group by source page
      const clicksBySource = clicks.reduce((acc, click) => {
        const source = click.sourcePage || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Group by day
      const clicksByDay = clicks.reduce((acc, click) => {
        const date = click.clickedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      res.json({
        totalClicks,
        uniqueSessions,
        conversions,
        conversionRate: parseFloat(conversionRate),
        clicksBySource: Object.entries(clicksBySource).map(([source, clicks]) => ({ source, clicks })),
        clicksByDay: Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks }))
      });
    } catch (error) {
      console.error('Error getting offer analytics:', error);
      res.status(500).json({ error: 'Failed to get offer analytics' });
    }
  });
  
  // Get all affiliate offers with click data
  app.get('/api/affiliate/offers', async (req, res) => {
    try {
      const offers = await storage.getAffiliateOffers();
      const offersWithStats = await Promise.all(
        offers.map(async (offer) => {
          const clicks = await storage.getAffiliateClicksByOffer(offer.id);
          const totalClicks = clicks.length;
          const conversions = clicks.filter(click => click.conversionTracked).length;
          const conversionRate = totalClicks > 0 ? (conversions / totalClicks * 100).toFixed(2) : '0';
          
          return {
            ...offer,
            totalClicks,
            conversions,
            conversionRate: parseFloat(conversionRate)
          };
        })
      );
      
      res.json({ offers: offersWithStats });
    } catch (error) {
      console.error('Error getting offers:', error);
      res.status(500).json({ error: 'Failed to get offers' });
    }
  });
  
  // Get affiliate networks
  app.get('/api/affiliate/networks', async (req, res) => {
    try {
      const networks = await storage.getAffiliateNetworks();
      res.json({ networks });
    } catch (error) {
      console.error('Error getting networks:', error);
      res.status(500).json({ error: 'Failed to get networks' });
    }
  });
  
  // ===========================================
  // AFFILIATE REDIRECT ENGINE
  // ===========================================
  
  // Main affiliate redirect route - /go/[affiliate_slug]
  app.get('/go/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const { ref, utm_source, utm_medium, utm_campaign } = req.query;
      
      // Get the affiliate offer
      const offer = await storage.getAffiliateOfferBySlug(slug);
      if (!offer) {
        return res.status(404).json({ error: 'Affiliate offer not found' });
      }

      // Get the affiliate network
      const network = await storage.getAffiliateNetworkBySlug(offer.networkId?.toString() || '');
      if (!network) {
        return res.status(404).json({ error: 'Affiliate network not found' });
      }

      // Generate session ID if not exists
      let sessionId = req.cookies.session_id;
      if (!sessionId) {
        sessionId = generateSessionId();
        res.cookie('session_id', sessionId, { 
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }

      // Track the click
      const clickData = {
        offerId: offer.id,
        sessionId,
        userAgent: req.get('User-Agent') || '',
        ipAddress: getClientIP(req),
        referrerUrl: req.get('Referer') || '',
        sourcePage: (ref as string) || '',
        metadata: {
          utm_source,
          utm_medium,
          utm_campaign,
          query: req.query
        }
      };

      await storage.trackAffiliateClick(clickData);

      // Set affiliate tracking cookies
      setAffiliateTrackingCookies(res, network, offer);

      // Build the final target URL with tracking parameters
      let targetUrl = offer.targetUrl;
      const url = new URL(targetUrl);
      
      // Add network-specific tracking parameters
      if (network.trackingParams) {
        const trackingParams = network.trackingParams as any;
        Object.keys(trackingParams).forEach(key => {
          url.searchParams.set(key, trackingParams[key]);
        });
      }

      // Add session tracking
      url.searchParams.set('aff_session', sessionId);
      url.searchParams.set('aff_timestamp', Date.now().toString());

      // Add UTM parameters if provided
      if (utm_source) url.searchParams.set('utm_source', utm_source as string);
      if (utm_medium) url.searchParams.set('utm_medium', utm_medium as string);
      if (utm_campaign) url.searchParams.set('utm_campaign', utm_campaign as string);

      // Redirect with proper headers for compliance
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      // 302 redirect to hide the final destination
      res.redirect(302, url.toString());

    } catch (error) {
      console.error('Affiliate redirect error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===========================================
  // AFFILIATE MANAGEMENT API ROUTES
  // ===========================================

  // Affiliate Networks CRUD
  app.get('/api/affiliate-networks', async (req, res) => {
    try {
      const networks = await storage.getAffiliateNetworks();
      res.json(networks);
    } catch (error) {
      console.error('Get affiliate networks error:', error);
      res.status(500).json({ error: 'Failed to fetch affiliate networks' });
    }
  });

  app.post('/api/affiliate-networks', async (req, res) => {
    try {
      const validatedData = insertAffiliateNetworkSchema.parse(req.body);
      const network = await storage.createAffiliateNetwork(validatedData);
      res.status(201).json(network);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Create affiliate network error:', error);
      res.status(500).json({ error: 'Failed to create affiliate network' });
    }
  });

  app.put('/api/affiliate-networks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAffiliateNetworkSchema.partial().parse(req.body);
      const network = await storage.updateAffiliateNetwork(id, validatedData);
      res.json(network);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Update affiliate network error:', error);
      res.status(500).json({ error: 'Failed to update affiliate network' });
    }
  });

  // Affiliate Offers CRUD
  app.get('/api/affiliate-offers', async (req, res) => {
    try {
      const { emotion, category } = req.query;
      let offers;
      
      if (emotion) {
        offers = await storage.getAffiliateOffersByEmotion(emotion as string);
      } else if (category) {
        offers = await storage.getAffiliateOffersByCategory(category as string);
      } else {
        offers = await storage.getAffiliateOffers();
      }
      
      res.json(offers);
    } catch (error) {
      console.error('Get affiliate offers error:', error);
      res.status(500).json({ error: 'Failed to fetch affiliate offers' });
    }
  });

  app.post('/api/affiliate-offers', async (req, res) => {
    try {
      const validatedData = insertAffiliateOfferSchema.parse(req.body);
      const offer = await storage.createAffiliateOffer(validatedData);
      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Create affiliate offer error:', error);
      res.status(500).json({ error: 'Failed to create affiliate offer' });
    }
  });

  app.put('/api/affiliate-offers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAffiliateOfferSchema.partial().parse(req.body);
      const offer = await storage.updateAffiliateOffer(id, validatedData);
      res.json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Update affiliate offer error:', error);
      res.status(500).json({ error: 'Failed to update affiliate offer' });
    }
  });

  // Page Affiliate Assignments
  app.get('/api/page-affiliate-assignments/:pageSlug', async (req, res) => {
    try {
      const { pageSlug } = req.params;
      const assignments = await storage.getPageAffiliateAssignments(pageSlug);
      res.json(assignments);
    } catch (error) {
      console.error('Get page affiliate assignments error:', error);
      res.status(500).json({ error: 'Failed to fetch page affiliate assignments' });
    }
  });

  app.post('/api/page-affiliate-assignments', async (req, res) => {
    try {
      const validatedData = insertPageAffiliateAssignmentSchema.parse(req.body);
      const assignment = await storage.createPageAffiliateAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Create page affiliate assignment error:', error);
      res.status(500).json({ error: 'Failed to create page affiliate assignment' });
    }
  });

  app.delete('/api/page-affiliate-assignments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePageAffiliateAssignment(id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete page affiliate assignment error:', error);
      res.status(500).json({ error: 'Failed to delete page affiliate assignment' });
    }
  });

  // ===========================================
  // AFFILIATE ANALYTICS & DASHBOARD ROUTES
  // ===========================================

  // Get affiliate click statistics
  app.get('/api/affiliate-stats', async (req, res) => {
    try {
      const stats = await storage.getAffiliateClickStats();
      res.json(stats);
    } catch (error) {
      console.error('Get affiliate stats error:', error);
      res.status(500).json({ error: 'Failed to fetch affiliate statistics' });
    }
  });

  // Get clicks by offer
  app.get('/api/affiliate-clicks/offer/:offerId', async (req, res) => {
    try {
      const offerId = parseInt(req.params.offerId);
      const clicks = await storage.getAffiliateClicksByOffer(offerId);
      res.json(clicks);
    } catch (error) {
      console.error('Get affiliate clicks by offer error:', error);
      res.status(500).json({ error: 'Failed to fetch affiliate clicks' });
    }
  });

  // Get clicks by date range
  app.get('/api/affiliate-clicks/range', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const clicks = await storage.getAffiliateClicksByDateRange(start, end);
      res.json(clicks);
    } catch (error) {
      console.error('Get affiliate clicks by date range error:', error);
      res.status(500).json({ error: 'Failed to fetch affiliate clicks' });
    }
  });

  // ===========================================
  // CLIENT-SIDE AFFILIATE HELPER ROUTES
  // ===========================================

  // Get affiliate offers for a specific page
  app.get('/api/page/:pageSlug/affiliate-offers', async (req, res) => {
    try {
      const { pageSlug } = req.params;
      const assignments = await storage.getPageAffiliateAssignments(pageSlug);
      
      // Get full offer details for each assignment
      const offersWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const offer = await storage.getAffiliateOfferBySlug(assignment.offerId?.toString() || '');
          return {
            ...assignment,
            offer
          };
        })
      );
      
      res.json(offersWithDetails);
    } catch (error) {
      console.error('Get page affiliate offers error:', error);
      res.status(500).json({ error: 'Failed to fetch page affiliate offers' });
    }
  });

  // ===========================================
  // ADMIN SEEDING ROUTE
  // ===========================================

  // Seed affiliate data (admin only)
  app.post('/api/admin/seed-affiliate-data', async (req, res) => {
    try {
      // Sample affiliate networks
      const networks = [
        {
          slug: 'amazon-associates',
          name: 'Amazon Associates',
          description: 'Amazon\'s affiliate marketing program',
          baseUrl: 'https://amazon.com',
          trackingParams: { tag: 'findawise-20', ref: 'as_li_tl' },
          cookieSettings: { amzn_tag: 'findawise-20' },
          isActive: true
        },
        {
          slug: 'shareasale',
          name: 'ShareASale',
          description: 'Performance marketing network',
          baseUrl: 'https://shareasale.com',
          trackingParams: { afftrack: 'findawise', u: '3721892' },
          cookieSettings: { sas_ref: 'findawise' },
          isActive: true
        }
      ];

      // Create networks
      const createdNetworks = [];
      for (const network of networks) {
        const created = await storage.createAffiliateNetwork(network);
        createdNetworks.push(created);
      }

      // Sample affiliate offers
      const offers = [
        {
          networkId: createdNetworks[0].id,
          slug: 'premium-fitness-tracker',
          title: 'Premium Fitness Tracker - 40% Off',
          description: 'Track your workouts and achieve your fitness goals',
          category: 'fitness',
          emotion: 'excitement',
          targetUrl: 'https://amazon.com/fitness-tracker?tag=findawise-20',
          ctaText: 'Get Your Fitness Tracker',
          commission: '8% commission',
          isActive: true
        },
        {
          networkId: createdNetworks[1].id,
          slug: 'transformation-program',
          title: '90-Day Body Transformation Program',
          description: 'Complete workout and nutrition program',
          category: 'fitness',
          emotion: 'excitement',
          targetUrl: 'https://shareasale.com/r.cfm?b=123456&u=3721892&m=12345',
          ctaText: 'Start Your Transformation',
          commission: '$50 per sale',
          isActive: true
        }
      ];

      // Create offers
      const createdOffers = [];
      for (const offer of offers) {
        const created = await storage.createAffiliateOffer(offer);
        createdOffers.push(created);
      }

      // Create page assignments
      const assignments = [
        { pageSlug: 'fitness-transformation-quiz', offerId: createdOffers[0].id, position: 'header', isActive: true },
        { pageSlug: 'fitness-transformation-quiz', offerId: createdOffers[1].id, position: 'sidebar', isActive: true }
      ];

      for (const assignment of assignments) {
        await storage.createPageAffiliateAssignment(assignment);
      }

      res.json({
        success: true,
        message: 'Affiliate data seeded successfully',
        data: {
          networks: createdNetworks.length,
          offers: createdOffers.length,
          assignments: assignments.length
        }
      });

    } catch (error) {
      console.error('Seed affiliate data error:', error);
      res.status(500).json({ error: 'Failed to seed affiliate data' });
    }
  });

  // ===========================================
  // A/B TESTING & EXPERIMENTATION API ROUTES
  // ===========================================

  // Create new experiment
  app.post('/api/experiments', async (req, res) => {
    try {
      const validatedData = insertExperimentSchema.parse(req.body);
      const experiment = await storage.createExperiment(validatedData);
      res.status(201).json(experiment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Create experiment error:', error);
      res.status(500).json({ error: 'Failed to create experiment' });
    }
  });

  // Get all experiments
  app.get('/api/experiments', async (req, res) => {
    try {
      const experiments = await storage.getExperiments();
      res.json(experiments);
    } catch (error) {
      console.error('Get experiments error:', error);
      res.status(500).json({ error: 'Failed to fetch experiments' });
    }
  });

  // Get experiment by slug
  app.get('/api/experiments/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const experiment = await storage.getExperimentBySlug(slug);
      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }
      res.json(experiment);
    } catch (error) {
      console.error('Get experiment error:', error);
      res.status(500).json({ error: 'Failed to fetch experiment' });
    }
  });

  // Update experiment
  app.put('/api/experiments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExperimentSchema.partial().parse(req.body);
      const experiment = await storage.updateExperiment(id, validatedData);
      res.json(experiment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Update experiment error:', error);
      res.status(500).json({ error: 'Failed to update experiment' });
    }
  });

  // Create experiment variant
  app.post('/api/experiment-variants', async (req, res) => {
    try {
      const validatedData = insertExperimentVariantSchema.parse(req.body);
      const variant = await storage.createExperimentVariant(validatedData);
      res.status(201).json(variant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Create variant error:', error);
      res.status(500).json({ error: 'Failed to create variant' });
    }
  });

  // Get variants for experiment
  app.get('/api/experiments/:experimentId/variants', async (req, res) => {
    try {
      const experimentId = parseInt(req.params.experimentId);
      const variants = await storage.getExperimentVariants(experimentId);
      res.json(variants);
    } catch (error) {
      console.error('Get variants error:', error);
      res.status(500).json({ error: 'Failed to fetch variants' });
    }
  });

  // Assign user to experiment (with automatic variant selection)
  app.post('/api/experiments/:experimentId/assign', async (req, res) => {
    try {
      const experimentId = parseInt(req.params.experimentId);
      const { sessionId, userId, deviceFingerprint } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      // Check if user is already assigned
      const existingAssignment = await storage.getUserExperimentAssignment(sessionId, experimentId);
      if (existingAssignment) {
        const variant = await storage.getVariantById(existingAssignment.variantId!);
        return res.json({ assignment: existingAssignment, variant });
      }

      // Get experiment variants and assign user
      const variants = await storage.getExperimentVariants(experimentId);
      if (variants.length === 0) {
        return res.status(400).json({ error: 'No variants available for this experiment' });
      }

      const selectedVariant = assignUserToVariant(sessionId, variants);

      const assignment = await storage.assignUserToExperiment({
        sessionId,
        experimentId,
        variantId: selectedVariant.id,
        userId,
        deviceFingerprint,
        isActive: true,
      });

      // Track impression event
      await storage.trackExperimentEvent({
        sessionId,
        experimentId,
        variantId: selectedVariant.id,
        eventType: 'impression',
        userId,
        metadata: { assignmentCreated: true },
      });

      res.json({ assignment, variant: selectedVariant });
    } catch (error) {
      console.error('Assign user to experiment error:', error);
      res.status(500).json({ error: 'Failed to assign user to experiment' });
    }
  });

  // Get user's experiment assignments
  app.get('/api/sessions/:sessionId/experiments', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const assignments = await storage.getUserExperimentAssignments(sessionId);
      
      // Get variant details for each assignment
      const assignmentsWithVariants = await Promise.all(
        assignments.map(async (assignment) => {
          const variant = await storage.getVariantById(assignment.variantId!);
          return { ...assignment, variant };
        })
      );

      res.json(assignmentsWithVariants);
    } catch (error) {
      console.error('Get user experiments error:', error);
      res.status(500).json({ error: 'Failed to fetch user experiments' });
    }
  });

  // Track experiment event
  app.post('/api/experiments/track', async (req, res) => {
    try {
      const validatedData = insertExperimentEventSchema.parse(req.body);
      const event = await storage.trackExperimentEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Track experiment event error:', error);
      res.status(500).json({ error: 'Failed to track experiment event' });
    }
  });

  // Get experiment analytics
  app.get('/api/experiments/:experimentId/analytics', async (req, res) => {
    try {
      const experimentId = parseInt(req.params.experimentId);
      const analytics = await storage.getExperimentAnalytics(experimentId);
      res.json(analytics);
    } catch (error) {
      console.error('Get experiment analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch experiment analytics' });
    }
  });

  // Get experiment events (for detailed analysis)
  app.get('/api/experiments/:experimentId/events', async (req, res) => {
    try {
      const experimentId = parseInt(req.params.experimentId);
      const { startDate, endDate } = req.query;
      
      let start, end;
      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      }

      const events = await storage.getExperimentEvents(experimentId, start, end);
      res.json(events);
    } catch (error) {
      console.error('Get experiment events error:', error);
      res.status(500).json({ error: 'Failed to fetch experiment events' });
    }
  });

  // Bulk track experiment events (for performance)
  app.post('/api/experiments/track-bulk', async (req, res) => {
    try {
      const { events } = req.body;
      if (!Array.isArray(events)) {
        return res.status(400).json({ error: 'Events must be an array' });
      }

      const validatedEvents = events.map(event => 
        insertExperimentEventSchema.parse(event)
      );

      const trackedEvents = await Promise.all(
        validatedEvents.map(event => storage.trackExperimentEvent(event))
      );

      res.json({ success: true, eventsTracked: trackedEvents.length });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Bulk track experiment events error:', error);
      res.status(500).json({ error: 'Failed to bulk track experiment events' });
    }
  });

  // ===========================================
  // USER SESSION & BEHAVIORAL TRACKING ROUTES
  // ===========================================
  
  // Create or update user session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertUserSessionSchema.parse(req.body);
      const session = await storage.createOrUpdateSession(sessionData);
      res.json({ success: true, data: session });
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(500).json({ success: false, error: "Failed to create session" });
    }
  });

  // Get user session by session ID
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSessionBySessionId(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      res.json({ success: true, data: session });
    } catch (error) {
      console.error("Session retrieval error:", error);
      res.status(500).json({ success: false, error: "Failed to get session" });
    }
  });

  // Track behavior events (batch)
  app.post("/api/behaviors", async (req, res) => {
    try {
      const { behaviors } = req.body;
      if (!Array.isArray(behaviors)) {
        return res.status(400).json({ success: false, error: "Behaviors must be an array" });
      }

      const validatedBehaviors = behaviors.map(behavior => 
        insertBehaviorEventSchema.parse(behavior)
      );

      await storage.trackBehaviorEvents(validatedBehaviors);
      res.json({ success: true, message: "Behaviors tracked successfully" });
    } catch (error) {
      console.error("Behavior tracking error:", error);
      res.status(500).json({ success: false, error: "Failed to track behaviors" });
    }
  });

  // Track quiz completion
  app.post("/api/quiz/results", async (req, res) => {
    try {
      const quizData = insertQuizResultSchema.parse(req.body);
      const result = await storage.saveQuizResult(quizData);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Quiz result error:", error);
      res.status(500).json({ success: false, error: "Failed to save quiz result" });
    }
  });

  // Get user insights for admin dashboard
  app.get("/api/admin/user-insights", async (req, res) => {
    try {
      const insights = await storage.getUserInsights();
      res.json({ success: true, data: insights });
    } catch (error) {
      console.error("User insights error:", error);
      res.status(500).json({ success: false, error: "Failed to get user insights" });
    }
  });

  // Get behavioral heatmap data
  app.get("/api/admin/behavior-heatmap", async (req, res) => {
    try {
      const { timeframe = '7d' } = req.query;
      const heatmapData = await storage.getBehaviorHeatmap(timeframe as string);
      res.json({ success: true, data: heatmapData });
    } catch (error) {
      console.error("Behavior heatmap error:", error);
      res.status(500).json({ success: false, error: "Failed to get behavior heatmap" });
    }
  });

  // Get conversion flow data
  app.get("/api/admin/conversion-flows", async (req, res) => {
    try {
      const flows = await storage.getConversionFlows();
      res.json({ success: true, data: flows });
    } catch (error) {
      console.error("Conversion flows error:", error);
      res.status(500).json({ success: false, error: "Failed to get conversion flows" });
    }
  });

  // Get personalization recommendations
  app.get("/api/personalization/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { pageSlug } = req.query;
      const recommendations = await storage.getPersonalizationRecommendations(
        sessionId, 
        pageSlug as string
      );
      res.json({ success: true, data: recommendations });
    } catch (error) {
      console.error("Personalization error:", error);
      res.status(500).json({ success: false, error: "Failed to get personalization recommendations" });
    }
  });

  const httpServer = createServer(app);
  // Lead Magnet routes
  app.post('/api/lead-magnets', async (req, res) => {
    try {
      const data = insertLeadMagnetSchema.parse(req.body);
      const leadMagnet = await storage.createLeadMagnet(data);
      res.json({ leadMagnet });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/lead-magnets', async (req, res) => {
    try {
      const leadMagnets = await storage.getLeadMagnets();
      res.json({ leadMagnets });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/lead-magnets/:slug', async (req, res) => {
    try {
      const leadMagnet = await storage.getLeadMagnetBySlug(req.params.slug);
      if (!leadMagnet) {
        return res.status(404).json({ error: 'Lead magnet not found' });
      }
      res.json({ leadMagnet });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lead Form routes
  app.post('/api/lead-forms', async (req, res) => {
    try {
      const data = insertLeadFormSchema.parse(req.body);
      const leadForm = await storage.createLeadForm(data);
      res.json({ leadForm });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/lead-forms', async (req, res) => {
    try {
      const { pageSlug, position } = req.query;
      
      if (pageSlug) {
        const leadForms = await storage.getLeadFormsByPage(pageSlug as string);
        res.json({ leadForms });
      } else {
        const leadForms = await storage.getLeadForms();
        res.json({ leadForms });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/lead-forms/:slug', async (req, res) => {
    try {
      const leadForm = await storage.getLeadFormBySlug(req.params.slug);
      if (!leadForm) {
        return res.status(404).json({ error: 'Lead form not found' });
      }
      res.json({ leadForm });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lead Capture routes
  app.post('/api/lead-capture', async (req, res) => {
    try {
      // Anti-spam validation
      const { email, sessionId, userAgent, ipAddress } = req.body;
      
      // Check for duplicate submissions within the last hour
      const recentCaptures = await storage.getLeadCapturesByEmail(email);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentSubmission = recentCaptures.find(capture => 
        capture.createdAt && capture.createdAt > oneHourAgo
      );
      
      if (recentSubmission) {
        return res.status(429).json({ error: 'Too many submissions. Please wait before submitting again.' });
      }

      // Parse and validate the lead capture data
      const data = insertLeadCaptureSchema.parse({
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      const leadCapture = await storage.captureLeadForm(data);
      res.json({ leadCapture });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/lead-captures', async (req, res) => {
    try {
      const { startDate, endDate, leadFormId } = req.query;
      
      let leadCaptures;
      if (leadFormId) {
        leadCaptures = await storage.getLeadCapturesByForm(parseInt(leadFormId as string));
      } else {
        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;
        leadCaptures = await storage.getLeadCaptures(start, end);
      }
      
      res.json({ leadCaptures });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/lead-captures/:id/delivered', async (req, res) => {
    try {
      await storage.markLeadAsDelivered(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/lead-captures/:id/unsubscribed', async (req, res) => {
    try {
      await storage.markLeadAsUnsubscribed(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lead Form Assignment routes
  app.post('/api/lead-form-assignments', async (req, res) => {
    try {
      const data = insertLeadFormAssignmentSchema.parse(req.body);
      const assignment = await storage.createLeadFormAssignment(data);
      res.json({ assignment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/lead-form-assignments', async (req, res) => {
    try {
      const { pageSlug } = req.query;
      const assignments = await storage.getLeadFormAssignments(pageSlug as string);
      res.json({ assignments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lead Activity routes
  app.post('/api/lead-activities', async (req, res) => {
    try {
      const data = insertLeadActivitySchema.parse(req.body);
      const activity = await storage.trackLeadActivity(data);
      res.json({ activity });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/lead-activities/:leadCaptureId', async (req, res) => {
    try {
      const activities = await storage.getLeadActivities(parseInt(req.params.leadCaptureId));
      res.json({ activities });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Email Campaign routes
  app.post('/api/email-campaigns', async (req, res) => {
    try {
      const data = insertEmailCampaignSchema.parse(req.body);
      const campaign = await storage.createEmailCampaign(data);
      res.json({ campaign });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/email-campaigns', async (req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json({ campaigns });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lead Analytics routes
  app.get('/api/lead-analytics', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const analytics = await storage.getLeadAnalytics(start, end);
      res.json({ analytics });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/lead-conversion-rates', async (req, res) => {
    try {
      const conversionRates = await storage.getLeadConversionRates();
      res.json({ conversionRates });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/lead-form-performance', async (req, res) => {
    try {
      const performance = await storage.getLeadFormPerformance();
      res.json({ performance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // CROSS-DEVICE USER PROFILES & ANALYTICS SYNC API
  // ===========================================

  // Global User Profile Management
  app.post('/api/analytics/user-profiles', async (req, res) => {
    try {
      const data = insertGlobalUserProfileSchema.parse(req.body);
      const profile = await storage.createGlobalUserProfile(data);
      res.json({ profile });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/user-profiles', async (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const profiles = await storage.getAllGlobalUserProfiles(
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      res.json({ profiles });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/user-profiles/:id', async (req, res) => {
    try {
      const profile = await storage.getGlobalUserProfile(parseInt(req.params.id));
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      res.json({ profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/analytics/user-profiles/:id', async (req, res) => {
    try {
      const data = insertGlobalUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateGlobalUserProfile(parseInt(req.params.id), data);
      res.json({ profile });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/user-profiles/search/:query', async (req, res) => {
    try {
      const profiles = await storage.searchGlobalUserProfiles(req.params.query);
      res.json({ profiles });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Identification and Cross-Device Recognition
  app.post('/api/analytics/identify-user', async (req, res) => {
    try {
      const { sessionId, email, phone, deviceInfo } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      // Generate device fingerprint
      const fingerprint = generateDeviceFingerprint(req);
      
      const user = await storage.identifyUser(sessionId, {
        email,
        phone,
        fingerprint,
        deviceInfo
      });

      res.json({ user, fingerprint });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/user-by-fingerprint/:fingerprint', async (req, res) => {
    try {
      const user = await storage.findUserByFingerprint(req.params.fingerprint);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/user-by-email/:email', async (req, res) => {
    try {
      const { create } = req.query;
      const user = await storage.findUserByEmail(req.params.email, create === 'true');
      res.json({ user });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Device Fingerprint Management
  app.post('/api/analytics/device-fingerprints', async (req, res) => {
    try {
      const data = insertDeviceFingerprintSchema.parse(req.body);
      const fingerprint = await storage.createDeviceFingerprint(data);
      res.json({ fingerprint });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/device-fingerprints/:fingerprint', async (req, res) => {
    try {
      const fingerprint = await storage.getDeviceFingerprint(req.params.fingerprint);
      if (!fingerprint) {
        return res.status(404).json({ error: 'Device fingerprint not found' });
      }
      res.json({ fingerprint });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/device-fingerprints/user/:userId', async (req, res) => {
    try {
      const fingerprints = await storage.getDeviceFingerprintsByUser(parseInt(req.params.userId));
      res.json({ fingerprints });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/analytics/device-fingerprints/:id', async (req, res) => {
    try {
      const data = insertDeviceFingerprintSchema.partial().parse(req.body);
      const fingerprint = await storage.updateDeviceFingerprint(parseInt(req.params.id), data);
      res.json({ fingerprint });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Analytics Event Tracking
  app.post('/api/analytics/events', async (req, res) => {
    try {
      const data = insertAnalyticsEventSchema.parse(req.body);
      
      // Set server timestamp and processing details
      data.serverTimestamp = new Date();
      data.processingDelay = data.clientTimestamp ? 
        Date.now() - new Date(data.clientTimestamp).getTime() : 0;
      
      // Add to batch queue for processing
      await addEventToBatch(data.sessionId, data);
      
      res.json({ success: true, batchQueued: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/analytics/events/batch', async (req, res) => {
    try {
      const { events } = req.body;
      
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: 'Events array is required' });
      }

      // Validate and process each event
      const validatedEvents = events.map(event => {
        const validated = insertAnalyticsEventSchema.parse(event);
        validated.serverTimestamp = new Date();
        validated.processingDelay = validated.clientTimestamp ? 
          Date.now() - new Date(validated.clientTimestamp).getTime() : 0;
        return validated;
      });

      // Process batch immediately
      const batchId = randomUUID();
      const eventsWithBatch = validatedEvents.map(event => ({ ...event, batchId }));
      
      const processedEvents = await storage.trackAnalyticsEventBatch(eventsWithBatch);
      
      // Process the batch
      setTimeout(() => storage.processAnalyticsEvents(batchId), 1000);
      
      res.json({ 
        success: true, 
        processed: processedEvents.length,
        batchId 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/events', async (req, res) => {
    try {
      const { 
        sessionId, 
        globalUserId, 
        eventType, 
        startDate, 
        endDate, 
        limit = 100, 
        offset = 0 
      } = req.query;

      const filters = {
        sessionId: sessionId as string,
        globalUserId: globalUserId ? parseInt(globalUserId as string) : undefined,
        eventType: eventType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const events = await storage.getAnalyticsEvents(filters);
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/events/user/:userId', async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      const events = await storage.getAnalyticsEventsByUser(
        parseInt(req.params.userId), 
        parseInt(limit as string)
      );
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/events/session/:sessionId', async (req, res) => {
    try {
      const events = await storage.getAnalyticsEventsBySession(req.params.sessionId);
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Session Bridge Management
  app.post('/api/analytics/session-bridge', async (req, res) => {
    try {
      const data = insertSessionBridgeSchema.parse(req.body);
      const bridge = await storage.createSessionBridge(data);
      res.json({ bridge });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/session-bridge/:sessionId', async (req, res) => {
    try {
      const bridge = await storage.getSessionBridge(req.params.sessionId);
      if (!bridge) {
        return res.status(404).json({ error: 'Session bridge not found' });
      }
      res.json({ bridge });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/analytics/link-session-to-user', async (req, res) => {
    try {
      const { sessionId, globalUserId, method, confidence } = req.body;
      
      if (!sessionId || !globalUserId || !method) {
        return res.status(400).json({ error: 'sessionId, globalUserId, and method are required' });
      }

      await storage.linkSessionToGlobalUser(sessionId, globalUserId, method, confidence || 80);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Analytics Sync Status
  app.post('/api/analytics/sync-status', async (req, res) => {
    try {
      const data = insertAnalyticsSyncStatusSchema.parse(req.body);
      const status = await storage.createAnalyticsSyncStatus(data);
      res.json({ status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/sync-status/:sessionId', async (req, res) => {
    try {
      const status = await storage.getAnalyticsSyncStatus(req.params.sessionId);
      if (!status) {
        return res.status(404).json({ error: 'Sync status not found' });
      }
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/analytics/sync-status/:id', async (req, res) => {
    try {
      const data = insertAnalyticsSyncStatusSchema.partial().parse(req.body);
      const status = await storage.updateAnalyticsSyncStatus(parseInt(req.params.id), data);
      res.json({ status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // User Profile Merge Management
  app.post('/api/analytics/merge-user-profiles', async (req, res) => {
    try {
      const { masterProfileId, mergedProfileId, reason, confidence } = req.body;
      
      if (!masterProfileId || !mergedProfileId) {
        return res.status(400).json({ error: 'masterProfileId and mergedProfileId are required' });
      }

      await storage.mergeUserProfiles(masterProfileId, mergedProfileId, reason || 'manual', confidence || 90);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics/merge-history/:masterProfileId', async (req, res) => {
    try {
      const history = await storage.getUserProfileMergeHistory(parseInt(req.params.masterProfileId));
      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Comprehensive Analytics Dashboard API
  app.get('/api/analytics/dashboard', async (req, res) => {
    try {
      const { 
        startDate, 
        endDate, 
        globalUserId, 
        deviceType, 
        eventType 
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        globalUserId: globalUserId ? parseInt(globalUserId as string) : undefined,
        deviceType: deviceType as string,
        eventType: eventType as string
      };

      const analytics = await storage.getComprehensiveAnalytics(filters);
      res.json({ analytics });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/user-journey/:userId', async (req, res) => {
    try {
      const journey = await storage.getUserJourney(parseInt(req.params.userId));
      res.json({ journey });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/cross-device-stats', async (req, res) => {
    try {
      const stats = await storage.getCrossDeviceStats();
      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/engagement-metrics', async (req, res) => {
    try {
      const { globalUserId } = req.query;
      const metrics = await storage.getEngagementMetrics(
        globalUserId ? parseInt(globalUserId as string) : undefined
      );
      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/conversion-funnel', async (req, res) => {
    try {
      const { funnelType = 'default' } = req.query;
      const funnel = await storage.getConversionFunnelData(funnelType as string);
      res.json({ funnel });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export and Import Data API
  app.get('/api/analytics/export/user/:userId', async (req, res) => {
    try {
      const userData = await storage.exportUserData(parseInt(req.params.userId));
      res.json({ userData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/export/analytics', async (req, res) => {
    try {
      const { 
        startDate, 
        endDate, 
        globalUserId, 
        deviceType, 
        eventType 
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        globalUserId: globalUserId ? parseInt(globalUserId as string) : undefined,
        deviceType: deviceType as string,
        eventType: eventType as string
      };

      const analyticsData = await storage.exportAnalyticsData(filters);
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.json"');
      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/analytics/import', async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Data is required for import' });
      }

      await storage.importAnalyticsData(data);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Real-time Analytics Sync Status
  app.get('/api/analytics/sync-health', async (req, res) => {
    try {
      const queueSize = Array.from(eventBatchQueue.values()).reduce((sum, batch) => sum + batch.length, 0);
      const activeQueues = eventBatchQueue.size;
      
      res.json({
        status: 'healthy',
        queueSize,
        activeQueues,
        batchSize: BATCH_SIZE,
        batchTimeout: BATCH_TIMEOUT,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
