import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { mmkvStorage } from '../lib/mmkvStorage';

interface UserState {
    user: { name: string; email: string } | null;
    setUser: (user: { name: string; email: string } | null) => void;
    clearUser: () => void;
}

// Temporarily disable MMKV persist
export const useUserStore = create<UserState>()((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}));
