import type { PushNotificationData } from '@/features/notifications/domain/entities/notification.type';

/**
 * Dựng đường dẫn deep-link từ data payload của push notification.
 *
 * Backend (job-post-service) phát `notification-requested` với data dạng
 *   { type, job_id, submission_id, new_status } — KHÔNG có sẵn 'route'.
 *
 * - `new_application` (gửi tới venue): mở danh sách đơn ứng tuyển của job đó.
 * - `application_status_changed` (gửi tới artist): mở màn "Đơn của tôi".
 *
 * Vẫn ưu tiên `route`/`path` nếu một producer khác gửi sẵn đường dẫn.
 * Trả `null` khi không suy ra được (chỉ mở app, không điều hướng).
 */
export function resolvePushRoute(data?: PushNotificationData | null): string | null {
    if (!data) return null;

    const explicit = data.route ?? data.path;
    if (typeof explicit === 'string' && explicit.length > 0) {
        return explicit;
    }

    switch (data.type) {
        case 'new_application':
            return data.job_id ? `/(jobs)/applicants?id=${data.job_id}` : null;
        case 'application_status_changed':
            return '/(jobs)/my-applications';
        default:
            return null;
    }
}
