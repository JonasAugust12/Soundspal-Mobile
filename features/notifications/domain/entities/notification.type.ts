// Nền tảng thiết bị — khớp với giá trị backend mong đợi ('ANDROID' | 'IOS' | 'WEB').
export type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

// Thông tin thiết bị gửi kèm khi login / mobile-oauth để backend lưu vào DeviceRegistration.
export interface DevicePayload {
    device_id: string;
    fcm_token: string | null;
    platform: DevicePlatform;
}

// Body cho endpoint cập nhật token riêng (dùng cho onTokenRefresh).
// ⚠️ Endpoint phía backend hiện CHƯA có — xem khuyến nghị #2 trong docs/features/notifications.md
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
