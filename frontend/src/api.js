const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! Status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${options.method || 'GET'} ${path}:`, error);
    throw error;
  }
}

export const api = {
  // Get all notes, optional search query
  getNotes: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/notes${query}`);
  },

  // Get a single note
  getNote: async (id) => {
    return request(`/notes/${id}`);
  },

  // Get notes for specific user
  getUserNotes: async (userId) => {
    return request(`/user-notes/${userId}`);
  },

  // Create note
  createNote: async (note) => {
    return request('/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: note.title || 'Untitled Note',
        content: note.content || '',
        userId: note.userId || null,
        isPinned: note.isPinned || false,
        tags: note.tags || []
      })
    });
  },

  // Update note
  updateNote: async (id, noteUpdates) => {
    return request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteUpdates)
    });
  },

  // Delete note
  deleteNote: async (id) => {
    return request(`/notes/${id}`, {
      method: 'DELETE'
    });
  },

  // Fetch all users
  getUsers: async () => {
    return request('/users');
  },

  // Fetch profile for single user
  getUserProfile: async (userId) => {
    return request(`/profile/${userId}`);
  }
};
