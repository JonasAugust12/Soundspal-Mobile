// In-memory thay cho MMKV (jest.setup chỉ mock class MMKV, storage.ts dùng createMMKV).
const mockStore: Record<string, string | undefined> = {};
jest.mock('@/shared/infrastructure/storage/storage', () => ({
    storage: {
        getString: (key: string) => mockStore[key],
        set: (key: string, value: string) => {
            mockStore[key] = value;
        },
        remove: (key: string) => {
            delete mockStore[key];
        },
    },
}));

jest.mock('@/features/notifications/data/datasources/notificationRemoteDataSource', () => ({
    notificationRemoteDataSource: { registerDeviceToken: jest.fn(() => Promise.resolve()) },
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import { getToken, onTokenRefresh } from '@react-native-firebase/messaging';
import { usePushTokenSync } from '@/features/notifications/presentation/hooks/usePushTokenSync';
import { notificationRemoteDataSource } from '@/features/notifications/data/datasources/notificationRemoteDataSource';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';

const registerDeviceToken = notificationRemoteDataSource.registerDeviceToken as jest.Mock;

function setAuthenticated(value: boolean) {
    useAuthStore.setState({ isAuthenticated: value });
}

describe('usePushTokenSync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        for (const key of Object.keys(mockStore)) delete mockStore[key];
        (getToken as jest.Mock).mockResolvedValue('test-fcm-token');
        setAuthenticated(true);
    });

    describe('lớp chủ động (lúc mở app)', () => {
        it('đẩy token lên backend khi chưa từng đồng bộ', async () => {
            renderHook(() => usePushTokenSync());

            await waitFor(() => expect(registerDeviceToken).toHaveBeenCalledTimes(1));
            expect(registerDeviceToken).toHaveBeenCalledWith(
                expect.objectContaining({ fcm_token: 'test-fcm-token' }),
            );
        });

        it('đẩy token mới khi OS đã xoay token lúc app bị kill', async () => {
            mockStore['synced_fcm_token'] = 'token-cu';
            (getToken as jest.Mock).mockResolvedValue('token-moi');

            renderHook(() => usePushTokenSync());

            await waitFor(() => expect(registerDeviceToken).toHaveBeenCalledTimes(1));
            expect(registerDeviceToken).toHaveBeenCalledWith(
                expect.objectContaining({ fcm_token: 'token-moi' }),
            );
        });

        it('bỏ qua API khi token không đổi so với lần đồng bộ trước', async () => {
            mockStore['synced_fcm_token'] = 'test-fcm-token';

            renderHook(() => usePushTokenSync());

            await waitFor(() => expect(getToken).toHaveBeenCalled());
            expect(registerDeviceToken).not.toHaveBeenCalled();
        });

        it('lưu token xuống storage sau khi đẩy thành công', async () => {
            renderHook(() => usePushTokenSync());

            await waitFor(() => expect(mockStore['synced_fcm_token']).toBe('test-fcm-token'));
        });

        it('không lưu cache khi API lỗi, để lần mở app sau thử lại', async () => {
            registerDeviceToken.mockRejectedValueOnce(new Error('network'));

            renderHook(() => usePushTokenSync());

            await waitFor(() => expect(registerDeviceToken).toHaveBeenCalled());
            expect(mockStore['synced_fcm_token']).toBeUndefined();
        });

        it('không gọi gì khi chưa đăng nhập', async () => {
            setAuthenticated(false);

            renderHook(() => usePushTokenSync());

            await waitFor(() => expect(getToken).not.toHaveBeenCalled());
            expect(registerDeviceToken).not.toHaveBeenCalled();
        });
    });

    describe('lớp thụ động (onTokenRefresh)', () => {
        it('đẩy token và cập nhật cache khi FCM xoay token lúc app đang mở', async () => {
            mockStore['synced_fcm_token'] = 'test-fcm-token';
            renderHook(() => usePushTokenSync());

            const calls = (onTokenRefresh as jest.Mock).mock.calls;
            await calls[calls.length - 1][1]('token-xoay-vong');

            expect(registerDeviceToken).toHaveBeenCalledWith(
                expect.objectContaining({ fcm_token: 'token-xoay-vong' }),
            );
            expect(mockStore['synced_fcm_token']).toBe('token-xoay-vong');
        });
    });
});
