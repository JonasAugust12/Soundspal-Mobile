import { useEffect } from 'react';
import { useRouter, type Href } from 'expo-router';
import { getApp } from '@react-native-firebase/app';
import {
    getMessaging,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
    type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { resolvePushRoute } from '@/features/notifications/domain/utils/resolvePushRoute';
import type { PushNotificationData } from '@/features/notifications/domain/entities/notification.type';

type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

// Dựng deep-link từ data backend gửi ({ type, job_id, ... }) — xem resolvePushRoute.
function extractRoute(message?: RemoteMessage | null): string | null {
    return resolvePushRoute(message?.data as PushNotificationData | undefined);
}

/**
 * Đăng ký các listener nhận thông báo. Gọi MỘT lần ở app/_layout.tsx.
 * - Foreground: OS không tự hiện banner → hiện toast in-app.
 * - Bấm thông báo (background/killed): điều hướng theo data payload (resolvePushRoute).
 */
export function usePushNotifications() {
    const router = useRouter();
    const { showInfo } = useToast();

    useEffect(() => {
        const messaging = getMessaging(getApp());

        // 1. App đang mở: hiện toast (dùng luôn hệ thống toast sẵn có).
        const unsubscribeOnMessage = onMessage(messaging, async (message) => {
            const title = message.notification?.title ?? 'Thông báo mới';
            const body = message.notification?.body ?? '';
            showInfo(title, body);
        });

        // 2. App ở background, user bấm thông báo → điều hướng.
        const unsubscribeOpened = onNotificationOpenedApp(messaging, (message) => {
            const route = extractRoute(message);
            if (route) router.push(route as Href);
        });

        // 3. App bị kill, mở lại do bấm thông báo.
        getInitialNotification(messaging).then((message) => {
            const route = extractRoute(message);
            if (route) router.push(route as Href);
        });

        return () => {
            unsubscribeOnMessage();
            unsubscribeOpened();
        };
        // showInfo tạo mới mỗi render (giống pattern useProtectedRoute) → chỉ phụ thuộc router.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);
}
