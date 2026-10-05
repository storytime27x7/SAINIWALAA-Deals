import React, { useState, useEffect, useRef } from 'react';
import { HeroItem } from '../types';
import { ChevronRight, ChevronLeft, Tag, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface HeroSliderProps {
  heroItems: HeroItem[];
  onSelectStore?: (store: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ heroItems, onSelectStore }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const items = heroItems && heroItems.length > 0 ? heroItems : [
    {
      IMAGE: '',
      TAXT: 'SAINIWALAA DEALS — हर दिन कुछ नया, हर खरीदारी में बचत!\nAmazon, Flipkart & Meesho Best Deals',
      LINK: '',
      SHOW: true,
      _ROW: 1
    }
  ];

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [items.length, isPaused]);

  const active = items[current] || items[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(prev => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(prev => (prev + 1) % items.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrent(prev => (prev + 1) % items.length);
      } else {
        setCurrent(prev => (prev - 1 + items.length) % items.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 my-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Hero Banner (Full width on mobile/tablet, 8 cols on desktop) */}
        <div
          className="lg:col-span-8 xl:col-span-9 relative h-48 sm:h-64 md:h-80 lg:h-96 w-full rounded-2xl overflow-hidden shadow-md group cursor-pointer bg-slate-900 border border-slate-800"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (active.LINK) window.open(active.LINK, '_blank', 'noopener,noreferrer');
          }}
        >
          {active.IMAGE ? (
            <>
              <img
                src={active.IMAGE}
                alt={active.TAXT || 'Deal Banner'}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 flex flex-col justify-end p-6" />
          )}

          {/* Content overlay */}
          <div className="absolute inset-0 p-4 sm:p-7 md:p-9 flex flex-col justify-end">
            <div className="inline-flex items-center gap-1.5 bg-rose-600/90 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full w-max shadow-sm mb-2">
              <Tag className="w-3 h-3" />
              <span>FEATURED MARKETPLACE OFFER</span>
            </div>

            <h2 className="text-white text-base sm:text-2xl md:text-3xl lg:text-4xl font-black max-w-2xl line-clamp-2 leading-tight drop-shadow-md">
              {active.TAXT ? active.TAXT.split('\n')[0] : 'Amazon, Flipkart & Meesho Verified Deals'}
            </h2>

            <div className="flex items-center gap-3 mt-3">
              <span className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition">
                <span>Grab Deal Now</span>
                <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-amber-200/90 text-xs font-semibold hidden sm:inline-block">
                Direct official retailer link
              </span>
            </div>
          </div>

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer shadow-md"
                aria-label="Previous Banner"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer shadow-md"
                aria-label="Next Banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {items.length > 1 && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    current === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side Promo Showcase Cards (Visible on Desktop) */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col justify-between gap-3 h-96">
          {/* Card 1: Amazon Top Deals */}
          <div
            onClick={() => onSelectStore?.('Amazon')}
            className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-amber-400 transition cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Amazon Deals
                </span>
                <span className="text-[11px] font-bold text-amber-700 flex items-center gap-0.5">
                  <Zap className="w-3.5 h-3.5 fill-amber-500" />
                  <span>Verified</span>
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-2 group-hover:text-amber-700 transition">
                Top Electronics, Fashion & Essentials
              </h4>
              <p className="text-xs text-slate-600 mt-1">Direct official storefront deals with prime savings.</p>
            </div>
            <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mt-2">
              <span>Explore Amazon Deals</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* Card 2: Flipkart Big Discounts */}
          <div
            onClick={() => onSelectStore?.('Flipkart')}
            className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-[#2874F0] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Flipkart Offers
                </span>
                <span className="text-[11px] font-bold text-blue-700">Up to 70% Off</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-2 group-hover:text-blue-700 transition">
                Footwear, Gadgets & Home Appliances
              </h4>
              <p className="text-xs text-slate-600 mt-1">Handpicked price-drop specials and super offers.</p>
            </div>
            <p className="text-xs font-bold text-blue-800 flex items-center gap-1 mt-2">
              <span>Explore Flipkart Deals</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* Card 3: Meesho Budget Dhamaka */}
          <div
            onClick={() => onSelectStore?.('Meesho')}
            className="flex-1 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-200/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-pink-400 transition cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-[#F43397] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Meesho Bazaar
                </span>
                <span className="text-[11px] font-bold text-pink-700">Under ₹500</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-2 group-hover:text-pink-700 transition">
                Ethnic Wear, Kurtis & Daily Styles
              </h4>
              <p className="text-xs text-slate-600 mt-1">Direct supplier prices on trending apparel.</p>
            </div>
            <p className="text-xs font-bold text-pink-800 flex items-center gap-1 mt-2">
              <span>Explore Meesho Deals</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
