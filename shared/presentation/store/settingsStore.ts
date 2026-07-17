import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { mmkvStorage } from '../lib/mmkvStorage';

interface AppSettings {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
}

interface SettingsState {
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
    resetSettings: () => void;
}

const defaultSettings: AppSettings = {
    theme: 'auto',
    language: 'vi',
    notifications: true,
};

// Temporarily disable MMKV persist
export const useSettingsStore = create<SettingsState>()((set) => ({
    settings: defaultSettings,
    updateSettings: (newSettings) =>
        set((state) => ({
            settings: { ...state.settings, ...newSettings },
        })),
    resetSettings: () => set({ settings: defaultSettings }),
}));
