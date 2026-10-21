import { create } from 'zustand';
import api from '../services/api';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('iroof_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  return localStorage.getItem('iroof_token') || null;
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  role: getInitialUser()?.role || null,
  isAuthenticated: !!getInitialToken(),
  isLoading: false,

  login: (user, token) => {
    localStorage.setItem('iroof_token', token);
    localStorage.setItem('iroof_user', JSON.stringify(user));
    set({
      user,
      token,
      role: user?.role || null,
      isAuthenticated: true
    });
  },

  logout: () => {
    localStorage.removeItem('iroof_token');
    localStorage.removeItem('iroof_user');
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false
    });
  },

  setUser: (user) => {
    localStorage.setItem('iroof_user', JSON.stringify(user));
    set({
      user,
      role: user?.role || null
    });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      get().logout();
      return null;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        get().setUser(response.data.user);
        set({ isAuthenticated: true, isLoading: false });
        return response.data.user;
      }
    } catch {
      get().logout();
    } finally {
      set({ isLoading: false });
    }
    return null;
  }
}));
