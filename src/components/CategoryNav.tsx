import React from 'react';
import { Layers, Sparkles, Shirt, Footprints, Smartphone, Laptop, Utensils, Watch, Home, HeartPulse, ShoppingCart } from 'lucide-react';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n === 'all' || n.includes('all')) return Layers;
    if (n.includes('fashion') || n.includes('cloth') || n.includes('kurti')) return Shirt;
    if (n.includes('shoe') || n.includes('footwear')) return Footprints;
    if (n.includes('mobile')) return Smartphone;
    if (n.includes('gadget') || n.includes('electron')) return Laptop;
    if (n.includes('kitchen') || n.includes('appliance')) return Utensils;
    if (n.includes('watch')) return Watch;
    if (n.includes('furniture') || n.includes('decor')) return Home;
    if (n.includes('health') || n.includes('wellness')) return HeartPulse;
    if (n.includes('grocery')) return ShoppingCart;
    return Sparkles;
  };

  return (
    <div className="w-full bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {categories.map(cat => {
            const isSelected = cat.toLowerCase() === selectedCategory.toLowerCase();
            const Icon = getCategoryIcon(cat);

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap border flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-amber-400 border-amber-500 shadow-sm scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
