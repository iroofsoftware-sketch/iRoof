import api from './api';

export const searchService = {
  globalSearch: async (q) => {
    if (!q || q.trim().length < 2) return { success: true, count: 0, data: [] };
    const res = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
    return res.data;
  }
};
