import React, { useState, useEffect } from 'react';
import { ProductItem } from '../types';
import { X, ExternalLink, Heart, Star, Share2, ShoppingBag, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.NAME,
          text: `Check out this deal on SAINIWALAA Deals: ${product.NAME} at ${product.formattedPrice}`,
          url: product.LINK || window.location.href
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    if (product.LINK) {
      navigator.clipboard.writeText(product.LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMarketBadgeStyle = () => {
    switch (product.marketplace) {
      case 'Amazon':
        return 'bg-[#FF9900] text-slate-950';
      case 'Flipkart':
        return 'bg-[#2874F0] text-white';
      case 'Meesho':
        return 'bg-[#F43397] text-white';
      case 'Ajio':
        return 'bg-[#2C4152] text-white';
      default:
        return 'bg-slate-900 text-white';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-md text-slate-700 flex items-center justify-center transition hover:scale-105 active:scale-95"
            title="Share deal"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleWishlist}
            className="w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-md text-slate-700 flex items-center justify-center transition hover:scale-105 active:scale-95"
            title="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-md text-slate-700 flex items-center justify-center transition hover:scale-105 active:scale-95"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Media Container */}
          <div className="relative bg-slate-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 min-h-[260px] sm:min-h-[320px]">
            {product.IMAGE ? (
              <img
                src={product.IMAGE}
                alt={product.NAME}
                className="max-h-72 w-full object-contain drop-shadow-sm"
              />
            ) : (
              <ShoppingBag className="w-20 h-20 text-slate-300" />
            )}

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wide ${getMarketBadgeStyle()}`}>
                {product.marketplace} Store
              </span>
              {product.TOP && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-1 rounded-md shadow-xs">
                  ⭐ TOP PICK
                </span>
              )}
            </div>
          </div>

          {/* Right Details Container */}
          <div className="p-5 sm:p-6 flex flex-col justify-between max-h-[75vh] overflow-y-auto">
            <div>
              {/* Rating and Badge */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="inline-flex items-center bg-amber-50 border border-amber-200/80 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{product.RATING > 0 ? product.RATING.toFixed(1) : '4.2'} Rating</span>
                </div>

                {product.BADGE && (
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-rose-100">
                    {product.BADGE.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
                {product.NAME}
              </h2>

              {/* Pricing Box */}
              <div className="my-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950">
                    {product.formattedPrice}
                  </span>

                  {product.MRP > product.PRICE && (
                    <span className="text-sm text-slate-400 line-through">
                      {product.formattedMrp}
                    </span>
                  )}

                  {product.DISCOUNT > 0 && (
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      {product.DISCOUNT}% OFF
                    </span>
                  )}
                </div>

                {product.savingsAmount > 0 && (
                  <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Aap is deal par {product.formattedSavings} bacha rahe hain!</span>
                  </p>
                )}
              </div>

              {/* Categories */}
              {product.categories.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.categories.map(c => (
                      <span key={c} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.DESCRIPTION && product.DESCRIPTION !== '...' && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Product Description
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">
                    {product.DESCRIPTION}
                  </p>
                </div>
              )}

              {/* Keywords */}
              {product.KEYWORDS && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Highlights
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {product.KEYWORDS}
                  </p>
                </div>
              )}
            </div>

            {/* Direct CTA */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              <a
                href={product.LINK || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all duration-200 active:scale-98"
              >
                <span>Buy Now on {product.marketplace}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct official link to {product.marketplace}. No extra fee.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
