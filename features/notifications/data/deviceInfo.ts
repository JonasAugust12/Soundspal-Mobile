import { Platform } from 'react-native';
import { storage } from '@/shared/infrastructure/storage/storage';
import type { DevicePlatform } from '@/features/notifications/domain/entities/notification.type';

const DEVICE_ID_KEY = 'device_id';

function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/** Backend dùng device_id để phân biệt thiết bị, nên nó phải ổn định qua các lần mở app. */
export function getOrCreateDeviceId(): string {
    const existing = storage.getString(DEVICE_ID_KEY);
    if (existing) return existing;

    const id = generateUuid();
    storage.set(DEVICE_ID_KEY, id);
    return id;
}

export function resolvePlatform(): DevicePlatform {
    if (Platform.OS === 'ios') return 'IOS';
    if (Platform.OS === 'android') return 'ANDROID';
    return 'WEB';
}
