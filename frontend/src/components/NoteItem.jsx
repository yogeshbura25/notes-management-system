import React from 'react';

// Color map for tags to give a beautiful visual design
const TAG_COLORS = {
  work: 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30',
  ideas: 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30',
  roadmap: 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30',
  personal: 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/30',
  welcome: 'bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/30',
  notes: 'bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/30',
};

function getTagStyle(tag) {
  const normalized = tag.toLowerCase();
  return TAG_COLORS[normalized] || 'bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/30';
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  // If today
  if (date.toDateString() === now.toDateString()) {
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Older
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NoteItem({ note, isActive, onClick, onPinToggle }) {
  const formattedTime = formatRelativeTime(note.updatedAt || note.createdAt);

  return (
    <div
      onClick={onClick}
      className={`group relative p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        isActive
          ? 'bg-brand-50 border-brand-200 shadow-sm dark:bg-brand-950/25 dark:border-brand-900/40'
          : 'bg-white/40 border-slate-100 hover:bg-white/90 hover:border-slate-200 hover:shadow-xs dark:bg-slate-900/20 dark:border-slate-800/20 dark:hover:bg-slate-900/45 dark:hover:border-slate-800/60'
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <h4 className={`text-[15px] font-semibold leading-snug truncate ${
          isActive 
            ? 'text-brand-900 dark:text-brand-200' 
            : 'text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white'
        }`}>
          {note.title || 'Untitled Note'}
        </h4>
        
        {/* Pinned Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPinToggle(note);
          }}
          className={`p-1 rounded-lg transition-colors cursor-pointer ${
            note.isPinned 
              ? 'text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300' 
              : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-0 group-hover:opacity-100 focus:opacity-100'
          }`}
          title={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <svg 
            className={`w-3.5 h-3.5 transform transition-transform duration-200 ${note.isPinned ? 'scale-110' : 'group-hover:rotate-12'}`} 
            fill={note.isPinned ? 'currentColor' : 'none'} 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            {/* Custom pin shape */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
      </div>

      <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3 break-words font-medium">
        {note.preview || note.content || <span className="italic opacity-60">No content...</span>}
      </p>

      <div className="flex items-center justify-between gap-2">
        {/* Tags horizontal container */}
        <div className="flex flex-wrap gap-1 items-center max-w-[70%] overflow-hidden">
          {note.tags && note.tags.length > 0 ? (
            note.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider uppercase ${getTagStyle(tag)}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-600 italic">no tags</span>
          )}
        </div>

        {/* Updated Time */}
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide whitespace-nowrap">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
