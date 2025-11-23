import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

