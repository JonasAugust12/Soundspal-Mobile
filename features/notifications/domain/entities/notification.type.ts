export type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

export interface DevicePayload {
    device_id: string;
    fcm_token: string | null;
    platform: DevicePlatform;
}

export interface RegisterDeviceRequest {
    device_id: string;
    fcm_token: string;
    platform: DevicePlatform;
}

export interface RegisterDeviceResponse {
    code: number;
    message: string;
    data: null;
}

/** `data` của push. Mỗi producer một quy ước đặt tên, xem resolvePushRoute. */
export interface PushNotificationData {
    type?: string; // 'new_application' | 'application_status_changed' | 'new_message'

    // job-post-service
    job_id?: string;
    submission_id?: string;
    new_status?: string;

    // messaging-service — gửi camelCase, không kèm `type`
    conversationId?: string;
    messageId?: string;
    conversation_id?: string;
    message_id?: string;

    route?: string;
    path?: string;
}
