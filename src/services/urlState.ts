import { CollectionFilter, Marketplace, ProductItem } from '../types';

const LAST_BROWSING_STATE_KEY = 'sainiwalaa_browsing_state_v1';
const MAX_STATE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ParsedUrlState {
  productId: string | null;
  search: string;
  category: string;
  marketplace: Marketplace | 'All';
  collection: CollectionFilter;
  hasQueryParams: boolean;
}

export interface SavedBrowsingState {
  search?: string;
  category?: string;
  marketplace?: Marketplace | 'All';
  collection?: CollectionFilter;
  updatedAt?: number;
}

/**
 * Parses the current window.location.search for valid state parameters
 */
export function parseUrlState(): ParsedUrlState {
  if (typeof window === 'undefined') {
    return {
      productId: null,
      search: '',
      category: 'All',
      marketplace: 'All',
      collection: 'ALL',
      hasQueryParams: false
    };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const hasQueryParams = window.location.search.length > 1;

    // 1. Product identifier (?product=... or ?id=... or ?deal=...)
    const rawProductId = params.get('product') || params.get('id') || params.get('deal');
    const productId = rawProductId ? decodeURIComponent(rawProductId).trim() : null;

    // 2. Search query (?search=... or ?q=...)
    const rawSearch = params.get('search') || params.get('q');
    const search = rawSearch ? decodeURIComponent(rawSearch).trim() : '';

    // 3. Category (?category=... or ?cat=...)
    const rawCat = params.get('category') || params.get('cat');
    const category = rawCat ? decodeURIComponent(rawCat).trim() : 'All';

    // 4. Marketplace / Store (?store=... or ?market=... or ?marketplace=...)
    const rawMarket = params.get('store') || params.get('marketplace') || params.get('market');
    let marketplace: Marketplace | 'All' = 'All';
    if (rawMarket) {
      const m = decodeURIComponent(rawMarket).trim().toLowerCase();
      if (m.includes('amazon')) marketplace = 'Amazon';
      else if (m.includes('flipkar') || m.includes('fktr')) marketplace = 'Flipkart';
      else if (m.includes('meesho')) marketplace = 'Meesho';
      else if (m.includes('ajio')) marketplace = 'Ajio';
      else if (m.includes('myntr')) marketplace = 'Myntra';
      else if (m === 'all') marketplace = 'All';
    }

    // 5. Collection filter (?collection=... or ?filter=...)
    const rawCol = params.get('collection') || params.get('filter');
    let collection: CollectionFilter = 'ALL';
    if (rawCol) {
      const c = decodeURIComponent(rawCol).trim().toUpperCase();
      if (['ALL', 'TRENDING', 'BEST_DISCOUNTS', 'TOP_PICKS', 'UNDER_500'].includes(c)) {
        collection = c as CollectionFilter;
      }
    }

    return {
      productId,
      search,
      category: category || 'All',
      marketplace,
      collection,
      hasQueryParams
    };
  } catch {
    return {
      productId: null,
      search: '',
      category: 'All',
      marketplace: 'All',
      collection: 'ALL',
      hasQueryParams: false
    };
  }
}

/**
 * Saves non-product browsing state to localStorage
 */
export function saveBrowsingState(state: {
  search: string;
  category: string;
  marketplace: Marketplace | 'All';
  collection: CollectionFilter;
}) {
  if (typeof window === 'undefined') return;
  try {
    const payload: SavedBrowsingState = {
      search: state.search,
      category: state.category,
      marketplace: state.marketplace,
      collection: state.collection,
      updatedAt: Date.now()
    };
    localStorage.setItem(LAST_BROWSING_STATE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Retrieves valid saved browsing state from localStorage.
 * Guaranteed NEVER to restore a product modal on clean homepage visits.
 */
export function getSavedBrowsingState(): SavedBrowsingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_BROWSING_STATE_KEY);
    if (!raw) return null;
    const parsed: SavedBrowsingState = JSON.parse(raw);
    if (parsed && parsed.updatedAt && Date.now() - parsed.updatedAt < MAX_STATE_AGE_MS) {
      return parsed;
    }
  } catch {
    // Ignore error
  }
  return null;
}

/**
 * Builds the canonical query string for the current browsing state
 */
export function buildQueryString(options: {
  productId?: string | null;
  search?: string;
  category?: string;
  marketplace?: Marketplace | 'All';
  collection?: CollectionFilter;
}): string {
  const params = new URLSearchParams();

  if (options.productId) {
    // Decode any pre-encoded percent sequences so URLSearchParams encodes cleanly exactly once
    let cleanId = options.productId;
    try {
      while (cleanId.includes('%')) {
        const decoded = decodeURIComponent(cleanId);
        if (decoded === cleanId) break;
        cleanId = decoded;
      }
    } catch {
      // Keep as-is if decoding fails
    }
    params.set('product', cleanId);
  }
  if (options.search && options.search.trim()) {
    params.set('search', options.search.trim());
  }
  if (options.category && options.category !== 'All') {
    params.set('category', options.category.trim());
  }
  if (options.marketplace && options.marketplace !== 'All') {
    params.set('store', options.marketplace);
  }
  if (options.collection && options.collection !== 'ALL') {
    params.set('collection', options.collection);
  }

  const str = params.toString();
  return str ? `?${str}` : window.location.pathname;
}

/**
 * Safely finds a product by ID in a product list, supporting multiple match criteria
 */
export function findProductById(products: ProductItem[], targetId: string | null): ProductItem | null {
  if (!targetId || !products || products.length === 0) return null;

  const normalizedTarget = targetId.trim();

  // 1. Single decode
  let decodedTarget = normalizedTarget;
  try {
    decodedTarget = decodeURIComponent(normalizedTarget);
  } catch {}

  // 2. Fully decode in case of legacy double-encoded parameters (%2520 -> %20 -> space)
  let fullyDecoded = decodedTarget;
  try {
    while (fullyDecoded.includes('%')) {
      const d = decodeURIComponent(fullyDecoded);
      if (d === fullyDecoded) break;
      fullyDecoded = d;
    }
  } catch {}

  // Direct match on ID
  const directMatch = products.find(p =>
    p.id === normalizedTarget ||
    p.id === decodedTarget ||
    p.id === fullyDecoded ||
    decodeURIComponent(p.id) === decodedTarget ||
    decodeURIComponent(p.id) === fullyDecoded
  );
  if (directMatch) return directMatch;

  // Row index match (e.g. deal_7_... or deal_7)
  const rowMatch = normalizedTarget.match(/^deal_(\d+)/i);
  if (rowMatch) {
    const row = parseInt(rowMatch[1], 10);
    const byRow = products.find(p => p._ROW === row);
    if (byRow) return byRow;
  }

  // Name or slug match
  const targetLower = fullyDecoded.toLowerCase();
  const byName = products.find(p => {
    const pName = p.NAME.toLowerCase();
    return pName === targetLower || pName.includes(targetLower.replace(/^deal_\d+_?/, ''));
  });
  if (byName) return byName;

  return null;
}
