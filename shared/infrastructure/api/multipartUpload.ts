import { apiClient } from '@/shared/infrastructure/api/apiClient';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';

export interface MultipartUploadOptions {
    /** Timeout tính bằng ms. Mặc định 120s cho upload ảnh/video. */
    timeoutMs?: number;
}

/**
 * POST multipart/form-data qua `fetch` thay vì axios.
 *
 * Vì sao không dùng axios: axios 1.x trên React Native không gửi được FormData —
 * body bị bỏ trống nên request hỏng ở tầng transport và báo `ERR_NETWORK`
 * (status/data đều undefined). Đây cũng là lý do blog upload đã chuyển sang fetch.
 * `fetch` native tự đặt `Content-Type: multipart/form-data` kèm boundary đúng chuẩn,
 * nên KHÔNG được set Content-Type thủ công ở đây.
 *
 * Lưu ý: đường này không đi qua interceptor refresh 401 của axios (interceptor đó vốn
 * cũng không replay được multipart). Token được đọc từ store tại thời điểm gọi.
 */
export async function postMultipartWithFetch<T = unknown>(
    path: string,
    form: FormData,
    options: MultipartUploadOptions = {},
): Promise<T> {
    const base = apiClient.defaults.baseURL?.replace(/\/$/, '') ?? '';
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
    const token = useAuthStore.getState().accessToken;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 120_000;
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: form,
            signal: controller.signal,
        });

        const text = await res.text();

        if (!res.ok) {
            throw new Error(`Upload failed: HTTP ${res.status} — ${text.slice(0, 400)}`);
        }

        try {
            return JSON.parse(text) as T;
        } catch {
            throw new Error(`Upload: expected JSON body, got: ${text.slice(0, 240)}`);
        }
    } finally {
        clearTimeout(tid);
    }
}

/**
 * Bóc lớp bọc `{ code, message, data }` nếu server trả về dạng envelope;
 * nếu server trả thẳng object thì giữ nguyên. Giúp caller luôn nhận đúng item.
 */
export function unwrapUploadPayload<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const inner = (payload as { data?: unknown }).data;
        if (inner && typeof inner === 'object') {
            return inner as T;
        }
    }
    return payload as T;
}
