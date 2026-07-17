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

function extractRoute(message?: RemoteMessage | null): string | null {
    return resolvePushRoute(message?.data as PushNotificationData | undefined);
}

/** Gọi MỘT lần ở app/_layout.tsx — các listener là global, đăng ký nhiều lần sẽ nhân bản. */
export function usePushNotifications() {
    const router = useRouter();
    const { showInfo } = useToast();

    useEffect(() => {
        const messaging = getMessaging(getApp());

        // Foreground: OS không hiện banner, phải tự hiển thị.
        const unsubscribeOnMessage = onMessage(messaging, async (message) => {
            const title = message.notification?.title ?? 'Thông báo mới';
            const body = message.notification?.body ?? '';
            showInfo(title, body);
        });

        const unsubscribeOpened = onNotificationOpenedApp(messaging, (message) => {
            const route = extractRoute(message);
            if (route) router.push(route as Href);
        });

        // Bấm thông báo lúc app đã bị kill: onNotificationOpenedApp không bắn, phải hỏi riêng.
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
