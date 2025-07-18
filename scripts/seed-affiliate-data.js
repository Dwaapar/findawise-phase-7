import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket constructor
const neonConfig = {
  webSocketConstructor: ws,
};

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ...neonConfig 
});

// Sample affiliate networks
const affiliateNetworks = [
  {
    slug: 'amazon-associates',
    name: 'Amazon Associates',
    description: 'Amazon\'s affiliate marketing program with millions of products',
    baseUrl: 'https://amazon.com',
    trackingParams: JSON.stringify({
      tag: 'findawise-20',
      ref: 'as_li_tl',
      linkCode: 'll1'
    }),
    cookieSettings: JSON.stringify({
      amzn_tag: 'findawise-20'
    }),
    isActive: true
  },
  {
    slug: 'shareasale',
    name: 'ShareASale',
    description: 'Performance marketing network connecting merchants and affiliates',
    baseUrl: 'https://shareasale.com',
    trackingParams: JSON.stringify({
      afftrack: 'findawise',
      u: '3721892'
    }),
    cookieSettings: JSON.stringify({
      sas_ref: 'findawise'
    }),
    isActive: true
  },
  {
    slug: 'clickbank',
    name: 'ClickBank',
    description: 'Leading affiliate marketplace for digital products',
    baseUrl: 'https://clickbank.com',
    trackingParams: JSON.stringify({
      hop: 'findawise'
    }),
    cookieSettings: JSON.stringify({
      cb_affiliate: 'findawise'
    }),
    isActive: true
  },
  {
    slug: 'cj-affiliate',
    name: 'CJ Affiliate',
    description: 'Commission Junction - performance marketing network',
    baseUrl: 'https://cj.com',
    trackingParams: JSON.stringify({
      PID: '8701234',
      SID: 'findawise'
    }),
    cookieSettings: JSON.stringify({
      cj_sid: 'findawise'
    }),
    isActive: true
  }
];

// Sample affiliate offers
const affiliateOffers = [
  // Fitness Category - Excitement Emotion
  {
    networkId: 1, // Amazon
    slug: 'premium-fitness-tracker',
    title: 'Premium Fitness Tracker - 40% Off',
    description: 'Track your workouts, monitor heart rate, and achieve your fitness goals',
    category: 'fitness',
    emotion: 'excitement',
    targetUrl: 'https://amazon.com/fitness-tracker?tag=findawise-20',
    ctaText: 'Get Your Fitness Tracker',
    commission: '8% commission',
    isActive: true
  },
  {
    networkId: 2, // ShareASale
    slug: 'transformation-program',
    title: '90-Day Body Transformation Program',
    description: 'Complete workout and nutrition program for dramatic results',
    category: 'fitness',
    emotion: 'excitement',
    targetUrl: 'https://shareasale.com/r.cfm?b=123456&u=3721892&m=12345&urllink=fitnessapp.com%2Fsignup&afftrack=findawise',
    ctaText: 'Start Your Transformation',
    commission: '$50 per sale',
    isActive: true
  },

  // Finance Category - Trust Emotion
  {
    networkId: 1, // Amazon
    slug: 'investment-books-bundle',
    title: 'Investment Mastery Book Collection',
    description: 'Essential books for building wealth and financial independence',
    category: 'finance',
    emotion: 'trust',
    targetUrl: 'https://amazon.com/investment-books?tag=findawise-20',
    ctaText: 'Build Your Library',
    commission: '4% commission',
    isActive: true
  },
  {
    networkId: 4, // CJ Affiliate
    slug: 'trading-platform-pro',
    title: 'Professional Trading Platform',
    description: 'Advanced tools for serious investors and traders',
    category: 'finance',
    emotion: 'trust',
    targetUrl: 'https://cj.com/click/12345?PID=8701234&SID=findawise&url=tradingpro.com%2Fsignup',
    ctaText: 'Start Trading Like a Pro',
    commission: '$100 per signup',
    isActive: true
  },

  // Health Category - Relief Emotion
  {
    networkId: 1, // Amazon
    slug: 'anxiety-relief-supplements',
    title: 'Natural Anxiety Relief Supplements',
    description: 'Clinically proven natural ingredients for stress and anxiety relief',
    category: 'health',
    emotion: 'relief',
    targetUrl: 'https://amazon.com/anxiety-supplements?tag=findawise-20',
    ctaText: 'Find Your Relief',
    commission: '12% commission',
    isActive: true
  },
  {
    networkId: 3, // ClickBank
    slug: 'stress-management-course',
    title: 'Complete Stress Management Course',
    description: 'Learn proven techniques to manage stress and anxiety naturally',
    category: 'health',
    emotion: 'relief',
    targetUrl: 'https://clickbank.com/track?hop=findawise&vendor=stressrelief&pid=mainpage',
    ctaText: 'Master Stress Management',
    commission: '50% commission',
    isActive: true
  },

  // Wellness Category - Calm Emotion
  {
    networkId: 1, // Amazon
    slug: 'meditation-accessories',
    title: 'Premium Meditation Cushion Set',
    description: 'Create the perfect meditation space with high-quality accessories',
    category: 'wellness',
    emotion: 'calm',
    targetUrl: 'https://amazon.com/meditation-cushions?tag=findawise-20',
    ctaText: 'Enhance Your Practice',
    commission: '6% commission',
    isActive: true
  },
  {
    networkId: 2, // ShareASale
    slug: 'mindfulness-app-premium',
    title: 'Mindfulness Meditation App - 1 Year Premium',
    description: 'Guided meditations, sleep stories, and mindfulness exercises',
    category: 'wellness',
    emotion: 'calm',
    targetUrl: 'https://shareasale.com/r.cfm?b=789012&u=3721892&m=67890&urllink=mindfulnessapp.com%2Fpremium&afftrack=findawise',
    ctaText: 'Start Your Journey',
    commission: '$25 per subscription',
    isActive: true
  },

  // Business Category - Confidence Emotion
  {
    networkId: 4, // CJ Affiliate
    slug: 'business-course-mastery',
    title: 'Complete Business Mastery Course',
    description: 'Learn how to build and scale a successful online business',
    category: 'business',
    emotion: 'confidence',
    targetUrl: 'https://cj.com/click/67890?PID=8701234&SID=findawise&url=businessmastery.com%2Fenroll',
    ctaText: 'Master Business Success',
    commission: '$200 per enrollment',
    isActive: true
  },
  {
    networkId: 3, // ClickBank
    slug: 'entrepreneur-toolkit',
    title: 'Ultimate Entrepreneur Toolkit',
    description: 'Essential tools and resources for starting your business',
    category: 'business',
    emotion: 'confidence',
    targetUrl: 'https://clickbank.com/track?hop=findawise&vendor=biztools&pid=toolkit',
    ctaText: 'Get Your Toolkit',
    commission: '60% commission',
    isActive: true
  }
];

// Page affiliate assignments
const pageAffiliateAssignments = [
  // Fitness Transformation Quiz
  { pageSlug: 'fitness-transformation-quiz', offerId: 1, position: 'header', isActive: true },
  { pageSlug: 'fitness-transformation-quiz', offerId: 2, position: 'sidebar', isActive: true },
  { pageSlug: 'fitness-transformation-quiz', offerId: 1, position: 'footer', isActive: true },

  // Investment Calculator
  { pageSlug: 'investment-calculator', offerId: 3, position: 'header', isActive: true },
  { pageSlug: 'investment-calculator', offerId: 4, position: 'sidebar', isActive: true },
  { pageSlug: 'investment-calculator', offerId: 3, position: 'inline', isActive: true },

  // Anxiety Relief Toolkit
  { pageSlug: 'anxiety-relief-toolkit', offerId: 5, position: 'header', isActive: true },
  { pageSlug: 'anxiety-relief-toolkit', offerId: 6, position: 'sidebar', isActive: true },
  { pageSlug: 'anxiety-relief-toolkit', offerId: 5, position: 'footer', isActive: true },

  // Meditation Timer
  { pageSlug: 'meditation-timer', offerId: 7, position: 'header', isActive: true },
  { pageSlug: 'meditation-timer', offerId: 8, position: 'sidebar', isActive: true },
  { pageSlug: 'meditation-timer', offerId: 7, position: 'inline', isActive: true },

  // Business Success Strategies
  { pageSlug: 'business-success-strategies', offerId: 9, position: 'header', isActive: true },
  { pageSlug: 'business-success-strategies', offerId: 10, position: 'sidebar', isActive: true },
  { pageSlug: 'business-success-strategies', offerId: 9, position: 'footer', isActive: true }
];

async function seedAffiliateData() {
  try {
    console.log('🌱 Starting affiliate data seeding...');

    // Insert affiliate networks
    console.log('📡 Inserting affiliate networks...');
    for (const network of affiliateNetworks) {
      await pool.query(`
        INSERT INTO affiliate_networks (slug, name, description, base_url, tracking_params, cookie_settings, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          base_url = EXCLUDED.base_url,
          tracking_params = EXCLUDED.tracking_params,
          cookie_settings = EXCLUDED.cookie_settings,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
      `, [
        network.slug,
        network.name,
        network.description,
        network.baseUrl,
        network.trackingParams,
        network.cookieSettings,
        network.isActive
      ]);
    }

    // Insert affiliate offers
    console.log('🎯 Inserting affiliate offers...');
    for (const offer of affiliateOffers) {
      await pool.query(`
        INSERT INTO affiliate_offers (network_id, slug, title, description, category, emotion, target_url, cta_text, commission, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO UPDATE SET
          network_id = EXCLUDED.network_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          emotion = EXCLUDED.emotion,
          target_url = EXCLUDED.target_url,
          cta_text = EXCLUDED.cta_text,
          commission = EXCLUDED.commission,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
      `, [
        offer.networkId,
        offer.slug,
        offer.title,
        offer.description,
        offer.category,
        offer.emotion,
        offer.targetUrl,
        offer.ctaText,
        offer.commission,
        offer.isActive
      ]);
    }

    // Get offer IDs for assignments
    const offerResults = await pool.query('SELECT id, slug FROM affiliate_offers ORDER BY id');
    const offerMap = {};
    offerResults.rows.forEach(row => {
      offerMap[row.slug] = row.id;
    });

    // Insert page affiliate assignments
    console.log('🔗 Inserting page affiliate assignments...');
    for (const assignment of pageAffiliateAssignments) {
      const actualOfferId = Object.values(offerMap)[assignment.offerId - 1]; // Convert 1-based to actual ID
      if (actualOfferId) {
        await pool.query(`
          INSERT INTO page_affiliate_assignments (page_slug, offer_id, position, is_active)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [
          assignment.pageSlug,
          actualOfferId,
          assignment.position,
          assignment.isActive
        ]);
      }
    }

    console.log('✅ Affiliate data seeding completed successfully!');
    console.log(`📊 Created ${affiliateNetworks.length} networks, ${affiliateOffers.length} offers, and ${pageAffiliateAssignments.length} assignments`);

  } catch (error) {
    console.error('❌ Error seeding affiliate data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedAffiliateData()
  .then(() => {
    console.log('🎉 Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  });