import type { BlogApiSuccessEnvelope } from '@/features/blog/domain/entities/blog.type';

export function unwrapBlogData<T>(body: unknown, label: string): T {
    if (
        body &&
        typeof body === 'object' &&
        'data' in body &&
        (body as BlogApiSuccessEnvelope<T>).data !== undefined
    ) {
        return (body as BlogApiSuccessEnvelope<T>).data;
    }
    throw new Error(`Invalid response: ${label}`);
}
