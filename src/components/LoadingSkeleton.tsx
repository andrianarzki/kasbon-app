'use client';

import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm h-36">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-slate-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Filter Skeleton */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm h-20">
        <div className="h-10 bg-slate-100 rounded-xl w-full" />
      </div>

      {/* List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm h-24 flex items-center justify-between">
            <div className="flex items-center gap-3 w-1/2">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-4 bg-slate-200 rounded w-2/4" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-6 bg-slate-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
