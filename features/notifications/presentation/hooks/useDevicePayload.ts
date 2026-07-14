import { getApp } from '@react-native-firebase/app';
import {
    getMessaging,
    getToken,
    requestPermission,
    AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { getOrCreateDeviceId, resolvePlatform } from '@/features/notifications/data/deviceInfo';
import type { DevicePayload } from '@/features/notifications/domain/entities/notification.type';

// Không để login bị treo nếu native call bị kẹt — trả fallback sau `ms`.
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

// Xin quyền + lấy FCM token. Trả null nếu user từ chối / lỗi — vẫn cho login bình thường.
async function requestAndGetToken(): Promise<string | null> {
    try {
        const messaging = getMessaging(getApp());

        const status = await requestPermission(messaging);
        const granted =
            status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
        if (!granted) return null;

        const token = await getToken(messaging);
        return token || null;
    } catch (error) {
        console.warn('useDevicePayload: không lấy được FCM token', error);
        return null;
    }
}

export const useDevicePayload = () => {
    // Gọi ngay trước khi login / mobile-oauth để đính kèm thông tin thiết bị.
    // Lần đầu sẽ hiện popup xin quyền; các lần sau getToken chạy nhanh.
    const getDevicePayload = async (): Promise<DevicePayload> => {
        const fcm_token = await withTimeout(requestAndGetToken(), 5000, null);
        return {
            device_id: getOrCreateDeviceId(),
            fcm_token,
            platform: resolvePlatform(),
        };
    };

    return { getDevicePayload };
};
