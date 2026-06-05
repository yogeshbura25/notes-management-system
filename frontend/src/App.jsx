import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import EmptyState from './components/EmptyState';
import LoadingSkeleton from './components/LoadingSkeleton';
import Toast from './components/Toast';

export default function App() {
  // Primary States
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null); // null means All Users
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  
  // App UX States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [mobileViewMode, setMobileViewMode] = useState('list'); // 'list' | 'editor'

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Refs for debounced auto-save
  const saveTimeoutRef = useRef(null);
  const pendingNoteRef = useRef(null); // stores { id, data }

  // Sync dark mode style class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Load initial notes & users
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [notesData, usersData] = await Promise.all([
          api.getNotes(),
          api.getUsers()
        ]);
        setNotes(notesData);
        setUsers(usersData);
        if (notesData.length > 0) {
          setActiveNote(notesData[0]);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError(err.message || 'Could not connect to database. Make sure backend is running.');
        showToast('Database connection failed', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Debounce API Search queries to reduce server hits
  useEffect(() => {
    // Skip the first load
    if (loading) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const notesData = await api.getNotes(searchQuery);
        setNotes(notesData);

        // Keep active note updated or fall back to first result
        if (activeNote) {
          const found = notesData.find(n => n.id === activeNote.id);
          if (!found) {
            setActiveNote(notesData.length > 0 ? notesData[0] : null);
          } else {
            // Merge with local states in case changes exist
            setActiveNote(prev => ({ ...found, ...prev }));
          }
        } else if (notesData.length > 0) {
          setActiveNote(notesData[0]);
        }
      } catch (err) {
        showToast(err.message || 'Search query failed', 'error');
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Filter notes by selected workspace (user) in frontend
  const filteredNotesByWorkspace = React.useMemo(() => {
    if (activeUserId === null) return notes;
    return notes.filter(n => n.userId === activeUserId);
  }, [notes, activeUserId]);

  // Core Auto-Save execution engine
  const savePendingNote = async () => {
    if (!pendingNoteRef.current) return;
    const { id, data } = pendingNoteRef.current;
    
    // Clear refs immediately to avoid duplicate requests
    pendingNoteRef.current = null;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    try {
      const updated = await api.updateNote(id, data);
      
      // Update local notes array and preserve sorting (pinned first, then date)
      setNotes(prev => {
        const index = prev.findIndex(n => n.id === id);
        if (index === -1) return prev;
        
        const updatedArray = [...prev];
        updatedArray[index] = { ...updated, preview: updated.content.substring(0, 100) };
        
        return updatedArray.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });
      });

      setSaveStatus('saved');
      
      // Reset save status back to idle after a visual timeout
      setTimeout(() => {
        setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
      }, 1500);

    } catch (err) {
      setSaveStatus('error');
      showToast(err.message || 'Auto-save failed', 'error');
    }
  };

  // Triggered when editing note contents/title
  const handleNoteUpdate = (updatedFields) => {
    if (!activeNote) return;

    // 1. Instantly update UI states locally (avoiding latency)
    const updatedNote = { ...activeNote, ...updatedFields };
    setActiveNote(updatedNote);
    
    setNotes(prev => prev.map(n => n.id === activeNote.id ? { 
      ...n, 
      ...updatedFields, 
      preview: updatedFields.content ? updatedFields.content.substring(0, 100) : ''
    } : n));

    // 2. Queue auto-save
    setSaveStatus('saving');
    pendingNoteRef.current = { id: activeNote.id, data: updatedFields };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await savePendingNote();
    }, 1500);
  };

  // Switch notes (saves pending changes immediately first)
  const handleNoteSelect = async (note) => {
    if (pendingNoteRef.current) {
      await savePendingNote();
    }
    setActiveNote(note);
    setMobileViewMode('editor');
  };

  // Create a note
  const handleNoteCreate = async () => {
    if (pendingNoteRef.current) {
      await savePendingNote();
    }

    try {
      const newNote = await api.createNote({
        title: 'New Note',
        content: '',
        userId: activeUserId || null,
        tags: activeTag ? [activeTag] : []
      });

      setNotes(prev => [newNote, ...prev]);
      setActiveNote(newNote);
      setMobileViewMode('editor');
      showToast('Note created successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create note', 'error');
    }
  };

  // Delete a note
  const handleNoteDelete = async (id) => {
    // If the note was unsaved/pending, cancel the timer
    if (pendingNoteRef.current && pendingNoteRef.current.id === id) {
      pendingNoteRef.current = null;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }

    try {
      await api.deleteNote(id);
      
      const remainingNotes = notes.filter(n => n.id !== id);
      setNotes(remainingNotes);
      
      // Fall back to another note
      const filteredRemaining = activeUserId 
        ? remainingNotes.filter(n => n.userId === activeUserId)
        : remainingNotes;
        
      setActiveNote(filteredRemaining.length > 0 ? filteredRemaining[0] : null);
      setMobileViewMode('list');
      showToast('Note deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete note', 'error');
    }
  };

  // Toggle pin from sidebar NoteItem
  const handlePinToggle = async (note) => {
    if (pendingNoteRef.current && pendingNoteRef.current.id === note.id) {
      await savePendingNote();
    }

    try {
      const updated = await api.updateNote(note.id, { isPinned: !note.isPinned });
      
      setNotes(prev => {
        const list = prev.map(n => n.id === note.id ? updated : n);
        return [...list].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });
      });

      if (activeNote && activeNote.id === note.id) {
        setActiveNote(updated);
      }

      showToast(updated.isPinned ? 'Note pinned to top' : 'Note unpinned', 'success');
    } catch (err) {
      showToast(err.message || 'Pin action failed', 'error');
    }
  };

  // Save on component unmount
  useEffect(() => {
    return () => {
      if (pendingNoteRef.current) {
        savePendingNote();
      }
    };
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <header className="h-14.5 border-b border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-6 select-none z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/10">
            N
          </div>
          <h1 className="text-base font-display font-bold text-slate-800 dark:text-slate-100 m-0 leading-none">
            Notes Management System
          </h1>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-3">
          {/* Database offline indicator */}
          {error && (
            <span className="text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 font-semibold px-2.5 py-1 rounded-lg border border-rose-200/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Offline Mode
            </span>
          )}

          {/* Dark Mode Switcher */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Database Connection Error
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* Sidebar Viewport */}
            <div 
              className={`absolute md:relative inset-y-0 left-0 w-full md:w-auto h-full z-20 md:z-auto transition-transform duration-300 md:translate-x-0 ${
                mobileViewMode === 'list' ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Sidebar
                notes={filteredNotesByWorkspace}
                activeNoteId={activeNote?.id}
                users={users}
                activeUserId={activeUserId}
                onUserChange={(uid) => {
                  setActiveUserId(uid);
                  const filtered = uid ? notes.filter(n => n.userId === uid) : notes;
                  setActiveNote(filtered.length > 0 ? filtered[0] : null);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeTag={activeTag}
                onTagSelect={setActiveTag}
                onNoteSelect={handleNoteSelect}
                onNoteCreate={handleNoteCreate}
                onPinToggle={handlePinToggle}
              />
            </div>

            {/* Note Editor Viewport */}
            <div 
              className={`absolute md:relative inset-0 md:flex-1 h-full z-10 md:z-auto transition-transform duration-300 md:translate-x-0 ${
                mobileViewMode === 'editor' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
              }`}
            >
              {activeNote ? (
                <NoteEditor
                  note={activeNote}
                  users={users}
                  onUpdate={handleNoteUpdate}
                  onDelete={handleNoteDelete}
                  onBack={() => setMobileViewMode('list')}
                  saveStatus={saveStatus}
                />
              ) : (
                <EmptyState
                  isSearch={!!searchQuery || !!activeTag}
                  onCreateNote={handleNoteCreate}
                  onClearFilters={() => {
                    setSearchQuery('');
                    setActiveTag(null);
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Global notifications render */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

