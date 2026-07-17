import { Platform, PermissionsAndroid } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
    getMessaging,
    getToken,
    requestPermission,
    AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { getOrCreateDeviceId, resolvePlatform } from '@/features/notifications/data/deviceInfo';
import type { DevicePayload } from '@/features/notifications/domain/entities/notification.type';

type Messaging = ReturnType<typeof getMessaging>;

const ANDROID_TIRAMISU = 33;

/**
 * ⚠️ `requestPermission()` của RNFirebase được đánh dấu `@platform ios` và chỉ
 * `return Promise.resolve(AUTHORIZED)` — KHÔNG hề hỏi user. Nếu tin vào nó thì trên
 * Android 13+ quyền POST_NOTIFICATIONS mặc định bị từ chối: FCM vẫn giao message
 * (background handler vẫn chạy) nhưng OS lặng lẽ không hiện banner. Vì vậy Android
 * phải tự xin quyền qua PermissionsAndroid.
 */
async function ensureNotificationPermission(messaging: Messaging): Promise<boolean> {
    if (Platform.OS === 'android') {
        // Dưới Android 13 quyền được cấp sẵn lúc cài đặt.
        if (Number(Platform.Version) < ANDROID_TIRAMISU) return true;

        const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    const status = await requestPermission(messaging);
    return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(fallback), ms);
        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(() => {
                clearTimeout(timer);
                resolve(fallback);
            });
    });
}

async function requestAndGetToken(): Promise<string | null> {
    try {
        const messaging = getMessaging(getApp());

        const granted = await ensureNotificationPermission(messaging);
        if (!granted) return null;

        const token = await getToken(messaging);
        return token || null;
    } catch (error) {
        console.warn('useDevicePayload: không lấy được FCM token', error);
        return null;
    }
}

export const useDevicePayload = () => {
    const getDevicePayload = async (): Promise<DevicePayload> => {
        // Timeout để native call treo không chặn được luồng login; thiếu token vẫn login được.
        const fcm_token = await withTimeout(requestAndGetToken(), 5000, null);
        return {
            device_id: getOrCreateDeviceId(),
            fcm_token,
            platform: resolvePlatform(),
        };
    };

    return { getDevicePayload };
};
