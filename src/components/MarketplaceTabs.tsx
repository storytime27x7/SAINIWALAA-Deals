import React from 'react';
import { Marketplace } from '../types';
import { Store, Check } from 'lucide-react';

interface MarketplaceTabsProps {
  selectedMarketplace: Marketplace | 'All';
  onSelectMarketplace: (m: Marketplace | 'All') => void;
  counts?: Partial<Record<Marketplace | 'All', number>>;
}

export const MarketplaceTabs: React.FC<MarketplaceTabsProps> = ({
  selectedMarketplace,
  onSelectMarketplace,
  counts
}) => {
  const tabs: { key: Marketplace | 'All'; label: string; badgeColor: string; activeBorder: string }[] = [
    { key: 'All', label: 'All Marketplaces', badgeColor: 'bg-slate-500', activeBorder: 'border-amber-500' },
    { key: 'Amazon', label: 'Amazon India', badgeColor: 'bg-[#FF9900]', activeBorder: 'border-amber-500' },
    { key: 'Flipkart', label: 'Flipkart Store', badgeColor: 'bg-[#2874F0]', activeBorder: 'border-blue-500' },
    { key: 'Meesho', label: 'Meesho Bazaar', badgeColor: 'bg-[#F43397]', activeBorder: 'border-pink-500' },
    { key: 'Ajio', label: 'Ajio Trends', badgeColor: 'bg-[#2C4152]', activeBorder: 'border-slate-500' }
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 my-3">
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider hidden sm:inline">
            Filter by Store:
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const isSelected = selectedMarketplace === tab.key;
            const count = counts?.[tab.key];

            return (
              <button
                key={tab.key}
                onClick={() => onSelectMarketplace(tab.key)}
                className={`flex items-center gap-1.5 py-1.5 px-3 sm:px-4 rounded-xl border text-xs font-bold transition flex-shrink-0 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? `bg-slate-900 text-white ${tab.activeBorder} shadow-xs scale-102`
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {tab.key !== 'All' && (
                  <span className={`w-2.5 h-2.5 rounded-full ${tab.badgeColor}`} />
                )}
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
