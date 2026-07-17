import type { PushNotificationData } from '@/features/notifications/domain/entities/notification.type';

/** Backend gửi lẫn snake_case (job-post-service) và camelCase (messaging-service). */
function pick(data: PushNotificationData, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = (data as Record<string, unknown>)[key];
        if (typeof value === 'string' && value.length > 0) return value;
    }
    return undefined;
}

const chatRoute = (conversationId: string) =>
    `/(messages)/detailMessage?conversationId=${conversationId}`;

/**
 * Suy route từ `type` + id trước, `route`/`path` chỉ là fallback: messaging-service
 * đính sẵn `route: "/(messages)/<id>"` nhưng route đó không tồn tại trong app.
 */
export function resolvePushRoute(data?: PushNotificationData | null): string | null {
    if (!data) return null;

    const type = pick(data, 'type');
    const conversationId = pick(data, 'conversation_id', 'conversationId');
    const jobId = pick(data, 'job_id', 'jobId');

    switch (type) {
        case 'new_application':
            return jobId ? `/(jobs)/applicants?id=${jobId}` : null;
        case 'application_status_changed':
            return '/(jobs)/my-applications';
        case 'new_message':
            return conversationId ? chatRoute(conversationId) : null;
    }

    // messaging-service không gửi `type`.
    if (conversationId) return chatRoute(conversationId);

    return pick(data, 'route', 'path') ?? null;
}
