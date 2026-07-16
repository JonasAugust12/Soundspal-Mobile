// In-memory thay cho MMKV (jest.setup chỉ mock class MMKV, storage.ts dùng createMMKV).
const mockStore: Record<string, string | undefined> = {};
jest.mock('@/shared/infrastructure/storage/storage', () => ({
    storage: {
        getString: (key: string) => mockStore[key],
        set: (key: string, value: string) => {
            mockStore[key] = value;
        },
    },
}));

import { Platform } from 'react-native';
import { getOrCreateDeviceId, resolvePlatform } from '@/features/notifications/data/deviceInfo';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('deviceInfo', () => {
    beforeEach(() => {
        for (const key of Object.keys(mockStore)) delete mockStore[key];
    });

    describe('getOrCreateDeviceId', () => {
        it('tạo device_id dạng UUID v4 hợp lệ trong lần gọi đầu', () => {
            const id = getOrCreateDeviceId();
            expect(id).toMatch(UUID_V4);
        });

        it('lưu lại và trả cùng một id ở các lần gọi sau (ổn định theo lần cài)', () => {
            const first = getOrCreateDeviceId();
            const second = getOrCreateDeviceId();
            expect(second).toBe(first);
            expect(mockStore['device_id']).toBe(first);
        });

        it('đọc lại id đã có sẵn trong storage thay vì tạo mới', () => {
            mockStore['device_id'] = 'existing-device-id';
            expect(getOrCreateDeviceId()).toBe('existing-device-id');
        });
    });

    describe('resolvePlatform', () => {
        const originalOS = Platform.OS;
        afterEach(() => {
            Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
        });

        it('trả ANDROID trên Android', () => {
            Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
            expect(resolvePlatform()).toBe('ANDROID');
        });

        it('trả IOS trên iOS', () => {
            Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
            expect(resolvePlatform()).toBe('IOS');
        });

        it('trả WEB cho nền tảng còn lại', () => {
            Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
            expect(resolvePlatform()).toBe('WEB');
        });
    });
});
