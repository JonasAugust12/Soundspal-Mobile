import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { mmkvStorage } from '../lib/mmkvStorage';
import { ColorScheme } from '@/shared/domain/constants/colors';
import { Appearance } from 'react-native';

interface ThemeState {
    colorScheme: ColorScheme;
    isDark: boolean;
    setColorScheme: (scheme: ColorScheme) => void;
    toggleTheme: () => void;
}

const getIsDark = (scheme: ColorScheme): boolean => {
    if (scheme === 'auto') {
        return Appearance.getColorScheme() === 'dark';
    }
    return scheme === 'dark';
};

// Temporarily disable MMKV persist
export const useThemeStore = create<ThemeState>()((set, get) => ({
    colorScheme: 'auto',
    isDark: getIsDark('auto'),

    setColorScheme: (scheme) => {
        set({
            colorScheme: scheme,
            isDark: getIsDark(scheme),
        });
    },

    toggleTheme: () => {
        const current = get().colorScheme;
        const newScheme = current === 'dark' ? 'light' : 'dark';
        set({
            colorScheme: newScheme,
            isDark: getIsDark(newScheme),
        });
    },
}));

// Listen to system theme changes
Appearance.addChangeListener(() => {
    const state = useThemeStore.getState();
    if (state.colorScheme === 'auto') {
        useThemeStore.setState({ isDark: getIsDark('auto') });
    }
});
