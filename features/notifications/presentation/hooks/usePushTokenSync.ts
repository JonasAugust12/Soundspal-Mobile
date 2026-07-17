import { useEffect } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onTokenRefresh } from '@react-native-firebase/messaging';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { getOrCreateDeviceId, resolvePlatform } from '@/features/notifications/data/deviceInfo';
import { notificationRemoteDataSource } from '@/features/notifications/data/datasources/notificationRemoteDataSource';

/** FCM tự xoay vòng token; không đẩy token mới lên backend thì push sẽ chết im lặng. */
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
