import React, { useEffect } from 'react';
import { ProductItem } from '../types';
import { X, Heart, ExternalLink, Trash2, ShoppingBag } from 'lucide-react';
import { trackMarketplaceClick } from '../services/analytics';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: ProductItem[];
  onRemove: (id: string) => void;
  onSelectProduct: (p: ProductItem) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemove,
  onSelectProduct
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Saved Wishlist Deals"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="font-extrabold text-base">
              Saved Wishlist ({wishlistProducts.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
            title="Close Wishlist"
            aria-label="Close Wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {wishlistProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <p className="font-extrabold text-slate-800 text-base">Your Wishlist is Empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Product card par heart (❤️) icon tap karein taaki aapke favourite deals yahan save ho sakein.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Browse Deals
              </button>
            </div>
          ) : (
            wishlistProducts.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectProduct(item);
                  onClose();
                }}
                className="py-3.5 flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2.5 rounded-2xl transition"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-slate-200/60">
                  {item.IMAGE ? (
                    <img
                      src={item.IMAGE}
                      alt={item.NAME || 'Product'}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    {item.marketplace}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-600 transition mt-1">
                    {item.NAME}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-slate-950">{item.formattedPrice}</span>
                    {item.DISCOUNT > 0 && (
                      <span className="text-[10px] font-black text-emerald-600">{item.DISCOUNT}% OFF</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    href={item.LINK || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => {
                      e.stopPropagation();
                      trackMarketplaceClick(item, 'wishlist_drawer');
                    }}
                    className="py-1.5 px-3 min-h-[34px] bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
                    title={`Buy on ${item.marketplace}`}
                    aria-label={`Buy ${item.NAME} on ${item.marketplace}`}
                  >
                    <span>Buy</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Remove from wishlist"
                    aria-label={`Remove ${item.NAME} from wishlist`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info in Wishlist Drawer */}
        {wishlistProducts.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500">
              Saved in your browser storage. Never lost on refresh!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
