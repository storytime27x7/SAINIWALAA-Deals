import { CollectionFilter, Marketplace, ProductItem } from '../types';

function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function rankProducts(
  products: ProductItem[],
  query: string = '',
  categoryFilter: string = 'All',
  marketplaceFilter: Marketplace | 'All' = 'All',
  collectionFilter: CollectionFilter = 'ALL'
): ProductItem[] {
  const normQuery = normalize(query);

  // 1. Category Filter
  let filtered = products;
  if (categoryFilter && categoryFilter !== 'All' && categoryFilter !== 'All Deals') {
    filtered = filtered.filter(p =>
      p.categories.some(c => c.toLowerCase() === categoryFilter.toLowerCase()) ||
      p.CATEGORY.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }

  // 2. Marketplace Filter
  if (marketplaceFilter && marketplaceFilter !== 'All') {
    filtered = filtered.filter(p => p.marketplace === marketplaceFilter);
  }

  // 3. Collection Filter
  if (collectionFilter === 'TOP_PICKS') {
    filtered = filtered.filter(p => p.TOP);
  } else if (collectionFilter === 'BEST_DISCOUNTS') {
    filtered = filtered.filter(p => p.DISCOUNT >= 40);
  } else if (collectionFilter === 'UNDER_500') {
    filtered = filtered.filter(p => p.PRICE > 0 && p.PRICE <= 500);
  } else if (collectionFilter === 'TRENDING') {
    filtered = filtered.filter(p => p.TOP || p.DISCOUNT >= 30);
  }

  // 4. If no query, apply default smart ranking
  if (!normQuery) {
    return [...filtered].sort((a, b) => {
      if (a.TOP !== b.TOP) return a.TOP ? -1 : 1;
      if (b.DISCOUNT !== a.DISCOUNT) return b.DISCOUNT - a.DISCOUNT;
      if (b.RATING !== a.RATING) return b.RATING - a.RATING;
      return a._ROW - b._ROW;
    });
  }

  // 5. Query ranking
  const tokens = normQuery.split(/\s+/).filter(Boolean);
  const underMatch = query.match(/(?:under|below|less than)\s*(\d+)/i);
  const maxPrice = underMatch ? parseFloat(underMatch[1]) : null;

  const stopWords = new Set(['under', 'below', 'less', 'than', 'ke', 'ka', 'ki', 'aur', 'the', 'for', 'in', 'on']);
  const queryWords = tokens.filter(t => !stopWords.has(t));

  const scored = filtered.map(product => {
    if (maxPrice !== null && product.PRICE > maxPrice) {
      return { product, score: -1 };
    }

    let score = 0;
    const nameNorm = normalize(product.NAME);
    const kwNorm = normalize(product.KEYWORDS);
    const catNorm = normalize(product.CATEGORY);
    const descNorm = normalize(product.DESCRIPTION);
    const marketNorm = normalize(product.MARKET);

    // Exact full query match
    if (nameNorm.includes(normQuery)) score += 150;
    if (kwNorm.includes(normQuery)) score += 80;
    if (catNorm.includes(normQuery)) score += 60;

    let matchedTokens = 0;
    for (const token of queryWords) {
      let matched = false;
      if (nameNorm.includes(token)) {
        score += 50;
        matched = true;
      }
      if (kwNorm.includes(token)) {
        score += 30;
        matched = true;
      }
      if (catNorm.includes(token)) {
        score += 25;
        matched = true;
      }
      if (marketNorm.includes(token)) {
        score += 20;
        matched = true;
      }
      if (descNorm.includes(token)) {
        score += 10;
        matched = true;
      }
      if (matched) matchedTokens++;
    }

    if (queryWords.length > 0 && matchedTokens === 0 && maxPrice === null) {
      return { product, score: -1 };
    }

    if (product.TOP) score += 15;
    score += Math.min(20, product.DISCOUNT / 5);
    score += Math.min(10, product.RATING * 2);
    if (product.IMAGE) score += 5;
    if (product.PRICE > 0) score += 5;

    return { product, score };
  });

  return scored
    .filter(item => item.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.product.DISCOUNT !== a.product.DISCOUNT) return b.product.DISCOUNT - a.product.DISCOUNT;
      return a.product._ROW - b.product._ROW;
    })
    .map(item => item.product);
}
