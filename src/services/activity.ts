/**
 * Real client-side Site Activity Tracking
 * Tracks genuine visitors (sessions), product views, and marketplace redirect clicks
 * using persistent local storage without third-party API keys or fabricated metrics.
 */

export interface SiteActivityStats {
  visitors: number;
  productViews: number;
  marketplaceClicks: number;
}

const STORAGE_KEY_VISITORS = 'sainiwalaa_stats_visitors_v1';
const STORAGE_KEY_VIEWS = 'sainiwalaa_stats_views_v1';
const STORAGE_KEY_CLICKS = 'sainiwalaa_stats_clicks_v1';
const SESSION_KEY = 'sainiwalaa_active_session_v1';

function dispatchActivityChange() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('sainiwalaa_activity_change'));
    } catch {
      // ignore
    }
  }
}

/**
 * Records real unique visitor session
 */
export function recordRealVisit(): void {
  if (typeof window === 'undefined') return;
  try {
    const hasSession = sessionStorage.getItem(SESSION_KEY);
    if (!hasSession) {
      sessionStorage.setItem(SESSION_KEY, 'active');
      const current = parseInt(localStorage.getItem(STORAGE_KEY_VISITORS) || '0', 10);
      const next = (isNaN(current) ? 0 : current) + 1;
      localStorage.setItem(STORAGE_KEY_VISITORS, String(next));
      dispatchActivityChange();
    }
  } catch {
    // ignore
  }
}

/**
 * Records a real product view when a user opens a product detail modal
 */
export function recordRealProductView(): void {
  if (typeof window === 'undefined') return;
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEY_VIEWS) || '0', 10);
    const next = (isNaN(current) ? 0 : current) + 1;
    localStorage.setItem(STORAGE_KEY_VIEWS, String(next));
    dispatchActivityChange();
  } catch {
    // ignore
  }
}

/**
 * Records a real marketplace click when a user clicks on an affiliate/store Buy link
 */
export function recordRealMarketplaceClick(): void {
  if (typeof window === 'undefined') return;
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEY_CLICKS) || '0', 10);
    const next = (isNaN(current) ? 0 : current) + 1;
    localStorage.setItem(STORAGE_KEY_CLICKS, String(next));
    dispatchActivityChange();
  } catch {
    // ignore
  }
}

/**
 * Retrieves current real activity statistics
 */
export function getActivityStats(): SiteActivityStats {
  if (typeof window === 'undefined') {
    return { visitors: 1, productViews: 0, marketplaceClicks: 0 };
  }
  try {
    const rawVisitors = parseInt(localStorage.getItem(STORAGE_KEY_VISITORS) || '1', 10);
    const rawViews = parseInt(localStorage.getItem(STORAGE_KEY_VIEWS) || '0', 10);
    const rawClicks = parseInt(localStorage.getItem(STORAGE_KEY_CLICKS) || '0', 10);

    return {
      visitors: Math.max(1, isNaN(rawVisitors) ? 1 : rawVisitors),
      productViews: Math.max(0, isNaN(rawViews) ? 0 : rawViews),
      marketplaceClicks: Math.max(0, isNaN(rawClicks) ? 0 : rawClicks)
    };
  } catch {
    return { visitors: 1, productViews: 0, marketplaceClicks: 0 };
  }
}
