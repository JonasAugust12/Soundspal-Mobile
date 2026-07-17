import { apiClient } from '@/shared/infrastructure/api/apiClient';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import {
    BLOG_UPLOAD_LOG_PREFIX,
    previewUri,
    serializeUploadError,
} from '@/features/blog/data/utils/blogUploadUtils';

export interface LocalImageAsset {
    uri: string;
    name?: string | null;
    mimeType?: string | null;
}

function extensionForImageMime(mime: string): string {
    const m = mime.toLowerCase();
    if (m.includes('png')) return 'png';
    if (m.includes('webp')) return 'webp';
    if (m.includes('gif')) return 'gif';
    if (m.includes('heic')) return 'heic';
    return 'jpg';
}

export function resolveBlogMediaFileMeta(asset: LocalImageAsset): { name: string; mime: string } {
    const mime = asset.mimeType?.trim() || 'image/jpeg';
    const raw = asset.name?.trim();
    const hasExtension = raw ? /\.[a-z0-9]{2,8}$/i.test(raw) : false;
    const name = raw && hasExtension ? raw : `cover_${Date.now()}.${extensionForImageMime(mime)}`;
    return { name, mime };
}

export function apiMediaKindFromMime(mime: string): string {
    const m = mime.toLowerCase();
    if (m.startsWith('video/')) return 'video';
    if (m.startsWith('audio/')) return 'audio';
    return 'image';
}

export function extractStorageUploadUrl(payload: unknown): string {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid upload response');
    }
    const root = payload as Record<string, unknown>;
    if (typeof root.url === 'string' && root.url.length > 0) {
        return root.url;
    }
    const nested = root.data;
    if (nested && typeof nested === 'object') {
        const d = nested as Record<string, unknown>;
        if (typeof d.url === 'string' && d.url.length > 0) {
            return d.url;
        }
        if (typeof d.file_url === 'string' && d.file_url.length > 0) {
            return d.file_url;
        }
    }
    throw new Error('Invalid upload response: missing URL');
}

export async function postStorageUploadWithFetch(form: FormData): Promise<unknown> {
    const base = apiClient.defaults.baseURL?.replace(/\/$/, '') ?? '';
    const url = `${base}/storage/upload`;
    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    console.warn(`${BLOG_UPLOAD_LOG_PREFIX}[step:storage:transport] fetch →`, url);

    const controller = new AbortController();
    const timeoutMs = 120_000;
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: form,
            signal: controller.signal,
        });
        clearTimeout(tid);

        const text = await res.text();
        console.warn(
            `${BLOG_UPLOAD_LOG_PREFIX}[step:storage:fetch_status]`,
            `${res.status} ${res.statusText}`,
            text.length > 1000 ? `${text.slice(0, 1000)}… (truncated)` : text,
        );

        if (!res.ok) {
            throw new Error(`Storage upload failed: HTTP ${res.status} — ${text.slice(0, 400)}`);
        }

        try {
            return JSON.parse(text) as unknown;
        } catch {
            throw new Error(`Storage upload: expected JSON body, got: ${text.slice(0, 240)}`);
        }
    } catch (err) {
        clearTimeout(tid);
        throw err;
    }
}

export { previewUri, serializeUploadError };
