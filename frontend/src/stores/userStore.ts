import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { api } from '@/lib/api';

interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  initFromStorage: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setUser: (user, token) => {
        localStorage.setItem('nexus_token', token);
        set({ user, token });
      },

      clearUser: () => {
        localStorage.removeItem('nexus_token');
        set({ user: null, token: null });
      },

      initFromStorage: async () => {
        const token = localStorage.getItem('nexus_token');
        if (!token || get().user) return;
        try {
          const user = await api.users.me();
          set({ user, token });
        } catch {
          localStorage.removeItem('nexus_token');
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: 'nexus-user',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
