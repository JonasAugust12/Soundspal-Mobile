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

type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

// Backend đính đường dẫn deep-link trong data payload (vd data.route = '/(messages)/123').
function extractRoute(message?: RemoteMessage | null): string | null {
    const route = message?.data?.route ?? message?.data?.path;
    return typeof route === 'string' && route.length > 0 ? route : null;
}

/**
 * Đăng ký các listener nhận thông báo. Gọi MỘT lần ở app/_layout.tsx.
 * - Foreground: OS không tự hiện banner → hiện toast in-app.
 * - Bấm thông báo (background/killed): điều hướng theo data.route.
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
