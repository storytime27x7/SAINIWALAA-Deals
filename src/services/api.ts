import { ApiResponse, FooterPage, HeaderCategory, HeroItem, Marketplace, ProductItem } from '../types';
import { FALLBACK_API_DATA } from './fallbackData';

const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzA_hAO03gKPWIJ0UwhREB62hEbUusiyqZPO1_yrlmkGfOYsvnh46KZi3CC4rqANrzE/exec';
const CACHE_KEY = 'sainiwalaa_deals_cache_v1';
const CACHE_TIME_KEY = 'sainiwalaa_deals_cache_time';
const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

export function formatIndianCurrency(amount: number): string {
  if (!amount || amount <= 0) return '₹0';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `₹${Math.round(amount)}`;
  }
}

export function detectMarketplace(market: string): Marketplace {
  const m = (market || '').toLowerCase();
  if (m.includes('amazon')) return 'Amazon';
  if (m.includes('flipkar') || m.includes('fktr')) return 'Flipkart';
  if (m.includes('meesho')) return 'Meesho';
  if (m.includes('ajio') || m.includes('ajo')) return 'Ajio';
  if (m.includes('myntr')) return 'Myntra';
  return 'Other';
}

function parseNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  const cleaned = String(val).replace(/[₹,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDiscount(val: any, price: number, mrp: number): number {
  if (val !== null && val !== undefined && val !== '') {
    const cleaned = String(val).replace('%', '').trim();
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      if (num <= 1 && num > 0) {
        return Math.round(num * 100);
      }
      return Math.round(num);
    }
  }
  if (mrp > price && price > 0) {
    return Math.min(99, Math.round(((mrp - price) / mrp) * 100));
  }
  return 0;
}

function splitCategories(catStr: string): string[] {
  if (!catStr || typeof catStr !== 'string') return ['All Deals'];
  const split = catStr.split(/[|,\/>\\]+/).map(s => s.trim()).filter(Boolean);
  return split.length > 0 ? split : ['All Deals'];
}

export function parseRawData(data: any): ApiResponse {
  const products: ProductItem[] = [];
  const rawProducts = Array.isArray(data?.products) ? data.products : [];

  rawProducts.forEach((p: any, idx: number) => {
    const show = String(p.SHOW || 'YES').trim().toUpperCase() !== 'NO';
    if (!show) return;

    const name = String(p.NAME || '').trim();
    if (!name) return;

    const price = parseNumber(p.PRICE);
    const mrp = parseNumber(p.MRP);
    const discount = parseDiscount(p.DISCOUNT, price, mrp);
    const market = String(p.MARKET || '').trim();
    const rawCategory = String(p.CATEGORY || '').trim();
    const categories = splitCategories(rawCategory);
    const isTop = String(p.TOP || '').trim().toUpperCase() === 'YES';
    const rowIndex = Number(p._ROW) || idx + 1;
    const savingsAmount = mrp > price ? mrp - price : 0;

    products.push({
      id: `deal_${rowIndex}_${encodeURIComponent(name.slice(0, 20))}`,
      NAME: name,
      LINK: String(p.LINK || '').trim(),
      IMAGE: String(p.IMAGE || '').trim(),
      MARKET: market,
      PRICE: price,
      MRP: mrp,
      DISCOUNT: discount,
      CATEGORY: rawCategory,
      categories,
      RATING: parseNumber(p.RATING) || 4.2,
      BADGE: String(p.BADGE || '').trim(),
      KEYWORDS: String(p.KEYWORDS || '').trim(),
      DESCRIPTION: String(p.DESCRIPTION || '').trim(),
      TOP: isTop,
      SHOW: true,
      _ROW: rowIndex,
      marketplace: detectMarketplace(market),
      formattedPrice: formatIndianCurrency(price),
      formattedMrp: mrp > 0 ? formatIndianCurrency(mrp) : '',
      savingsAmount,
      formattedSavings: savingsAmount > 0 ? formatIndianCurrency(savingsAmount) : ''
    });
  });

  const hero: HeroItem[] = [];
  const rawHero = Array.isArray(data?.hero) ? data.hero : [];
  rawHero.forEach((h: any, idx: number) => {
    if (String(h.SHOW || 'YES').trim().toUpperCase() === 'NO') return;
    hero.push({
      IMAGE: String(h.IMAGE || '').trim(),
      'COLOR CORD': String(h['COLOR CORD'] || '').trim(),
      TAXT: String(h.TAXT || '').trim(),
      LINK: String(h.LINK || '').trim(),
      SHOW: true,
      _ROW: Number(h._ROW) || idx + 1
    });
  });

  const header: HeaderCategory[] = [];
  const rawHeader = Array.isArray(data?.header) ? data.header : [];
  rawHeader.forEach((hd: any, idx: number) => {
    if (String(hd.SHOW || 'YES').trim().toUpperCase() === 'NO') return;
    const cat = String(hd.CATEGORY || '').trim();
    if (!cat) return;
    header.push({
      CATEGORY: cat,
      TEXTINFO: String(hd.TEXTINFO || '').trim(),
      PAGELINK: String(hd.PAGELINK || '').trim(),
      ICON: String(hd.ICON || '').trim(),
      SHOW: true,
      _ROW: Number(hd._ROW) || idx + 1
    });
  });

  const footer: FooterPage[] = [];
  const rawFooter = Array.isArray(data?.footer) ? data.footer : [];
  rawFooter.forEach((f: any, idx: number) => {
    if (String(f.SHOW || 'YES').trim().toUpperCase() === 'NO') return;
    const name = String(f['PAGE NAME'] || '').trim();
    if (!name) return;
    footer.push({
      'PAGE NAME': name,
      CONTENT: String(f.CONTENT || '').trim(),
      SHOW: true,
      _ROW: Number(f._ROW) || idx + 1
    });
  });

  return {
    success: true,
    products,
    hero,
    header,
    footer
  };
}

export function getCachedDeals(): ApiResponse {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parseRawData(parsed);
      }
    }
  } catch {
    // ignore
  }
  return parseRawData(FALLBACK_API_DATA);
}

export async function fetchDealsApi(options?: { timeoutMs?: number }): Promise<ApiResponse> {
  const timeoutMs = options?.timeoutMs || 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(API_ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const json = await res.json();
    const parsed = parseRawData(json);

    // Save to local cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(json));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch {
      // Storage might be full or private browsing
    }

    return parsed;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Network fetch error, using cached deals data:', err);
    return getCachedDeals();
  }
}
