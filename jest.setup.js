/* eslint-disable @typescript-eslint/no-unused-vars */
// Extend Jest matchers with React Native specific matchers
// Note: @testing-library/jest-native is deprecated, using built-in matchers from react-native
// import '@testing-library/jest-native/extend-expect';

// Mock MMKV storage FIRST before any imports.
// storage.ts dùng `createMMKV` (API của MMKV 4) — không phải `MMKV` của bản cũ. Mock cả hai
// để mọi đường import tới storage.ts đều nạp được, kèm một Map trong bộ nhớ để những hàm
// đọc-rồi-ghi (vd getOrCreateDeviceId) hành xử nhất quán trong một test.
jest.mock('react-native-mmkv', () => {
    const createStore = () => {
        const data = new Map();
        return {
            getString: jest.fn((key) => data.get(key)),
            getNumber: jest.fn((key) => data.get(key)),
            getBoolean: jest.fn((key) => data.get(key)),
            contains: jest.fn((key) => data.has(key)),
            set: jest.fn((key, value) => {
                data.set(key, value);
            }),
            remove: jest.fn((key) => {
                data.delete(key);
            }),
            delete: jest.fn((key) => {
                data.delete(key);
            }),
            clearAll: jest.fn(() => {
                data.clear();
            }),
        };
    };

    return {
        createMMKV: jest.fn(createStore),
        MMKV: jest.fn(createStore),
    };
});

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
    usePathname: jest.fn(() => '/'),
    useLocalSearchParams: jest.fn(() => ({})),
    useGlobalSearchParams: jest.fn(() => ({})),
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

// Mock @react-native-firebase (native modules not linked in the Jest environment)
jest.mock('@react-native-firebase/app', () => ({
    getApp: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/messaging', () => ({
    getMessaging: jest.fn(() => ({})),
    getToken: jest.fn(() => Promise.resolve('test-fcm-token')),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    onMessage: jest.fn(() => jest.fn()),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    onTokenRefresh: jest.fn(() => jest.fn()),
    setBackgroundMessageHandler: jest.fn(),
    AuthorizationStatus: { NOT_DETERMINED: -1, DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2 },
}));

// Silence console errors/warnings in tests unless explicitly needed
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
