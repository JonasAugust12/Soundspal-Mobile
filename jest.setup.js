/* eslint-disable @typescript-eslint/no-unused-vars */
// Extend Jest matchers with React Native specific matchers
// Note: @testing-library/jest-native is deprecated, using built-in matchers from react-native
// import '@testing-library/jest-native/extend-expect';

// Mock MMKV storage FIRST before any imports
jest.mock('react-native-mmkv', () => ({
    MMKV: jest.fn(() => ({
        getString: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clearAll: jest.fn(),
    })),
}));

// Mock mmkvStorage module
jest.mock('@/shared/infrastructure/storage/mmkvStorage', () => ({
    mmkvStorage: {
        getItem: jest.fn((key) => null),
        setItem: jest.fn((key, value) => {}),
        removeItem: jest.fn((key) => {}),
    },
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
    hide: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useSegments: jest.fn(),
    usePathname: jest.fn(),
    useLocalSearchParams: jest.fn(),
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
    },
    Link: 'Link',
    Redirect: 'Redirect',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

// Mock react-native-keyboard-controller with its official Jest mock
// (the native module is not linked in the Jest environment)
jest.mock('react-native-keyboard-controller', () =>
    require('react-native-keyboard-controller/jest'),
);

// Silence console errors/warnings in tests unless explicitly needed
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
