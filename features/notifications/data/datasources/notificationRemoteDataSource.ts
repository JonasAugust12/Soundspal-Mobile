import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    RegisterDeviceRequest,
    RegisterDeviceResponse,
} from '@/features/notifications/domain/entities/notification.type';

export const notificationRemoteDataSource = {
    // ⚠️ Endpoint dự kiến — backend CHƯA có (khuyến nghị #2). Dùng cho onTokenRefresh khi
    // token FCM xoay vòng giữa phiên. Trước khi backend bổ sung, lời gọi này sẽ 404 và bị
    // nuốt lặng trong usePushTokenSync.
    registerDeviceToken: createApiCall<RegisterDeviceResponse, RegisterDeviceRequest>(
        'POST',
        '/auth/device-token',
    ),
};
