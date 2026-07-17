import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    RegisterDeviceRequest,
    RegisterDeviceResponse,
} from '@/features/notifications/domain/entities/notification.type';

export const notificationRemoteDataSource = {
    registerDeviceToken: createApiCall<RegisterDeviceResponse, RegisterDeviceRequest>(
        'POST',
        '/auth/device-token',
    ),
};
