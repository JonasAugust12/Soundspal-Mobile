// storage.ts dùng createMMKV (không được mock trong jest.setup) → mock in-memory.
const mockStore: Record<string, string | undefined> = {};
jest.mock('@/shared/infrastructure/storage/storage', () => ({
    storage: {
        getString: (key: string) => mockStore[key],
        set: (key: string, value: string) => {
            mockStore[key] = value;
        },
    },
}));

import { Platform, PermissionsAndroid } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { requestPermission, getToken } from '@react-native-firebase/messaging';
import { useDevicePayload } from '@/features/notifications/presentation/hooks/useDevicePayload';

const AUTHORIZED = 1;
const DENIED = 0;

const originalOS = Platform.OS;
const originalVersion = Platform.Version;

function setPlatform(os: 'android' | 'ios', version: number | string) {
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
    Object.defineProperty(Platform, 'Version', { value: version, configurable: true });
}

// Lấy getDevicePayload qua renderHook (đúng chuẩn rules-of-hooks).
function renderGetDevicePayload() {
    return renderHook(() => useDevicePayload()).result.current.getDevicePayload;
}

describe('useDevicePayload.getDevicePayload', () => {
    let requestAndroid: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        for (const key of Object.keys(mockStore)) delete mockStore[key];
        (requestPermission as jest.Mock).mockResolvedValue(AUTHORIZED);
        (getToken as jest.Mock).mockResolvedValue('test-fcm-token');
        requestAndroid = jest
            .spyOn(PermissionsAndroid, 'request')
            .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
        Object.defineProperty(Platform, 'Version', { value: originalVersion, configurable: true });
    });

    describe('Android 13+ (API 33+)', () => {
        beforeEach(() => setPlatform('android', 33));

        it('xin POST_NOTIFICATIONS và đính token khi user đồng ý', async () => {
            const payload = await renderGetDevicePayload()();

            expect(requestAndroid).toHaveBeenCalledWith(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
            expect(payload.fcm_token).toBe('test-fcm-token');
            expect(payload.platform).toBe('ANDROID');
        });

        // Regression: bug cũ tin vào requestPermission() của RNFirebase — hàm này bị đánh dấu
        // @platform ios và chỉ `return Promise.resolve(AUTHORIZED)` trên Android, nên
        // POST_NOTIFICATIONS không bao giờ được hỏi → OS nuốt banner dù FCM đã giao message.
        it('KHÔNG dùng requestPermission() của RNFirebase trên Android (no-op luôn trả AUTHORIZED)', async () => {
            await renderGetDevicePayload()();

            expect(requestPermission).not.toHaveBeenCalled();
            expect(requestAndroid).toHaveBeenCalled();
        });

        it('fcm_token = null khi user từ chối quyền', async () => {
            requestAndroid.mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

            const payload = await renderGetDevicePayload()();

            expect(payload.fcm_token).toBeNull();
            expect(getToken).not.toHaveBeenCalled();
            // device_id/platform vẫn có để backend nhận diện thiết bị.
            expect(payload.device_id).toBeTruthy();
        });

        it('fcm_token = null khi user chọn "không hỏi lại"', async () => {
            requestAndroid.mockResolvedValue(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);

            const payload = await renderGetDevicePayload()();

            expect(payload.fcm_token).toBeNull();
        });
    });

    describe('Android < 13 (quyền cấp sẵn lúc cài)', () => {
        beforeEach(() => setPlatform('android', 32));

        it('không xin runtime permission, vẫn lấy được token', async () => {
            const payload = await renderGetDevicePayload()();

            expect(requestAndroid).not.toHaveBeenCalled();
            expect(payload.fcm_token).toBe('test-fcm-token');
        });
    });

    describe('iOS', () => {
        beforeEach(() => setPlatform('ios', '17.0'));

        it('dùng requestPermission của RNFirebase và đính token khi được cấp', async () => {
            const payload = await renderGetDevicePayload()();

            expect(requestPermission).toHaveBeenCalled();
            expect(requestAndroid).not.toHaveBeenCalled();
            expect(payload.fcm_token).toBe('test-fcm-token');
            expect(payload.platform).toBe('IOS');
        });

        it('fcm_token = null khi user từ chối', async () => {
            (requestPermission as jest.Mock).mockResolvedValue(DENIED);

            const payload = await renderGetDevicePayload()();

            expect(payload.fcm_token).toBeNull();
            expect(getToken).not.toHaveBeenCalled();
        });
    });

    describe('chung (không phụ thuộc nền tảng)', () => {
        beforeEach(() => setPlatform('android', 33));

        it('fcm_token = null khi getToken ném lỗi (không chặn login)', async () => {
            (getToken as jest.Mock).mockRejectedValue(new Error('native error'));

            const payload = await renderGetDevicePayload()();

            expect(payload.fcm_token).toBeNull();
        });

        it('dùng lại device_id đã lưu giữa các lần gọi', async () => {
            const getDevicePayload = renderGetDevicePayload();

            const first = await getDevicePayload();
            const second = await getDevicePayload();

            expect(first.device_id).toBeTruthy();
            expect(second.device_id).toBe(first.device_id);
        });

        it('timeout 5s → fcm_token null nếu native call bị treo (không treo login)', async () => {
            const getDevicePayload = renderGetDevicePayload();
            jest.useFakeTimers();
            (getToken as jest.Mock).mockImplementation(() => new Promise(() => {})); // không bao giờ resolve

            const pending = getDevicePayload();
            await jest.advanceTimersByTimeAsync(5000);
            const payload = await pending;

            expect(payload.fcm_token).toBeNull();
            jest.useRealTimers();
        });
    });
});
