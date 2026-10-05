import React from 'react';

export const SkeletonGrid: React.FC = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 my-6">
      {/* Hero skeleton */}
      <div className="w-full h-48 sm:h-64 md:h-80 rounded-3xl bg-slate-200 animate-pulse mb-6" />

      {/* Store tabs skeleton */}
      <div className="flex gap-2.5 overflow-hidden mb-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse flex-shrink-0" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between h-72">
            <div>
              <div className="aspect-square bg-slate-100 rounded-xl animate-pulse mb-2.5" />
              <div className="h-3.5 bg-slate-200 rounded animate-pulse w-3/4 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3 mb-2" />
              <div className="h-8 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
