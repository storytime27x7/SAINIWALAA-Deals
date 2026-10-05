import React, { useState, useEffect, useMemo } from 'react';
import { ApiResponse, CollectionFilter, Marketplace, ProductItem } from './types';
import { fetchDealsApi, getCachedDeals } from './services/api';
import { rankProducts } from './services/ranking';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { MarketplaceTabs } from './components/MarketplaceTabs';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Footer } from './components/Footer';
import {
  Sparkles,
  Flame,
  Percent,
  IndianRupee,
  RefreshCw,
  ShoppingBag,
  AlertTriangle,
  ChevronRight,
  Home,
  Heart,
  Grid,
  TrendingUp,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Zap
} from 'lucide-react';

export const App: React.FC = () => {
  // Always initialize with cached/embedded data for zero-delay instant rendering
  const [data, setData] = useState<ApiResponse>(() => getCachedDeals());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | 'All'>('All');
  const [selectedCollection, setSelectedCollection] = useState<CollectionFilter>('ALL');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'discount' | 'rating'>('relevance');

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
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
      }
    } catch (err: any) {
      console.warn('API refresh error:', err);
      setNetworkError('Deals load nahi ho pa rahe. Retry karein.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sainiwalaa_wishlist', JSON.stringify(updated));
      } catch {}
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

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMarketplace('All');
    setSelectedCollection('ALL');
    setSortBy('relevance');
  };

  const isHomeView = !searchQuery && selectedCategory === 'All' && selectedMarketplace === 'All' && selectedCollection === 'ALL';
  const isTotallyEmpty = !data || !data.products || data.products.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-200 overflow-x-hidden w-full">
      {/* 1. HEADER (ANNOUNCEMENT BAR + MAIN NAVBAR + CATEGORY SUBNAV) */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedCollection={selectedCollection}
        onSelectCollection={setSelectedCollection}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        isRefreshing={refreshing}
        onRefresh={() => loadData(true)}
      />

      <main className="flex-1 w-full pb-20 md:pb-8">
        {isTotallyEmpty ? (
          /* Professional Fallback State if dataset is completely empty */
          <div className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
              <ShoppingBag className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-wide">
              SAINIWALAA <span className="text-amber-500">Deals</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Best Deals, Smart Shopping
            </p>

            <div className="my-6 p-4 bg-amber-50 rounded-2xl border border-amber-200/60">
              <p className="text-sm font-bold text-amber-900">
                Deals load nahi ho pa rahe. Retry karein.
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Kripya internet check karein ya refresh button dabayein.
              </p>
            </div>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md shadow-slate-900/10 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Retry'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Non-blocking API warning banner if silent refresh had an issue */}
            {networkError && (
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-3">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="truncate">{networkError} (Showing verified deals)</span>
                  </div>
                  <button
                    onClick={() => loadData(true)}
                    className="font-bold underline text-amber-950 ml-2 hover:text-amber-700 flex-shrink-0"
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
                onSelectStore={(st) => setSelectedMarketplace(st as Marketplace)}
              />
            )}

            {/* 3. MARKETPLACE FILTER BAR */}
            <MarketplaceTabs
              selectedMarketplace={selectedMarketplace}
              onSelectMarketplace={setSelectedMarketplace}
              counts={marketplaceCounts}
            />

            {/* IF ON HOMEPAGE VIEW: RENDER MULTIPLE DISTINCT SECTIONS */}
            {isHomeView ? (
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-6">
                {/* SECTION 1: 🔥 TRENDING DEALS (5-6 CARDS DESKTOP, 2 MOBILE) */}
                {trendingDeals.length > 0 && (
                  <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
                          <Flame className="w-5 h-5 fill-white text-white" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                            Trending Deals Today
                          </h2>
                          <p className="text-xs text-slate-500 hidden sm:block">
                            Most viewed products and rapid price drops across Amazon, Flipkart & Meesho
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCollection('TRENDING')}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group cursor-pointer"
                      >
                        <span>View All Deals</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Responsive Grid: 5-6 cards on Desktop, 3-4 Tablet, 2 Mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                      {trendingDeals.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={() => toggleWishlist(product.id)}
                          onOpenDetail={() => setSelectedProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION 2: 🏷️ BEST DISCOUNTS (UP TO 70%+ OFF) */}
                {bestDiscounts.length > 0 && (
                  <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                          <Percent className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                            Best Discounts (Up to 70% OFF)
                          </h2>
                          <p className="text-xs text-slate-500 hidden sm:block">
                            Highest percentage discounts and maximum cash savings
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCollection('BEST_DISCOUNTS')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group cursor-pointer"
                      >
                        <span>Explore Discounts</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                      {bestDiscounts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={() => toggleWishlist(product.id)}
                          onOpenDetail={() => setSelectedProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION 3: ⭐ TOP PICKS (CURATED BY SAINIWALAA) */}
                {topPicks.length > 0 && (
                  <section className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 rounded-3xl p-5 sm:p-7 border border-amber-200/70 shadow-xs">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-200/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-xs font-bold">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                            Top Picks & Editor's Choice
                          </h2>
                          <p className="text-xs text-slate-600 hidden sm:block">
                            Hand-verified top-rated deals with genuine price cuts
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCollection('TOP_PICKS')}
                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group cursor-pointer"
                      >
                        <span>View All Top Picks</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                      {topPicks.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={() => toggleWishlist(product.id)}
                          onOpenDetail={() => setSelectedProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION 4: 📂 CATEGORY DISCOVERY (BROWSE POPULAR COLLECTIONS) */}
                <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
                  <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        Category Discovery
                      </h2>
                      <p className="text-xs text-slate-500">
                        Explore handpicked product categories
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {allCategories
                      .filter(c => c !== 'All')
                      .map(cat => {
                        const count = data?.products.filter(p =>
                          p.categories.some(c => c.toLowerCase() === cat.toLowerCase())
                        ).length || 0;

                        return (
                          <div
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 transition cursor-pointer group text-center flex flex-col items-center justify-center"
                          >
                            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-amber-500 mb-2 group-hover:scale-110 transition-transform">
                              <Tag className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                              {cat}
                            </h4>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {count} deals
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </section>

                {/* SECTION 5: 🛍️ MORE DEALS / COMPLETE CATALOG */}
                <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        More Curated Deals
                      </h2>
                      <p className="text-xs text-slate-500">
                        Explore all verified offers from Indian retailers
                      </p>
                    </div>

                    {/* Sorting selector */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="bg-slate-50 text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="relevance">Relevance / Top Picks</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="discount">Highest Discount</option>
                        <option value="rating">Customer Rating</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                    {filteredAndSortedProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                        onOpenDetail={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              /* DEDICATED SEARCH / FILTERED RESULTS VIEW */
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {/* Filter Header & Breadcrumbs */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <button onClick={resetFilters} className="hover:text-slate-800 underline cursor-pointer">
                        Home
                      </button>
                      <span>/</span>
                      <span className="text-slate-700 font-semibold">
                        {searchQuery ? `Search: "${searchQuery}"` : selectedCategory !== 'All' ? selectedCategory : 'Filtered Deals'}
                      </span>
                    </div>

                    <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
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
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="bg-slate-50 text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="discount">Highest Discount</option>
                        <option value="rating">Customer Rating</option>
                      </select>
                    </div>

                    <button
                      onClick={resetFilters}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
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
                    <p className="text-xs text-slate-500 mb-6">
                      Try searching with different keywords like "kurti", "shoes", "cotton", or clear filters to view all products.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Show All Deals
                    </button>
                  </div>
                ) : (
                  /* Responsive Grid: 5-6 cards on Desktop, 3-4 on Tablet, 2 on Mobile */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                    {filteredAndSortedProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                        onOpenDetail={() => setSelectedProduct(product)}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => {
            resetFilters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold transition ${
            isHomeView ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setSelectedCollection('TRENDING');
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold transition ${
            selectedCollection === 'TRENDING' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Trending</span>
        </button>

        <button
          onClick={() => {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition"
        >
          <Grid className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold relative text-slate-400 hover:text-white transition"
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
        onClose={() => setSelectedProduct(null)}
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
        onSelectProduct={p => setSelectedProduct(p)}
      />
    </div>
  );
};
