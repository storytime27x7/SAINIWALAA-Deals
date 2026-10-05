import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ApiResponse, CollectionFilter, Marketplace, ProductItem } from './types';
import { fetchDealsApi, getCachedDeals } from './services/api';
import { rankProducts } from './services/ranking';
import {
  trackPageView,
  trackSearch,
  trackWishlistAdd,
  trackWishlistRemove,
  trackCategorySelect
} from './services/analytics';
import {
  parseUrlState,
  buildQueryString,
  findProductById,
  saveBrowsingState,
  getSavedBrowsingState
} from './services/urlState';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { MarketplaceTabs } from './components/MarketplaceTabs';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SkeletonGrid } from './components/SkeletonGrid';
import { Footer } from './components/Footer';
import {
  Sparkles,
  Flame,
  Percent,
  RefreshCw,
  ShoppingBag,
  AlertTriangle,
  ChevronRight,
  Home,
  Heart,
  Grid,
  TrendingUp,
  CheckCircle2,
  ArrowUpDown,
  Tag
} from 'lucide-react';

export const App: React.FC = () => {
  // 1. Initial URL & Browsing State Parsing
  const initialUrlState = useMemo(() => parseUrlState(), []);
  const savedState = useMemo(() => {
    // If the user arrived with specific query parameters, URL takes priority
    if (initialUrlState.hasQueryParams) return null;
    return getSavedBrowsingState();
  }, [initialUrlState.hasQueryParams]);

  // Always initialize with cached/embedded data for zero-delay instant rendering
  const [data, setData] = useState<ApiResponse>(() => getCachedDeals());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(() => {
    const cached = getCachedDeals();
    return !cached || !cached.products || cached.products.length === 0;
  });
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Synchronized state variables
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (initialUrlState.search) return initialUrlState.search;
    return savedState?.search || '';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialUrlState.category && initialUrlState.category !== 'All') return initialUrlState.category;
    return savedState?.category || 'All';
  });

  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | 'All'>(() => {
    if (initialUrlState.marketplace && initialUrlState.marketplace !== 'All') return initialUrlState.marketplace;
    return savedState?.marketplace || 'All';
  });

  const [selectedCollection, setSelectedCollection] = useState<CollectionFilter>(() => {
    if (initialUrlState.collection && initialUrlState.collection !== 'ALL') return initialUrlState.collection;
    return savedState?.collection || 'ALL';
  });

  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'discount' | 'rating'>('relevance');

  // Product selection initialized from URL parameter if present
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(() => {
    if (initialUrlState.productId) {
      const cached = getCachedDeals();
      if (cached && cached.products) {
        return findProductById(cached.products, initialUrlState.productId);
      }
    }
    return null;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sainiwalaa_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // GA4 SPA Page View Tracking
  const lastPagePathRef = useRef<string>('');

  useEffect(() => {
    let path = '/';
    let title = 'SAINIWALAA Deals - Amazon, Flipkart & Meesho Best Deals';

    if (selectedProduct) {
      path = `/?product=${encodeURIComponent(selectedProduct.id)}`;
      title = `${selectedProduct.NAME} - SAINIWALAA Deals`;
    } else if (searchQuery.trim()) {
      path = `/?search=${encodeURIComponent(searchQuery.trim())}`;
      title = `Search: "${searchQuery.trim()}" - SAINIWALAA Deals`;
    } else if (selectedCategory !== 'All') {
      path = `/category/${encodeURIComponent(selectedCategory)}`;
      title = `${selectedCategory} Deals - SAINIWALAA Deals`;
    } else if (selectedMarketplace !== 'All') {
      path = `/store/${encodeURIComponent(selectedMarketplace)}`;
      title = `${selectedMarketplace} Deals - SAINIWALAA Deals`;
    } else if (selectedCollection !== 'ALL') {
      path = `/collection/${encodeURIComponent(selectedCollection.toLowerCase())}`;
      title = `${selectedCollection.replace('_', ' ')} Deals - SAINIWALAA Deals`;
    }

    if (lastPagePathRef.current !== path) {
      lastPagePathRef.current = path;
      trackPageView(title, path);
      document.title = title;
    }
  }, [selectedProduct, searchQuery, selectedCategory, selectedMarketplace, selectedCollection]);

  // GA4 Debounced Search Query Tracking
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return;

    const timer = setTimeout(() => {
      trackSearch(query);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Save non-product browsing state for returning users
  useEffect(() => {
    saveBrowsingState({
      search: searchQuery,
      category: selectedCategory,
      marketplace: selectedMarketplace,
      collection: selectedCollection
    });
  }, [searchQuery, selectedCategory, selectedMarketplace, selectedCollection]);

  // Browser Back / Forward History Listener (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const current = parseUrlState();

      // 1. Sync product selection
      if (current.productId) {
        const found = findProductById(data.products, current.productId);
        setSelectedProduct(found);
      } else {
        setSelectedProduct(null);
      }

      // 2. Sync filters
      setSearchQuery(current.search);
      setSelectedCategory(current.category);
      setSelectedMarketplace(current.marketplace);
      setSelectedCollection(current.collection);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [data.products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const loadData = async (force: boolean = false) => {
    if (force) setRefreshing(true);
    try {
      setNetworkError(null);
      const res = await fetchDealsApi({ timeoutMs: 10000 });
      if (res && res.products && res.products.length > 0) {
        setData(res);
        if (force) showToast('Deals refreshed successfully! ✨');

        // Check if URL has a product parameter that needs to be restored
        const currentUrlState = parseUrlState();
        if (currentUrlState.productId) {
          const found = findProductById(res.products, currentUrlState.productId);
          if (found) {
            setSelectedProduct(found);
          }
        }
      }
    } catch {
      // Non-technical error message without exposing URLs or keys
      setNetworkError('Deals update nahi ho sake. Kripya refresh karein.');
    } finally {
      setRefreshing(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Action Handlers with Browser History Synchronization
  const handleOpenProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    const newUrl = buildQueryString({
      productId: product.id,
      search: searchQuery,
      category: selectedCategory,
      marketplace: selectedMarketplace,
      collection: selectedCollection
    });
    window.history.pushState({ productId: product.id }, '', newUrl);
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    const newUrl = buildQueryString({
      productId: null,
      search: searchQuery,
      category: selectedCategory,
      marketplace: selectedMarketplace,
      collection: selectedCollection
    });
    window.history.pushState({ productId: null }, '', newUrl);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const newUrl = buildQueryString({
      productId: selectedProduct?.id || null,
      search: searchQuery,
      category: cat,
      marketplace: selectedMarketplace,
      collection: selectedCollection
    });
    window.history.pushState({}, '', newUrl);
  };

  const handleSelectMarketplace = (m: Marketplace | 'All') => {
    setSelectedMarketplace(m);
    const newUrl = buildQueryString({
      productId: selectedProduct?.id || null,
      search: searchQuery,
      category: selectedCategory,
      marketplace: m,
      collection: selectedCollection
    });
    window.history.pushState({}, '', newUrl);
  };

  const handleSelectCollection = (col: CollectionFilter) => {
    setSelectedCollection(col);
    const newUrl = buildQueryString({
      productId: selectedProduct?.id || null,
      search: searchQuery,
      category: selectedCategory,
      marketplace: selectedMarketplace,
      collection: col
    });
    window.history.pushState({}, '', newUrl);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    const newUrl = buildQueryString({
      productId: selectedProduct?.id || null,
      search: q,
      category: selectedCategory,
      marketplace: selectedMarketplace,
      collection: selectedCollection
    });
    // Replace state while typing to avoid creating hundreds of history entries
    window.history.replaceState({}, '', newUrl);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMarketplace('All');
    setSelectedCollection('ALL');
    setSortBy('relevance');

    const newUrl = buildQueryString({
      productId: selectedProduct?.id || null,
      search: '',
      category: 'All',
      marketplace: 'All',
      collection: 'ALL'
    });
    window.history.pushState({}, '', newUrl);
  };

  const handleCategoryDiscoveryClick = (cat: string) => {
    trackCategorySelect(cat);
    handleSelectCategory(cat);
  };

  const toggleWishlist = (id: string) => {
    const product = data?.products?.find(p => p.id === id);
    setWishlistIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sainiwalaa_wishlist', JSON.stringify(updated));
      } catch {}

      if (product) {
        if (exists) {
          trackWishlistRemove(product);
        } else {
          trackWishlistAdd(product);
        }
      }

      showToast(exists ? 'Removed from Wishlist' : 'Saved to Wishlist! ❤️');
      return updated;
    });
  };

  // Extract all categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    if (data?.header) {
      data.header.forEach(h => {
        if (h.CATEGORY) cats.add(h.CATEGORY);
      });
    }
    if (data?.products) {
      data.products.forEach(p => {
        p.categories.forEach(c => cats.add(c));
      });
    }
    return Array.from(cats);
  }, [data]);

  // Marketplace deal counts
  const marketplaceCounts = useMemo(() => {
    if (!data?.products) return {};
    const counts: Partial<Record<Marketplace | 'All', number>> = {
      All: data.products.length
    };
    data.products.forEach(p => {
      counts[p.marketplace] = (counts[p.marketplace] || 0) + 1;
    });
    return counts;
  }, [data]);

  // Ranked products for primary grid & search
  const filteredAndSortedProducts = useMemo(() => {
    const prods = data?.products || [];
    const ranked = rankProducts(
      prods,
      searchQuery,
      selectedCategory,
      selectedMarketplace,
      selectedCollection
    );

    // Apply sorting
    if (sortBy === 'price_low') {
      return [...ranked].sort((a, b) => a.PRICE - b.PRICE);
    } else if (sortBy === 'price_high') {
      return [...ranked].sort((a, b) => b.PRICE - a.PRICE);
    } else if (sortBy === 'discount') {
      return [...ranked].sort((a, b) => b.DISCOUNT - a.DISCOUNT);
    } else if (sortBy === 'rating') {
      return [...ranked].sort((a, b) => b.RATING - a.RATING);
    }
    return ranked;
  }, [data, searchQuery, selectedCategory, selectedMarketplace, selectedCollection, sortBy]);

  // Curated showcase subsets for Homepage sections
  const trendingDeals = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter(p => p.TOP || p.DISCOUNT >= 35).slice(0, 6);
  }, [data]);

  const bestDiscounts = useMemo(() => {
    if (!data?.products) return [];
    return [...data.products].sort((a, b) => b.DISCOUNT - a.DISCOUNT).slice(0, 6);
  }, [data]);

  const topPicks = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter(p => p.TOP).slice(0, 6);
  }, [data]);

  // Wishlist products
  const wishlistProducts = useMemo(() => {
    const prods = data?.products || [];
    return prods.filter(p => wishlistIds.includes(p.id));
  }, [data, wishlistIds]);

  const isHomeView = !searchQuery && selectedCategory === 'All' && selectedMarketplace === 'All' && selectedCollection === 'ALL';
  const isTotallyEmpty = !data || !data.products || data.products.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-200 overflow-x-hidden w-full">
      {/* 1. HEADER (ANNOUNCEMENT BAR + MAIN NAVBAR + CATEGORY SUBNAV) */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        categories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        selectedCollection={selectedCollection}
        onSelectCollection={handleSelectCollection}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        isRefreshing={refreshing}
        onRefresh={() => loadData(true)}
      />

      <main className="flex-1 w-full pb-24 md:pb-10">
        {isInitialLoading && isTotallyEmpty ? (
          /* Initial skeleton loading state */
          <SkeletonGrid />
        ) : isTotallyEmpty ? (
          /* Non-technical Error & Empty State */
          <div className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
              <ShoppingBag className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-wide">
              SAINIWALAA <span className="text-amber-500">Deals</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Amazon, Flipkart &amp; Meesho Best Deals
            </p>

            <div className="my-6 p-4 bg-amber-50 rounded-2xl border border-amber-200/60 text-left">
              <p className="text-sm font-bold text-amber-900">
                Deals load nahi ho sake.
              </p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Kripya apna internet connection check karein aur neeche diye gaye button par click karke dubara try karein.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md shadow-slate-900/10 cursor-pointer min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Retry Deals'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Non-blocking API notice if background refresh had an issue */}
            {networkError && (
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-3">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="truncate">{networkError} (Showing verified deals)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    className="font-bold underline text-amber-950 ml-2 hover:text-amber-700 flex-shrink-0 cursor-pointer p-1"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* 2. HERO & PROMOTIONS SECTION */}
            {isHomeView && data.hero && (
              <HeroSlider
                heroItems={data.hero}
                onSelectStore={(st) => handleSelectMarketplace(st as Marketplace)}
              />
            )}

            {/* 3. MARKETPLACE FILTER BAR */}
            <MarketplaceTabs
              selectedMarketplace={selectedMarketplace}
              onSelectMarketplace={handleSelectMarketplace}
              counts={marketplaceCounts}
            />

            {/* IF ON HOMEPAGE VIEW: RENDER MULTIPLE DISTINCT SECTIONS */}
            {isHomeView ? (
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-6">
                {/* SECTION 1: 🔥 TRENDING DEALS (5-6 CARDS DESKTOP, 2 MOBILE) */}
                {trendingDeals.length > 0 && (
                  <section className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
                          <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                            Trending Deals Today
                          </h2>
                          <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
                            Most viewed products and rapid price drops across Amazon, Flipkart &amp; Meesho
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCollection('TRENDING')}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group cursor-pointer p-1 min-h-[36px]"
                        aria-label="View all trending deals"
                      >
                        <span>View All Deals</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Responsive Grid: 5-6 cards on Desktop, 3-4 Tablet, 2 Mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
                      {trendingDeals.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={() => toggleWishlist(product.id)}
                          onOpenDetail={() => handleOpenProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION 2: 🏷️ BEST DISCOUNTS (UP TO 70%+ OFF) */}
                {bestDiscounts.length > 0 && (
                  <section className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                          <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                            Best Discounts (Up to 70% OFF)
                          </h2>
                          <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
                            Highest percentage discounts and maximum cash savings
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCollection('BEST_DISCOUNTS')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group cursor-pointer p-1 min-h-[36px]"
                        aria-label="Explore discount deals"
                      >
                        <span>Explore Discounts</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
                      {bestDiscounts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={() => toggleWishlist(product.id)}
                          onOpenDetail={() => handleOpenProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION 3: ⭐ TOP PICKS (CURATED BY SAINIWALAA) */}
                {topPicks.length > 0 && (
                  <section className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 rounded-3xl p-4 sm:p-6 md:p-7 border border-amber-200/70 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/50">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-xs font-bold">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                            Top Picks &amp; Editor's Choice
                          </h2>
                          <p className="text-[11px] sm:text-xs text-slate-600 hidden sm:block">
                            Hand-verified top-rated deals with genuine price cuts
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCollection('TOP_PICKS')}
                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group cursor-pointer p-1 min-h-[36px]"
                        aria-label="View all top picks"
                      >
                        <span>View All Top Picks</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
                      {topPicks.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={() => toggleWishlist(product.id)}
                          onOpenDetail={() => handleOpenProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION 4: 📂 CATEGORY DISCOVERY (BROWSE POPULAR COLLECTIONS) */}
                <section className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200/80 shadow-xs">
                  <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                        Category Discovery
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500">
                        Explore handpicked product categories
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
                    {allCategories
                      .filter(c => c !== 'All')
                      .map(cat => {
                        const count = data?.products.filter(p =>
                          p.categories.some(c => c.toLowerCase() === cat.toLowerCase())
                        ).length || 0;

                        return (
                          <div
                            key={cat}
                            onClick={() => handleCategoryDiscoveryClick(cat)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') handleCategoryDiscoveryClick(cat);
                            }}
                            className="p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 transition cursor-pointer group text-center flex flex-col items-center justify-center min-h-[100px] focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
                            aria-label={`Category ${cat}, ${count} deals`}
                          >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-amber-500 mb-2 group-hover:scale-110 transition-transform">
                              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                              {cat}
                            </h3>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {count} deals
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </section>

                {/* SECTION 5: 🛍️ MORE DEALS / COMPLETE CATALOG */}
                <section className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200/80 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                        More Curated Deals
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500">
                        Explore all verified offers from Indian retailers
                      </p>
                    </div>

                    {/* Sorting selector */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <label htmlFor="sort-select-catalog" className="text-xs text-slate-500 font-medium">Sort by:</label>
                      <select
                        id="sort-select-catalog"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        aria-label="Sort curated deals"
                        className="bg-slate-50 text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer min-h-[36px]"
                      >
                        <option value="relevance">Relevance / Top Picks</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="discount">Highest Discount</option>
                        <option value="rating">Customer Rating</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
                    {filteredAndSortedProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                        onOpenDetail={() => handleOpenProduct(product)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              /* DEDICATED SEARCH / FILTERED RESULTS VIEW */
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {/* Filter Header & Breadcrumbs */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="hover:text-slate-800 underline cursor-pointer p-0.5"
                      >
                        Home
                      </button>
                      <span>/</span>
                      <span className="text-slate-700 font-semibold truncate max-w-[200px] sm:max-w-md">
                        {searchQuery ? `Search: "${searchQuery}"` : selectedCategory !== 'All' ? selectedCategory : 'Filtered Deals'}
                      </span>
                    </nav>

                    <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                      {searchQuery
                        ? `Search Results for "${searchQuery}"`
                        : selectedCategory !== 'All'
                        ? `${selectedCategory} Deals`
                        : selectedMarketplace !== 'All'
                        ? `${selectedMarketplace} Deals`
                        : selectedCollection !== 'ALL'
                        ? `${selectedCollection.replace('_', ' ')} Deals`
                        : 'Curated Deals'}
                    </h1>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing {filteredAndSortedProducts.length} verified deals
                    </p>
                  </div>

                  {/* Actions & Sorting */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="sort-select-search" className="text-xs text-slate-500 font-medium">Sort:</label>
                      <select
                        id="sort-select-search"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        aria-label="Sort filtered results"
                        className="bg-slate-50 text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer min-h-[36px]"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="discount">Highest Discount</option>
                        <option value="rating">Customer Rating</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer min-h-[36px]"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Empty Search Results */}
                {filteredAndSortedProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center my-6 max-w-lg mx-auto shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 font-bold text-2xl">
                      🔍
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">No deals match your search</h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      Try searching with different keywords like "kurti", "shoes", "cotton", or clear filters to view all products.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer min-h-[40px]"
                    >
                      Show All Deals
                    </button>
                  </div>
                ) : (
                  /* Responsive Grid: 5-6 cards on Desktop, 3-4 on Tablet, 2 on Mobile */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
                    {filteredAndSortedProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                        onOpenDetail={() => handleOpenProduct(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* 4. FOOTER (MULTI-COLUMN DESKTOP + MOBILE ECOMMERCE FOOTER) */}
      <Footer footerPages={data?.footer || []} />

      {/* 5. MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => {
            resetFilters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold transition min-h-[44px] justify-center ${
            isHomeView ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Home page"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            handleSelectCollection('TRENDING');
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold transition min-h-[44px] justify-center ${
            selectedCollection === 'TRENDING' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Trending deals"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Trending</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition min-h-[44px] justify-center"
          aria-label="Categories"
        >
          <Grid className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold relative text-slate-400 hover:text-white transition min-h-[44px] justify-center"
          aria-label={`Wishlist (${wishlistIds.length})`}
        >
          <div className="relative">
            <Heart className={`w-4 h-4 ${wishlistIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </div>
          <span>Wishlist ({wishlistIds.length})</span>
        </button>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={handleCloseProduct}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onToggleWishlist={() => {
          if (selectedProduct) toggleWishlist(selectedProduct.id);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemove={toggleWishlist}
        onSelectProduct={p => handleOpenProduct(p)}
      />
    </div>
  );
};
