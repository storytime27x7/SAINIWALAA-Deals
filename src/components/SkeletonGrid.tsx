import React from 'react';

export const SkeletonGrid: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6">
      {/* Hero skeleton */}
      <div className="w-full h-44 sm:h-64 rounded-2xl bg-slate-200 animate-pulse mb-6" />

      {/* Categories skeleton */}
      <div className="flex gap-2 overflow-hidden mb-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-8 w-24 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col gap-3">
            <div className="aspect-square bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
            <div className="h-8 bg-slate-200 rounded-xl animate-pulse mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};
