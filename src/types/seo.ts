import { ProductItem } from './index';

export interface DynamicKeywords {
  mainKeyword: string;
  secondaryKeywords: string[];
  longTailPhrases: string[];
  categoryPhrases: string[];
  shoppingIntentPhrases: string[];
  allKeywords: string[];
}

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  ogType: 'website' | 'product';
  breadcrumb: { name: string; url: string }[];
  structuredData: Record<string, any>;
}

export interface CategorySeoTheme {
  category: string;
  topTerms: string[];
  productCount: number;
  averageDiscount: number;
  priceRange: { min: number; max: number };
  sampleKeywords: string[];
}

/**
 * Structure for Search Console performance data (queries, impressions, clicks, CTR, position)
 * Ready for ingestion without storing secrets in code.
 */
export interface SearchConsoleQueryMetric {
  query: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SeoOpportunity {
  type: 'high_impression_low_ctr' | 'striking_distance' | 'missing_in_title' | 'category_expansion';
  query: string;
  currentCtr?: number;
  impressions?: number;
  currentPosition?: number;
  suggestedAction: string;
  targetEntity: 'product' | 'category' | 'homepage';
  entityIdentifier: string;
}

export interface SeoAuditReport {
  analyzedAt: string;
  totalProductsIndexed: number;
  opportunities: SeoOpportunity[];
}
