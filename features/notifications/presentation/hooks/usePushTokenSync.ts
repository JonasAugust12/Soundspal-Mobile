import { useEffect } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, onTokenRefresh } from '@react-native-firebase/messaging';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import {
    getOrCreateDeviceId,
    getSyncedFcmToken,
    resolvePlatform,
    setSyncedFcmToken,
} from '@/features/notifications/data/deviceInfo';
import { notificationRemoteDataSource } from '@/features/notifications/data/datasources/notificationRemoteDataSource';

/** Đẩy token lên backend rồi mới ghi cache — API lỗi thì lần mở app sau còn thử lại. */
async function pushTokenToBackend(token: string): Promise<void> {
    await notificationRemoteDataSource.registerDeviceToken({
        device_id: getOrCreateDeviceId(),
        fcm_token: token,
        platform: resolvePlatform(),
    });
    setSyncedFcmToken(token);
}

/** FCM tự xoay vòng token; không đẩy token mới lên backend thì push sẽ chết im lặng. */
export function usePushTokenSync() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        const messaging = getMessaging(getApp());
        let cancelled = false;

        // Lớp chủ động: onTokenRefresh chỉ bắn khi app còn sống, token xoay lúc app bị
        // kill sẽ không ai nghe. Nên mỗi lần mở app phải tự hỏi lại OS rồi đối chiếu.
        const syncOnStartup = async () => {
            try {
                const token = await getToken(messaging);
                if (cancelled || !token || token === getSyncedFcmToken()) return;

                await pushTokenToBackend(token);
            } catch (error) {
                console.warn('usePushTokenSync: đồng bộ token lúc mở app thất bại', error);
            }
        };

        void syncOnStartup();

        // Lớp thụ động: bắt token xoay ngay trong phiên đang chạy.
        const unsubscribe = onTokenRefresh(messaging, async (token) => {
            try {
                await pushTokenToBackend(token);
            } catch (error) {
                console.warn('usePushTokenSync: cập nhật token thất bại', error);
            }
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [isAuthenticated]);
}
