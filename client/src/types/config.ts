export interface PageConfig {
  slug: string;
  title: string;
  description: string;
  niche: string;
  emotion: string;
  interactiveModule: string;
  contentPointer: string;
  cta: {
    text: string;
    link: string;
  };
  meta?: {
    keywords?: string;
    ogImage?: string;
  };
  affiliateOffers?: AffiliateOfferConfig[];
}

export interface AffiliateOfferConfig {
  slug: string;
  position: "header" | "sidebar" | "footer" | "inline";
  priority?: number;
}

export interface PagesConfig {
  pages: PageConfig[];
}

export interface ModuleProps {
  emotion: string;
  pageConfig: PageConfig;
}

// Affiliate types for frontend use
export interface AffiliateNetwork {
  id: number;
  slug: string;
  name: string;
  description: string;
  baseUrl: string;
  trackingParams: any;
  cookieSettings: any;
  isActive: boolean;
}

export interface AffiliateOffer {
  id: number;
  networkId: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  emotion: string;
  targetUrl: string;
  ctaText: string;
  commission: string;
  isActive: boolean;
}

export interface AffiliateClick {
  id: number;
  offerId: number;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  referrerUrl: string;
  sourcePage: string;
  clickedAt: string;
  metadata: any;
}
