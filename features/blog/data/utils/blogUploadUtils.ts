import axios from 'axios';

const BLOG_UPLOAD_LOG_PREFIX = '[BlogMediaUpload]';

export function serializeUploadError(err: unknown): Record<string, unknown> {
    if (axios.isAxiosError(err)) {
        return {
            kind: 'AxiosError',
            message: err.message,
            code: err.code,
            httpStatus: err.response?.status,
            statusText: err.response?.statusText,
            responseBody: err.response?.data,
            requestMethod: err.config?.method,
            requestUrl: err.config?.url,
            baseURL: err.config?.baseURL,
        };
    }
    if (err instanceof Error) {
        return { kind: 'Error', name: err.name, message: err.message };
    }
    return { kind: 'unknown', value: String(err) };
}

export function previewUri(uri: string): string {
    if (uri.length <= 96) return uri;
    return `${uri.slice(0, 96)}…`;
}

export function logBlogUploadFailure(context: string, error: unknown): void {
    console.warn(
        `${BLOG_UPLOAD_LOG_PREFIX}[FAIL:${context}]`,
        JSON.stringify(serializeUploadError(error), null, 2),
    );
}

export { BLOG_UPLOAD_LOG_PREFIX };
