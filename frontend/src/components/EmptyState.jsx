import React from 'react';

export default function EmptyState({ isSearch = false, onCreateNote, onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center animate-fade-in select-none">
      <div className="relative mb-6">
        {/* Glow behind icon */}
        <div className="absolute inset-0 bg-brand-400/10 dark:bg-brand-400/5 blur-2xl rounded-full scale-150"></div>
        <div className="relative p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-xl shadow-brand-500/5 text-brand-500 dark:text-brand-400 animate-float">
          {isSearch ? (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ) : (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          )}
        </div>
      </div>

      <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-100 mb-2">
        {isSearch ? 'No matching notes' : 'Your thoughts workspace is clean'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
        {isSearch 
          ? "We couldn't find any notes matching those keyword or tag filters. Try searching for something else."
          : "Start creating your notes library. Write down ideas, track tasks, or save key tags to stay organized."}
      </p>

      {isSearch ? (
        <button
          onClick={onClearFilters}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm border border-slate-200/20"
        >
          Clear filters
        </button>
      ) : (
        <button
          onClick={onCreateNote}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 hover:-translate-y-0.5"
        >
          Create your first note
        </button>
      )}
    </div>
  );
}
