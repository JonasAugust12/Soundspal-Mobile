// Nền tảng thiết bị — khớp với giá trị backend mong đợi ('ANDROID' | 'IOS' | 'WEB').
export type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

// Thông tin thiết bị gửi kèm khi login / mobile-oauth để backend lưu vào DeviceRegistration.
export interface DevicePayload {
    device_id: string;
    fcm_token: string | null;
    platform: DevicePlatform;
}

// Body cho endpoint cập nhật token riêng (dùng cho onTokenRefresh).
// Backend: POST /auth/device-token (user-service) — phát lại event device-lifecycle.
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

// Data payload backend đính kèm push (job-post-service phát notification-requested).
// Không có sẵn 'route' — đường dẫn được dựng từ 'type' + id (xem resolvePushRoute).
export interface PushNotificationData {
    type?: string; // 'new_application' | 'application_status_changed'
    job_id?: string;
    submission_id?: string;
    new_status?: string;
    // Tương thích ngược: producer khác có thể gửi sẵn đường dẫn.
    route?: string;
    path?: string;
}
