/**
 * Cross-Device Analytics Sync Service
 * Handles real-time event tracking, user identification, and cross-device synchronization
 */

// Browser-compatible UUID generation
function randomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Types for analytics events
interface AnalyticsEvent {
  id?: string;
  sessionId: string;
  globalUserId?: number;
  eventType: string;
  eventAction: string;
  pageSlug?: string;
  elementId?: string;
  metadata?: Record<string, any>;
  clientTimestamp: Date;
  serverTimestamp?: Date;
  deviceType?: string;
  browserInfo?: Record<string, any>;
  batchId?: string;
  isProcessed?: boolean;
  processingDelay?: number;
}

interface DeviceInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  timezone: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
}

interface UserIdentifiers {
  email?: string;
  phone?: string;
  fingerprint?: string;
  deviceInfo?: DeviceInfo;
}

interface SyncStatus {
  lastSync: Date;
  pendingEvents: number;
  syncQueue: AnalyticsEvent[];
  isOnline: boolean;
  retryCount: number;
  maxRetries: number;
}

class AnalyticsSync {
  private sessionId: string;
  private globalUserId?: number;
  private userIdentifiers: UserIdentifiers = {};
  private deviceFingerprint?: string;
  private syncStatus: SyncStatus;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized: boolean = false;
  private syncInterval?: NodeJS.Timeout;
  private retryTimeout?: NodeJS.Timeout;

  // Configuration
  private readonly BATCH_SIZE = 50;
  private readonly SYNC_INTERVAL = 5000; // 5 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds
  private readonly STORAGE_KEY = 'findawise_analytics_sync';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.syncStatus = {
      lastSync: new Date(),
      pendingEvents: 0,
      syncQueue: [],
      isOnline: navigator.onLine,
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    };

    // Initialize on next tick to ensure DOM is ready
    setTimeout(() => this.initialize(), 0);
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load persisted data
      await this.loadPersistedData();
      
      // Generate device fingerprint
      this.deviceFingerprint = await this.generateDeviceFingerprint();
      
      // Set up device info
      this.userIdentifiers.deviceInfo = await this.collectDeviceInfo();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start sync process
      this.startSyncProcess();
      
      // Track initialization
      this.trackEvent('system', 'analytics_initialized', {
        sessionId: this.sessionId,
        fingerprint: this.deviceFingerprint
      });

      this.isInitialized = true;
      console.log('Analytics Sync initialized:', {
        sessionId: this.sessionId,
        fingerprint: this.deviceFingerprint
      });
    } catch (error) {
      console.error('Failed to initialize Analytics Sync:', error);
    }
  }

  private async loadPersistedData(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.globalUserId = data.globalUserId;
        this.userIdentifiers = data.userIdentifiers || {};
        this.eventQueue = data.eventQueue || [];
        this.syncStatus = { ...this.syncStatus, ...data.syncStatus };
      }
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }

  private async persistData(): Promise<void> {
    try {
      const data = {
        globalUserId: this.globalUserId,
        userIdentifiers: this.userIdentifiers,
        eventQueue: this.eventQueue,
        syncStatus: this.syncStatus
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  }

  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.cookieEnabled,
      navigator.doNotTrack,
      canvas.toDataURL()
    ].join('|');

    return btoa(fingerprint).substring(0, 64);
  }

  private async collectDeviceInfo(): Promise<DeviceInfo> {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1'
    };
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.syncNow();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackEvent('page', 'visibility_change', { state: 'visible' });
        this.syncNow();
      } else {
        this.trackEvent('page', 'visibility_change', { state: 'hidden' });
      }
    });

    // Before unload - sync remaining events
    window.addEventListener('beforeunload', () => {
      this.syncNow(true); // Force sync
    });

    // Page interactions
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      this.trackEvent('interaction', 'click', {
        elementId: target.id,
        elementClass: target.className,
        elementTag: target.tagName.toLowerCase(),
        elementText: target.textContent?.substring(0, 100),
        pageX: e.pageX,
        pageY: e.pageY
      });
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      this.trackEvent('interaction', 'form_submit', {
        formId: form.id,
        formClass: form.className,
        formAction: form.action,
        formMethod: form.method
      });
    });

    // Scroll tracking
    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.trackEvent('interaction', 'scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
        });
      }, 250);
    });
  }

  private startSyncProcess(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncNow();
    }, this.SYNC_INTERVAL);
  }

  // Public API methods
  public async identifyUser(identifiers: UserIdentifiers): Promise<void> {
    try {
      this.userIdentifiers = { ...this.userIdentifiers, ...identifiers };
      
      const response = await fetch('/api/analytics/identify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          ...identifiers
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.globalUserId = data.user.id;
        this.deviceFingerprint = data.fingerprint;
        
        this.trackEvent('user', 'identified', {
          globalUserId: this.globalUserId,
          method: identifiers.email ? 'email' : identifiers.phone ? 'phone' : 'fingerprint'
        });

        await this.persistData();
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  public trackEvent(eventType: string, eventAction: string, metadata: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: randomUUID(),
      sessionId: this.sessionId,
      globalUserId: this.globalUserId,
      eventType,
      eventAction,
      pageSlug: window.location.pathname.substring(1) || 'home',
      elementId: metadata.elementId,
      metadata,
      clientTimestamp: new Date(),
      deviceType: this.getDeviceType(),
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer
      }
    };

    this.eventQueue.push(event);
    this.syncStatus.pendingEvents = this.eventQueue.length;

    // Auto-sync if queue is getting large
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.syncNow();
    }

    this.persistData();
  }

  public trackPageView(pageSlug?: string): void {
    this.trackEvent('page', 'page_view', {
      pageSlug: pageSlug || window.location.pathname.substring(1) || 'home',
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  public trackConversion(conversionType: string, value?: number, metadata: Record<string, any> = {}): void {
    this.trackEvent('conversion', conversionType, {
      value,
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }

  public trackInteraction(interactionType: string, elementId?: string, metadata: Record<string, any> = {}): void {
    this.trackEvent('interaction', interactionType, {
      elementId,
      ...metadata
    });
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private async syncNow(force: boolean = false): Promise<void> {
    if (!this.syncStatus.isOnline && !force) return;
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToSync = this.eventQueue.splice(0, this.BATCH_SIZE);
      
      const response = await fetch('/api/analytics/events/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSync
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.syncStatus.lastSync = new Date();
        this.syncStatus.retryCount = 0;
        this.syncStatus.pendingEvents = this.eventQueue.length;
        
        console.log(`Synced ${data.processed} events, batchId: ${data.batchId}`);
      } else {
        // Put events back in queue on failure
        this.eventQueue.unshift(...eventsToSync);
        throw new Error(`Sync failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.syncStatus.retryCount++;
      
      if (this.syncStatus.retryCount < this.MAX_RETRIES) {
        this.retryTimeout = setTimeout(() => {
          this.syncNow(force);
        }, this.RETRY_DELAY * this.syncStatus.retryCount);
      }
    }

    await this.persistData();
  }

  // Utility methods
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getGlobalUserId(): number | undefined {
    return this.globalUserId;
  }

  public getDeviceFingerprint(): string | undefined {
    return this.deviceFingerprint;
  }

  public forceSyncNow(): Promise<void> {
    return this.syncNow(true);
  }

  public clearQueue(): void {
    this.eventQueue = [];
    this.syncStatus.pendingEvents = 0;
    this.persistData();
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    // Final sync
    this.syncNow(true);
  }
}

// Create singleton instance
export const analyticsSync = new AnalyticsSync();

// Export types for TypeScript support
export type { AnalyticsEvent, DeviceInfo, UserIdentifiers, SyncStatus };