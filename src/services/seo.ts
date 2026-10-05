import { ProductItem } from '../types';
import {
  DynamicKeywords,
  SeoMetadata,
  CategorySeoTheme,
  SearchConsoleQueryMetric,
  SeoOpportunity,
  SeoAuditReport
} from '../types/seo';

export const SITE_BASE_URL = 'https://sainiwalaa-deals-27762.web.app';
export const SITE_NAME = 'SAINIWALAA Deals';

// Common stop words (English and Hinglish/Indian e-commerce noise) to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'in', 'on', 'at', 'to',
  'from', 'by', 'of', 'is', 'it', 'this', 'that', 'are', 'as', 'be', 'was',
  'all', 'ke', 'ka', 'ki', 'ko', 'se', 'me', 'aur', 'hai', 'par', 'bhi',
  'for', 'pack', 'set', 'pcs', 'piece', 'size', 'color', 'colour', 'brand',
  'new', 'hot', 'deal', 'offer', 'best', 'top', 'buy', 'online', 'free'
]);

/**
 * Normalizes text to lower-case single-spaced tokens
 */
function cleanText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts distinct, meaningful words from product text
 */
function extractMeaningfulWords(text: string): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];
  return cleaned
    .split(/\s+/)
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));
}

/**
 * 1. DYNAMIC KEYWORD SYSTEM: Extract conservative keywords strictly from REAL product data
 */
export function extractProductKeywords(product: ProductItem): DynamicKeywords {
  if (!product) {
    return {
      mainKeyword: '',
      secondaryKeywords: [],
      longTailPhrases: [],
      categoryPhrases: [],
      shoppingIntentPhrases: [],
      allKeywords: []
    };
  }

  const nameWords = extractMeaningfulWords(product.NAME);
  const descWords = extractMeaningfulWords(product.DESCRIPTION);
  const keywordsColWords = extractMeaningfulWords(product.KEYWORDS);
  const categoryWords = product.categories
    ? product.categories.flatMap(c => extractMeaningfulWords(c))
    : extractMeaningfulWords(product.CATEGORY);

  // 1. Main Keyword: Primary core descriptive phrase (first 2-3 significant words of product title)
  const mainKeyword = nameWords.slice(0, 3).join(' ') || cleanText(product.NAME).slice(0, 30);

  // 2. Secondary Keywords: 2-word combinations present in title or keywords column
  const secondarySet = new Set<string>();
  for (let i = 0; i < nameWords.length - 1; i++) {
    secondarySet.add(`${nameWords[i]} ${nameWords[i + 1]}`);
  }
  for (let i = 0; i < keywordsColWords.length - 1; i++) {
    secondarySet.add(`${keywordsColWords[i]} ${keywordsColWords[i + 1]}`);
  }
  const secondaryKeywords = Array.from(secondarySet).slice(0, 5);

  // 3. Long-tail Phrases: 3-4 word real phrases from title & description
  const longTailSet = new Set<string>();
  if (nameWords.length >= 3) {
    longTailSet.add(nameWords.slice(0, 4).join(' '));
  }
  for (let i = 0; i < descWords.length - 2; i++) {
    const phrase = `${descWords[i]} ${descWords[i + 1]} ${descWords[i + 2]}`;
    longTailSet.add(phrase);
    if (longTailSet.size >= 5) break;
  }
  const longTailPhrases = Array.from(longTailSet).slice(0, 4);

  // 4. Category-related phrases
  const categoryPhrases = Array.from(
    new Set([
      product.CATEGORY,
      ...(product.categories || []),
      ...categoryWords
    ].filter(Boolean))
  );

  // 5. Shopping Intent Phrases (built strictly around real keywords and marketplace)
  const shoppingIntentPhrases: string[] = [];
  if (mainKeyword) {
    shoppingIntentPhrases.push(`${mainKeyword} online`);
    shoppingIntentPhrases.push(`buy ${mainKeyword} on ${product.marketplace}`);
    if (product.PRICE > 0) {
      shoppingIntentPhrases.push(`${mainKeyword} under ${Math.ceil(product.PRICE / 100) * 100}`);
    }
    if (product.DISCOUNT > 0) {
      shoppingIntentPhrases.push(`${mainKeyword} discount deal`);
    }
  }

  // Combined keywords for metadata
  const allKeywords = Array.from(
    new Set([
      mainKeyword,
      ...secondaryKeywords,
      ...longTailPhrases,
      ...categoryPhrases,
      ...shoppingIntentPhrases,
      product.marketplace
    ].filter(Boolean))
  );

  return {
    mainKeyword,
    secondaryKeywords,
    longTailPhrases,
    categoryPhrases,
    shoppingIntentPhrases,
    allKeywords
  };
}

/**
 * 2. CATEGORY SEO: Analyze actual products belonging to a category to identify natural keyword themes
 */
export function analyzeCategoryKeywords(category: string, products: ProductItem[]): CategorySeoTheme {
  const matching = products.filter(p =>
    p.categories.some(c => c.toLowerCase() === category.toLowerCase()) ||
    p.CATEGORY.toLowerCase().includes(category.toLowerCase())
  );

  if (matching.length === 0) {
    return {
      category,
      topTerms: [category],
      productCount: 0,
      averageDiscount: 0,
      priceRange: { min: 0, max: 0 },
      sampleKeywords: [category]
    };
  }

  // Compute term frequencies
  const freqMap = new Map<string, number>();
  let totalDiscount = 0;
  let minPrice = Infinity;
  let maxPrice = 0;

  matching.forEach(p => {
    totalDiscount += p.DISCOUNT || 0;
    if (p.PRICE > 0) {
      if (p.PRICE < minPrice) minPrice = p.PRICE;
      if (p.PRICE > maxPrice) maxPrice = p.PRICE;
    }

    const words = extractMeaningfulWords(`${p.NAME} ${p.KEYWORDS}`);
    words.forEach(w => {
      freqMap.set(w, (freqMap.get(w) || 0) + 1);
    });
  });

  const sortedTerms = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 8);

  const sampleKeywords = [
    category,
    ...sortedTerms.slice(0, 5).map(term => `${term} ${category}`),
    `${category} deals online`,
    `best ${category} in India`
  ];

  return {
    category,
    topTerms: sortedTerms,
    productCount: matching.length,
    averageDiscount: Math.round(totalDiscount / matching.length),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice
    },
    sampleKeywords
  };
}

/**
 * 3. PRODUCT SEO: Generates dynamic metadata, breadcrumbs and Schema.org Product structured data
 */
export function generateProductSeo(product: ProductItem): SeoMetadata {
  const keywords = extractProductKeywords(product);
  const primaryCategory = product.categories[0] || product.CATEGORY || 'Deals';
  const canonicalUrl = `${SITE_BASE_URL}/?product=${encodeURIComponent(product.id)}`;

  // Construct honest, compelling SEO title (within 60 chars recommended)
  const title = `${product.NAME} - Buy on ${product.marketplace} | ${SITE_NAME}`;

  // Honest Meta Description with real price, marketplace, and features (within 155 chars)
  const priceInfo = product.PRICE > 0 ? `at ₹${product.PRICE}` : '';
  const discountInfo = product.DISCOUNT > 0 ? `(${product.DISCOUNT}% OFF)` : '';
  const descSnippet = product.DESCRIPTION && product.DESCRIPTION !== '...'
    ? product.DESCRIPTION.replace(/\s+/g, ' ').slice(0, 80)
    : `Verified deal on ${product.marketplace}`;
  const description = `Buy ${product.NAME} ${priceInfo} ${discountInfo} online on ${product.marketplace}. ${descSnippet}. Verified by SAINIWALAA Deals.`.slice(0, 160);

  // Breadcrumbs
  const breadcrumb = [
    { name: 'Home', url: `${SITE_BASE_URL}/` },
    { name: primaryCategory, url: `${SITE_BASE_URL}/?category=${encodeURIComponent(primaryCategory)}` },
    { name: product.NAME, url: canonicalUrl }
  ];

  // Schema.org Product structured data (100% honest, zero fake reviews/ratings)
  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.NAME,
        image: product.IMAGE ? [product.IMAGE] : undefined,
        description: product.DESCRIPTION && product.DESCRIPTION !== '...' ? product.DESCRIPTION : description,
        category: primaryCategory,
        brand: {
          '@type': 'Brand',
          name: product.marketplace
        },
        offers: {
          '@type': 'Offer',
          url: product.LINK || canonicalUrl,
          priceCurrency: 'INR',
          price: product.PRICE > 0 ? product.PRICE : undefined,
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: product.marketplace
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((b, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: b.name,
          item: b.url
        }))
      }
    ]
  };

  return {
    title,
    description,
    keywords: keywords.allKeywords,
    canonicalUrl,
    ogImage: product.IMAGE || `${SITE_BASE_URL}/og-image.svg`,
    ogType: 'product',
    breadcrumb,
    structuredData
  };
}

/**
 * 4. CATEGORY SEO: Generates dynamic metadata for a specific category
 */
export function generateCategorySeo(category: string, products: ProductItem[]): SeoMetadata {
  const theme = analyzeCategoryKeywords(category, products);
  const canonicalUrl = `${SITE_BASE_URL}/?category=${encodeURIComponent(category)}`;
  const title = `${category} Deals & Offers | Best Prices Online - ${SITE_NAME}`;

  const topTermsText = theme.topTerms.length > 0
    ? `including ${theme.topTerms.slice(0, 4).join(', ')}`
    : '';
  const discountText = theme.averageDiscount > 0
    ? `with up to ${theme.averageDiscount}% average discount`
    : '';

  const description = `Explore ${theme.productCount} verified ${category} deals ${topTermsText} across Amazon, Flipkart & Meesho ${discountText}. Smart shopping picks on SAINIWALAA Deals.`.slice(0, 160);

  const breadcrumb = [
    { name: 'Home', url: `${SITE_BASE_URL}/` },
    { name: category, url: canonicalUrl }
  ];

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${category} Deals`,
        description,
        url: canonicalUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: products
            .filter(p => p.categories.some(c => c.toLowerCase() === category.toLowerCase()))
            .slice(0, 10)
            .map((p, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${SITE_BASE_URL}/?product=${encodeURIComponent(p.id)}`,
              name: p.NAME
            }))
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((b, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: b.name,
          item: b.url
        }))
      }
    ]
  };

  return {
    title,
    description,
    keywords: theme.sampleKeywords,
    canonicalUrl,
    ogImage: `${SITE_BASE_URL}/og-image.svg`,
    ogType: 'website',
    breadcrumb,
    structuredData
  };
}

/**
 * 5. HOMEPAGE SEO: Generates dynamic metadata for the main store
 */
export function generateHomeSeo(products: ProductItem[]): SeoMetadata {
  const canonicalUrl = `${SITE_BASE_URL}/`;
  const title = 'SAINIWALAA Deals - Amazon, Flipkart & Meesho Best Deals';
  const description = `Discover ${products.length > 0 ? `${products.length}+ ` : ''}verified deals, trending products and smart shopping discounts across Amazon, Flipkart and Meesho with SAINIWALAA Deals.`;

  const topCategories = Array.from(new Set(products.flatMap(p => p.categories))).slice(0, 6);

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: canonicalUrl,
        description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_BASE_URL}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: canonicalUrl,
        logo: `${SITE_BASE_URL}/favicon.svg`
      }
    ]
  };

  return {
    title,
    description,
    keywords: [
      'deals',
      'amazon deals',
      'flipkart offers',
      'meesho shopping',
      'best discounts',
      'online shopping India',
      ...topCategories
    ],
    canonicalUrl,
    ogImage: `${SITE_BASE_URL}/og-image.svg`,
    ogType: 'website',
    breadcrumb: [{ name: 'Home', url: canonicalUrl }],
    structuredData
  };
}

/**
 * Applies dynamic SEO tags directly into the browser DOM
 */
export function applySeoToDom(seo: SeoMetadata) {
  if (typeof document === 'undefined') return;

  // 1. Page Title
  document.title = seo.title;

  // 2. Helper to set or create meta tag
  const setMeta = (nameOrProp: string, value: string, isProperty: boolean = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, nameOrProp);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };

  // Meta Description & Keywords
  setMeta('description', seo.description);
  setMeta('keywords', seo.keywords.join(', '));

  // Canonical URL
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', seo.canonicalUrl);

  // Open Graph
  setMeta('og:title', seo.title, true);
  setMeta('og:description', seo.description, true);
  setMeta('og:url', seo.canonicalUrl, true);
  setMeta('og:image', seo.ogImage, true);
  setMeta('og:type', seo.ogType, true);
  setMeta('og:site_name', SITE_NAME, true);

  // Twitter
  setMeta('twitter:title', seo.title);
  setMeta('twitter:description', seo.description);
  setMeta('twitter:image', seo.ogImage);

  // 3. Schema.org JSON-LD Script Injection
  const SCRIPT_ID = 'sainiwalaa-seo-jsonld';
  let scriptEl = document.getElementById(SCRIPT_ID);
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = SCRIPT_ID;
    scriptEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(seo.structuredData, null, 2);
}

/**
 * Generates sitemap.xml dynamically from real products and categories.
 * Excludes query URLs like ?search=, ?store=, ?collection=.
 */
export function generateSitemapXml(products: ProductItem[], categories: string[]): string {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Real Categories
  categories
    .filter(c => c && c !== 'All')
    .forEach(cat => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_BASE_URL}/?category=${encodeURIComponent(cat)}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

  // 3. Real Indexable Products
  products.forEach(p => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_BASE_URL}/?product=${encodeURIComponent(p.id)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}

/**
 * 6. SEARCH CONSOLE ANALYSIS ENGINE:
 * Ready to ingest real Search Console exports (queries, impressions, clicks, CTR, position)
 * to spot high-impression low-CTR queries and ranking opportunities.
 */
export function analyzeSearchConsoleMetrics(
  metrics: SearchConsoleQueryMetric[],
  products: ProductItem[]
): SeoAuditReport {
  const opportunities: SeoOpportunity[] = [];

  metrics.forEach(item => {
    const { query, clicks, impressions, ctr, position } = item;

    // Opportunity 1: High Impressions (> 100) with Low CTR (< 2.5%) -> Title / snippet optimization
    if (impressions >= 100 && ctr < 0.025) {
      opportunities.push({
        type: 'high_impression_low_ctr',
        query,
        impressions,
        currentCtr: ctr,
        currentPosition: position,
        suggestedAction: `Refine title and meta description to increase click-through rate for query: "${query}"`,
        targetEntity: 'homepage',
        entityIdentifier: query
      });
    }

    // Opportunity 2: Striking Distance (Rank 4 - 20) -> Potential to reach top 3 with content enrichment
    if (position >= 4 && position <= 20 && impressions >= 50) {
      // Find matching product
      const matchingProduct = products.find(p =>
        cleanText(p.NAME).includes(cleanText(query)) ||
        cleanText(p.KEYWORDS).includes(cleanText(query))
      );

      opportunities.push({
        type: 'striking_distance',
        query,
        impressions,
        currentPosition: position,
        suggestedAction: matchingProduct
          ? `Product "${matchingProduct.NAME}" ranks at #${position.toFixed(1)}. Enrich product description with "${query}".`
          : `Category query "${query}" ranks at #${position.toFixed(1)}. Strengthen internal linking for this category.`,
        targetEntity: matchingProduct ? 'product' : 'category',
        entityIdentifier: matchingProduct ? matchingProduct.id : query
      });
    }
  });

  return {
    analyzedAt: new Date().toISOString(),
    totalProductsIndexed: products.length,
    opportunities
  };
}
