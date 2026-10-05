export type Marketplace = 'Amazon' | 'Flipkart' | 'Meesho' | 'Ajio' | 'Myntra' | 'Other';

export interface ProductItem {
  id: string;
  NAME: string;
  LINK: string;
  IMAGE: string;
  MARKET: string;
  PRICE: number;
  MRP: number;
  DISCOUNT: number;
  CATEGORY: string;
  categories: string[];
  RATING: number;
  BADGE: string;
  KEYWORDS: string;
  DESCRIPTION: string;
  TOP: boolean;
  SHOW: boolean;
  _ROW: number;
  marketplace: Marketplace;
  formattedPrice: string;
  formattedMrp: string;
  savingsAmount: number;
  formattedSavings: string;
}

export interface HeroItem {
  IMAGE: string;
  'COLOR CORD'?: string;
  TAXT: string;
  LINK: string;
  SHOW: boolean;
  _ROW: number;
}

export interface HeaderCategory {
  CATEGORY: string;
  TEXTINFO: string;
  PAGELINK: string;
  ICON: string;
  SHOW: boolean;
  _ROW: number;
}

export interface FooterPage {
  'PAGE NAME': string;
  CONTENT: string;
  SHOW: boolean;
  _ROW: number;
}

export interface ApiResponse {
  success: boolean;
  products: ProductItem[];
  hero: HeroItem[];
  header: HeaderCategory[];
  footer: FooterPage[];
}

export type CollectionFilter = 'ALL' | 'TRENDING' | 'TOP_PICKS' | 'BEST_DISCOUNTS' | 'UNDER_500';
