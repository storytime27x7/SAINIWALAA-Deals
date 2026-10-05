import React, { useState } from 'react';
import { ProductItem } from '../types';
import { Star, Heart, ExternalLink, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onOpenDetail: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onOpenDetail
}) => {
  const [imgError, setImgError] = useState(false);

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
      onClick={onOpenDetail}
      className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none h-full"
    >
      {/* Top Media Container */}
      <div>
        <div className="relative aspect-square w-full bg-slate-50/80 overflow-hidden flex items-center justify-center p-2.5 sm:p-3">
          {product.IMAGE && !imgError ? (
            <img
              src={product.IMAGE}
              alt={product.NAME}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <ShoppingBag className="w-10 h-10 stroke-1" />
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Deal Item</span>
            </div>
          )}

          {/* Marketplace Badge (Top Left) */}
          <span
            className={`absolute top-2 left-2 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide z-10 ${getMarketBadgeStyle()}`}
          >
            {product.marketplace}
          </span>

          {/* TOP Pick Badge (Bottom Left) */}
          {product.TOP && (
            <span className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs z-10">
              ⭐ TOP PICK
            </span>
          )}

          {/* Wishlist Button (Top Right) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            aria-label="Save to Wishlist"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-600 hover:scale-110 active:scale-95 shadow-sm transition z-10 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Info Section */}
        <div className="p-2.5 sm:p-3.5">
          {/* Rating & Badge Row */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <div className="inline-flex items-center text-amber-500 text-[11px] font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
              <span>{product.RATING > 0 ? product.RATING.toFixed(1) : '4.2'}</span>
            </div>

            {product.BADGE && (
              <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-1.5 py-0.2 rounded border border-rose-100 uppercase">
                {product.BADGE}
              </span>
            )}
          </div>

          {/* Product Name (2 lines) */}
          <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors h-8 sm:h-9">
            {product.NAME}
          </h3>

          {/* Category tag */}
          {product.categories.length > 0 && (
            <p className="text-[10px] text-slate-400 truncate mt-1">
              {product.categories[0]}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Pricing & Buy Now Action */}
      <div className="p-2.5 sm:p-3.5 pt-0">
        <div className="pt-2 border-t border-slate-100 mb-2">
          {/* Prices */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-black text-slate-950">
              {product.formattedPrice}
            </span>

            {product.MRP > product.PRICE && (
              <span className="text-[11px] text-slate-400 line-through">
                {product.formattedMrp}
              </span>
            )}

            {product.DISCOUNT > 0 && (
              <span className="text-[10px] sm:text-[11px] font-black text-emerald-600">
                {product.DISCOUNT}% OFF
              </span>
            )}
          </div>

          {/* Savings pill if available */}
          {product.savingsAmount > 0 && (
            <p className="text-[10px] font-bold text-emerald-700 mt-0.5 truncate">
              Save {product.formattedSavings}
            </p>
          )}
        </div>

        {/* Buy Now Button (Direct External Link to Marketplace) */}
        <a
          href={product.LINK || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-extrabold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-98 shadow-xs cursor-pointer"
        >
          <span>Buy on {product.marketplace}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
