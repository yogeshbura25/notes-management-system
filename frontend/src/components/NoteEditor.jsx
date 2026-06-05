import React, { useState, useEffect } from 'react';

export default function NoteEditor({
  note,
  users,
  onUpdate,
  onDelete,
  onBack, // used on mobile screens
  saveStatus // 'idle' | 'saving' | 'saved' | 'error'
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [tags, setTags] = useState(note?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(note?.userId || '');

  // Keep local fields in sync with the note when the active note changes
  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setIsPinned(note?.isPinned || false);
    setTags(note?.tags || []);
    setAssignedUserId(note?.userId || '');
    setNewTagInput('');
  }, [note?.id]);

  // Handle local text changes and notify parent component
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    onUpdate({ title: val, content, isPinned, tags, userId: assignedUserId ? parseInt(assignedUserId, 10) : null });
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    onUpdate({ title, content: val, isPinned, tags, userId: assignedUserId ? parseInt(assignedUserId, 10) : null });
  };

  const handlePinToggle = () => {
    const newVal = !isPinned;
    setIsPinned(newVal);
    onUpdate({ title, content, isPinned: newVal, tags, userId: assignedUserId ? parseInt(assignedUserId, 10) : null });
  };

  const handleUserChange = (e) => {
    const val = e.target.value;
    setAssignedUserId(val);
    onUpdate({ title, content, isPinned, tags, userId: val ? parseInt(val, 10) : null });
  };

  // Tag list editing operations
  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      const updatedTags = [...tags, cleanTag];
      setTags(updatedTags);
      setNewTagInput('');
      onUpdate({ title, content, isPinned, tags: updatedTags, userId: assignedUserId ? parseInt(assignedUserId, 10) : null });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    onUpdate({ title, content, isPinned, tags: updatedTags, userId: assignedUserId ? parseInt(assignedUserId, 10) : null });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note? This action is permanent.')) {
      onDelete(note.id);
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/20 dark:bg-slate-900/10 text-slate-400">
        <p className="text-sm font-medium">Select a note to view its details or create a new one.</p>
      </div>
    );
  }

  // Calculate length counters
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-white/30 dark:bg-slate-900/10 border-l border-slate-200/50 dark:border-slate-800/40 overflow-hidden animate-fade-in">
      
      {/* Editor Control Header */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 px-6 py-4 bg-white/60 dark:bg-slate-950/40 select-none">
        <div className="flex items-center gap-3">
          
          {/* Back button for mobile viewports */}
          <button
            onClick={onBack}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            title="Back to list"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Saving Status Indicators */}
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Save Failed
              </span>
            )}
            {saveStatus === 'idle' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                Synced
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pin Toggle */}
          <button
            onClick={handlePinToggle}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isPinned
                ? 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30 shadow-xs'
                : 'bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-200/40 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <svg className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>

          {/* User Assignment Select */}
          <div className="flex items-center border border-slate-200/40 dark:border-slate-800 rounded-xl px-2.5 py-1.5 bg-white dark:bg-slate-900 text-xs font-semibold">
            <span className="text-slate-400 mr-2">Owner:</span>
            <select
              value={assignedUserId}
              onChange={handleUserChange}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-bold outline-none border-none py-0.5 cursor-pointer"
            >
              <option value="" className="dark:bg-slate-900">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id} className="dark:bg-slate-900">
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:border-rose-900/30 rounded-xl transition-all cursor-pointer"
            title="Delete Note"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto space-y-6">
        
        {/* Title Input field */}
        <input
          type="text"
          placeholder="Give your note a title..."
          value={title}
          onChange={handleTitleChange}
          className="w-full text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-slate-50 placeholder-slate-300 dark:placeholder-slate-700 bg-transparent border-none outline-none focus:ring-0 resize-none leading-snug"
        />

        {/* Dynamic Tag Management */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
          <div className="flex items-center text-slate-400 dark:text-slate-500">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20a1 1 0 02-1-1V5a1 1 0 011-1h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 010 1.414L11.414 20A1 1 0 0110.707 20.707L6 20z" />
            </svg>
          </div>

          {/* Render Active Note Tags */}
          {tags.map((tag) => (
            <span
              key={tag}
              className="group flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-600 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={`Remove ${tag} tag`}
              >
                &times;
              </button>
            </span>
          ))}

          {/* Tag Adding Form Input */}
          <form onSubmit={handleAddTag} className="inline-block">
            <input
              type="text"
              placeholder="+ Add tag..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="px-2 py-0.5 text-xs font-semibold bg-transparent placeholder-slate-400 text-slate-600 dark:text-slate-300 outline-none border border-dashed border-slate-300 dark:border-slate-700 rounded-lg focus:border-brand-500 dark:focus:border-brand-400"
            />
          </form>
        </div>

        {/* Content Body Textarea */}
        <textarea
          placeholder="Start writing down your ideas, outlines, or checklist items..."
          value={content}
          onChange={handleContentChange}
          className="flex-1 w-full text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-700 bg-transparent border-none outline-none focus:ring-0 resize-none font-medium"
        />

        {/* Character/Word Counts and Auto-save notes */}
        <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-600 font-semibold border-t border-slate-200/30 dark:border-slate-800/30 pt-4">
          <div className="flex gap-4">
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span>{charCount} {charCount === 1 ? 'character' : 'characters'}</span>
          </div>
          <span className="italic opacity-80">Notes Management System v1</span>
        </div>
      </div>
    </div>
  );
}
