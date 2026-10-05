import { ProductItem } from '../types';
import { recordRealVisit, recordRealProductView, recordRealMarketplaceClick } from './activity';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-2RKS0CB868';

/**
 * Safe wrapper for gtag event dispatching
 */
function sendEvent(eventName: string, params: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch {
    // Gracefully ignore analytics delivery issues
  }
}

/**
 * 1. SPA page_view event
 */
export function trackPageView(pageTitle: string, pagePath: string) {
  try {
    recordRealVisit();
    const fullUrl = `${window.location.origin}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: fullUrl,
        page_path: pagePath,
        send_to: GA_MEASUREMENT_ID
      });
    }
  } catch {
    // ignore
  }
}

/**
 * 2. search event
 */
export function trackSearch(searchTerm: string) {
  const term = (searchTerm || '').trim();
  if (!term) return;
  sendEvent('search', {
    search_term: term
  });
}

/**
 * 3. view_item event (Product detail modal)
 */
export function trackViewItem(product: ProductItem) {
  if (!product) return;
  recordRealProductView();
  sendEvent('view_item', {
    currency: 'INR',
    value: product.PRICE || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.NAME,
        item_brand: product.marketplace,
        item_category: product.categories[0] || 'Deals',
        price: product.PRICE || 0
      }
    ]
  });
}

/**
 * 4. select_item event (Product card click)
 */
export function trackSelectItem(product: ProductItem, listName: string = 'Deals Grid') {
  if (!product) return;
  sendEvent('select_item', {
    item_list_name: listName,
    items: [
      {
        item_id: product.id,
        item_name: product.NAME,
        item_brand: product.marketplace,
        item_category: product.categories[0] || 'Deals',
        price: product.PRICE || 0
      }
    ]
  });
}

/**
 * 5. marketplace_click event (Buy Now click on Amazon, Flipkart, Meesho, etc.)
 */
export function trackMarketplaceClick(product: ProductItem, source: string = 'product_card') {
  if (!product) return;
  recordRealMarketplaceClick();
  sendEvent('marketplace_click', {
    marketplace: product.marketplace,
    item_id: product.id,
    item_name: product.NAME,
    price: product.PRICE || 0,
    source
  });
}

/**
 * 6. category_select event
 */
export function trackCategorySelect(category: string) {
  if (!category) return;
  sendEvent('category_select', {
    category
  });
}

/**
 * 7. marketplace_filter event
 */
export function trackMarketplaceFilter(marketplace: string) {
  if (!marketplace) return;
  sendEvent('marketplace_filter', {
    marketplace
  });
}

/**
 * 8. wishlist_add event
 */
export function trackWishlistAdd(product: ProductItem) {
  if (!product) return;
  sendEvent('wishlist_add', {
    item_id: product.id,
    item_name: product.NAME,
    marketplace: product.marketplace,
    price: product.PRICE || 0
  });
}

/**
 * 9. wishlist_remove event
 */
export function trackWishlistRemove(product: ProductItem) {
  if (!product) return;
  sendEvent('wishlist_remove', {
    item_id: product.id,
    item_name: product.NAME,
    marketplace: product.marketplace
  });
}
