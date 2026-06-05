import React from 'react';
import NoteItem from './NoteItem';

export default function Sidebar({
  notes,
  activeNoteId,
  users,
  activeUserId,
  onUserChange,
  searchQuery,
  onSearchChange,
  activeTag,
  onTagSelect,
  onNoteSelect,
  onNoteCreate,
  onPinToggle,
}) {
  // Extract all unique tags across all notes to display a tags filter cloud
  const allTags = React.useMemo(() => {
    const tagsSet = new Set();
    notes.forEach((note) => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach((tag) => {
          if (tag) tagsSet.add(tag.trim().toLowerCase());
        });
      }
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filter notes by the active tag filter (if selected)
  const filteredNotes = React.useMemo(() => {
    if (!activeTag) return notes;
    return notes.filter(
      (note) =>
        note.tags &&
        note.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
    );
  }, [notes, activeTag]);

  // Separate pinned and regular notes
  const pinnedNotes = React.useMemo(() => {
    return filteredNotes.filter((n) => n.isPinned);
  }, [filteredNotes]);

  const regularNotes = React.useMemo(() => {
    return filteredNotes.filter((n) => !n.isPinned);
  }, [filteredNotes]);

  return (
    <aside className="w-full md:w-80 lg:w-90 border-r border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/20 flex flex-col h-full overflow-hidden select-none">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/40 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display font-bold bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
              Notes Management
            </span>
          </div>

          {/* Create New Note Button */}
          <button
            onClick={onNoteCreate}
            className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md shadow-brand-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            title="Create Note"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* User Profile Switcher */}
        <div className="flex items-center justify-between gap-2 bg-slate-100/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/10">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1.5 uppercase tracking-wider">
            Workspace
          </span>
          <select
            value={activeUserId || 'all'}
            onChange={(e) => {
              const val = e.target.value;
              onUserChange(val === 'all' ? null : parseInt(val, 10));
            }}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer border-none py-0.5"
          >
            <option value="all" className="dark:bg-slate-900">🌐 All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id} className="dark:bg-slate-900">
                👤 {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input Area */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search titles or text..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-sm glass-input font-medium text-slate-700 dark:text-slate-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tags Filter Cloud (Horizontally scrollable or wrapped list) */}
      {allTags.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none scroll-smooth">
            <button
              onClick={() => onTagSelect(null)}
              className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                !activeTag
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200/40 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => {
              const isSelected = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onTagSelect(tag)}
                  className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200/40 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes list view (Padded and Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {pinnedNotes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
              <svg className="w-3 h-3 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Pinned Notes ({pinnedNotes.length})
            </div>
            <div className="space-y-2">
              {pinnedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={note.id === activeNoteId}
                  onClick={() => onNoteSelect(note)}
                  onPinToggle={onPinToggle}
                />
              ))}
            </div>
          </div>
        )}

        {regularNotes.length > 0 ? (
          <div className="space-y-2">
            {pinnedNotes.length > 0 && (
              <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1 pt-2">
                Recent Notes ({regularNotes.length})
              </div>
            )}
            <div className="space-y-2">
              {regularNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={note.id === activeNoteId}
                  onClick={() => onNoteSelect(note)}
                  onPinToggle={onPinToggle}
                />
              ))}
            </div>
          </div>
        ) : pinnedNotes.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600 font-medium text-sm">
            No notes here
          </div>
        ) : null}
      </div>
    </aside>
  );
}
