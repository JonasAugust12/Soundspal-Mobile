import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/shared/infrastructure/storage/mmkvStorage';

interface AuthUser {
    id: string;
    email: string;
    role: string;
    is_verified?: boolean;
    username?: string;
    avatar_url?: string;
    display_name?: string;
    tier?: string;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;

    // Actions
    setCredentials: (data: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
    setUser: (user: AuthUser) => void;
    updateAvatarUrl: (avatarUrl: string) => void;
    updateDisplayName: (displayName: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,

            setCredentials: ({ accessToken, refreshToken, user }) => {
                set({
                    accessToken,
                    refreshToken,
                    user,
                    isAuthenticated: true,
                });
            },

            // Làm mới thông tin user (vd: từ /users/me khi mở app) mà không đụng tới token.
            setUser: (user) => {
                set({ user, isAuthenticated: true });
            },

            updateAvatarUrl: (avatarUrl) => {
                set((state) => {
                    if (state.user) {
                        const updatedUser = { ...state.user, avatar_url: avatarUrl };
                        return { user: updatedUser };
                    }
                    return state;
                });
            },

            updateDisplayName: (displayName) => {
                set((state) => {
                    if (state.user) {
                        const updatedUser = { ...state.user, display_name: displayName };
                        return { user: updatedUser };
                    }
                    return state;
                });
            },

            logout: () => {
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => mmkvStorage),
        },
    ),
);
