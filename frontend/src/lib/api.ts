import axios from 'axios';

// Get API URL from runtime config or fallback to localhost
const getApiUrl = () => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Try to get from window object (can be set by a config endpoint)
    return (window as any).__API_URL__ || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  // Server-side: use environment variable
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Document APIs
export const documentApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/api/documents');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/documents/${id}`);
    return response.data;
  },
};

// Chat APIs
export const chatApi = {
  sendMessage: async (message: string, sessionId?: string) => {
    const response = await api.post('/api/chat', { message, sessionId });
    return response.data;
  },

  getHistory: async (sessionId: string) => {
    const response = await api.get(`/api/chat/history/${sessionId}`);
    return response.data;
  },
};

