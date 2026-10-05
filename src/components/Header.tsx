import React from 'react';
import { Search, ShoppingBag, Heart, RefreshCw, X, Flame, Sparkles, Menu, Tag, Percent, IndianRupee } from 'lucide-react';
import { CollectionFilter } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCollection: CollectionFilter;
  onSelectCollection: (col: CollectionFilter) => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedCollection,
  onSelectCollection,
  wishlistCount,
  onOpenWishlist,
  isRefreshing,
  onRefresh
}) => {
  const quickTags = ['kurti', 'shoes', 'cotton', 'under 500', 'amazon', 'meesho'];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md w-full">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 text-slate-950 px-4 py-1 text-xs font-bold w-full">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>LIVE OFFERS</span>
            </span>
            <span className="truncate">
              Amazon, Flipkart & Meesho ke behtareen products aur verified deals ek jagah!
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-900 font-bold flex-shrink-0">
            <span>✓ 100% Verified Deals</span>
            <span>✓ Direct Official Store Links</span>
            <span>✓ Zero Extra Fees</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (BRAND + LARGE SEARCH + UTILITIES) */}
      <div className="w-full border-b border-slate-800/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* Brand Logo & Name */}
            <div
              className="flex items-center gap-3 flex-shrink-0 cursor-pointer select-none"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('All');
                onSelectCollection('ALL');
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 border border-amber-300/40">
                <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg md:text-xl tracking-wider text-white">
                    SAINIWALAA
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[11px] font-black px-1.5 py-0.5 rounded shadow-sm">
                    DEALS
                  </span>
                </div>
                <p className="text-[11px] font-medium text-amber-200/90 -mt-0.5 hidden sm:block">
                  Best Deals, Smart Shopping
                </p>
              </div>
            </div>

            {/* Large Ecommerce Search Bar (Desktop & Tablet) */}
            <div className="hidden md:flex flex-1 max-w-3xl mx-2">
              <div className="relative w-full flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Search deals across Amazon, Flipkart, Meesho... (e.g. kurti, shoes, under 500)"
                    className="w-full bg-slate-800/90 text-white placeholder-slate-400 pl-10 pr-9 py-2.5 rounded-l-xl border border-r-0 border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all shadow-inner"
                  />
                  <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-r-xl text-sm flex items-center gap-1.5 transition border border-amber-400 flex-shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Right Action Utilities */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Refresh Button */}
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh deals from Google Sheet"
                className="flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                <span className="hidden xl:inline">Sync Deals</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={onOpenWishlist}
                className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/70 transition shadow-xs cursor-pointer"
                title="Saved Wishlist"
              >
                <div className="relative">
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left -space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-medium leading-none">Saved</span>
                  <span className="text-xs font-bold text-white leading-none">Wishlist ({wishlistCount})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (Full width underneath on mobile screens) */}
          <div className="mt-2.5 md:hidden relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search kurti, shoes, cotton, under 500..."
              className="w-full bg-slate-800/90 text-white placeholder-slate-400 pl-9 pr-8 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 text-xs shadow-inner"
            />
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECONDARY NAVIGATION BAR (DESKTOP & MOBILE CATEGORIES + QUICK FILTERS) */}
      <div className="w-full bg-slate-950/80 backdrop-blur-xs border-b border-slate-800/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            {/* Left: Category Navigation Pills */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onSelectCategory('All')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Menu className="w-3.5 h-3.5" />
                <span>All Categories</span>
              </button>

              {categories
                .filter(c => c !== 'All')
                .slice(0, 8)
                .map(cat => {
                  const isSelected = cat.toLowerCase() === selectedCategory.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => onSelectCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex-shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/50'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
            </div>

            {/* Right: Quick Deal Presets (Desktop & Tablet) */}
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0 border-l border-slate-800 pl-3">
              {[
                { key: 'ALL' as CollectionFilter, label: 'All Deals', icon: null },
                { key: 'TRENDING' as CollectionFilter, label: '🔥 Trending', icon: null },
                { key: 'BEST_DISCOUNTS' as CollectionFilter, label: '🏷️ 40%+ Off', icon: null },
                { key: 'TOP_PICKS' as CollectionFilter, label: '⭐ Top Picks', icon: null },
                { key: 'UNDER_500' as CollectionFilter, label: '💰 Under ₹500', icon: null },
              ].map(item => {
                const isSelected = selectedCollection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectCollection(item.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-amber-300/80 hover:text-amber-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
