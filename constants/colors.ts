export const colors = {
    primary01: '#7D3BED',
    primary02: '#F471B7',
    secondary01: '#B39EF5', // lighter version of primary01
    secondary02: '#F9B8DD', // lighter version of primary02

    // Light mode
    light: {
        border01: '#d2d2d2',
        border02: '#e7e7e7',
        text: '#696969',
        subtext: '#a9a9a9',
        background: '#ffffff',
        backgroundSlate: '#f5f5f0',
        foreground: '#171717',
        hover: '#f0ede8',
        card: '#ffffff',
        surface: '#f5f5f5',
    },

    // Dark mode
    dark: {
        border01: '#3d3d3d',
        border02: '#2a2a2a',
        text: '#e0e0e0',
        subtext: '#9a9a9a',
        background: '#0a0a0a',
        backgroundSlate: '#1a1a1a',
        foreground: '#ffffff',
        hover: '#2a2a2a',
        card: '#1a1a1a',
        surface: '#262626',
    },

    // Status colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
};

export type ColorScheme = 'light' | 'dark' | 'auto';
