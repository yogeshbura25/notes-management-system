import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isError = type === 'error';

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4.5 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-0 animate-slide-up border ${
        isError 
          ? 'bg-rose-50 border-rose-200/60 dark:bg-rose-950/80 dark:border-rose-900/40 text-rose-800 dark:text-rose-200' 
          : 'bg-indigo-50 border-indigo-200/60 dark:bg-indigo-950/80 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-200'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${
        isError 
          ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' 
          : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
      }`}>
        {isError ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-semibold tracking-wide">
          {isError ? 'Error Occurred' : 'Action Successful'}
        </p>
        <p className="text-xs opacity-90 font-medium mt-0.5">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="ml-4 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
