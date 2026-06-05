import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 animate-fadeIn">
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r border-slate-200/50 dark:border-slate-800/40 p-5 hidden md:flex flex-col gap-6 bg-white/40 dark:bg-slate-900/30">
        <div className="flex justify-between items-center">
          <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
          <div className="h-6 w-14 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col gap-3 mt-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border border-slate-100 dark:border-slate-900 rounded-xl bg-white dark:bg-slate-900 flex flex-col gap-2 shadow-xs">
              <div className="flex justify-between items-center">
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              <div className="flex gap-1.5 mt-2">
                <div className="h-4.5 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                <div className="h-4.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Skeleton */}
      <div className="flex-1 flex flex-col p-6 md:p-10 gap-6 bg-white/20 dark:bg-slate-900/10">
        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-6">
          <div className="flex flex-col gap-2 w-1/3">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="flex-1 bg-slate-200/50 dark:bg-slate-800/30 rounded-2xl animate-pulse p-4"></div>
      </div>
    </div>
  );
}
