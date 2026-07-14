import { useEffect } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onTokenRefresh } from '@react-native-firebase/messaging';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { getOrCreateDeviceId, resolvePlatform } from '@/features/notifications/data/deviceInfo';
import { notificationRemoteDataSource } from '@/features/notifications/data/datasources/notificationRemoteDataSource';

/**
 * Token FCM tự xoay vòng theo thời gian. Khi đã đăng nhập, lắng nghe onTokenRefresh và
 * đẩy token mới lên backend để push không bị chết.
 *
 * ⚠️ Phụ thuộc endpoint POST /auth/device-token — backend CHƯA có (khuyến nghị #2).
 * Trước khi backend bổ sung, lời gọi sẽ 404 và bị nuốt lặng ở catch.
 */
export function usePushTokenSync() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        const messaging = getMessaging(getApp());
        const unsubscribe = onTokenRefresh(messaging, async (token) => {
            try {
                await notificationRemoteDataSource.registerDeviceToken({
                    device_id: getOrCreateDeviceId(),
                    fcm_token: token,
                    platform: resolvePlatform(),
                });
            } catch (error) {
                console.warn('usePushTokenSync: cập nhật token thất bại', error);
            }
        });

        return unsubscribe;
    }, [isAuthenticated]);
}
