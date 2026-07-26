import type { BlogTopic } from '@/features/blog/domain/entities/blog.type';

/** slug đơn giản khi backend không trả slug — bỏ dấu, thay ký tự lạ bằng "-". */
function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Bóc lớp `data` lồng nhau (dto.SuccessResponse) nếu có. */
function unwrap(raw: unknown): unknown {
    let current = raw;
    for (let i = 0; i < 3; i += 1) {
        if (
            current &&
            typeof current === 'object' &&
            !Array.isArray(current) &&
            'data' in (current as Record<string, unknown>)
        ) {
            current = (current as Record<string, unknown>).data;
        } else {
            break;
        }
    }
    return current;
}

function normalizeOne(raw: unknown): BlogTopic | undefined {
    if (!raw) return undefined;

    // Backend đôi khi trả mảng chuỗi tên chủ đề.
    if (typeof raw === 'string') {
        const name = raw.trim();
        if (!name) return undefined;
        const slug = slugify(name);
        return { id: slug, name, slug };
    }

    if (typeof raw !== 'object') return undefined;
    const topic = raw as Record<string, unknown>;
    const name = String(topic.name ?? topic.title ?? topic.slug ?? topic.id ?? '').trim();
    if (!name) return undefined;

    const slug = String(topic.slug ?? slugify(name)).trim();
    const id = String(topic.id ?? slug).trim();
    const postCount =
        typeof topic.post_count === 'number' ? topic.post_count : Number(topic.post_count ?? 0);

    return { id, name, slug, post_count: Number.isFinite(postCount) ? postCount : 0 };
}

/**
 * Chuẩn hoá payload GET /blogs/topics — chấp nhận mảng trần hoặc bọc trong
 * data/items/topics (giống normalizeTopics của web). Loại bỏ item không hợp lệ + trùng id.
 */
export function normalizeBlogTopics(raw: unknown): BlogTopic[] {
    const data = unwrap(raw);
    let items: unknown[] = [];

    if (Array.isArray(data)) {
        items = data;
    } else if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        const nested = [obj.items, obj.topics, obj.data].find((v) => Array.isArray(v));
        if (Array.isArray(nested)) items = nested;
    }

    const seen = new Set<string>();
    const result: BlogTopic[] = [];
    for (const row of items) {
        const topic = normalizeOne(row);
        if (!topic || seen.has(topic.id)) continue;
        seen.add(topic.id);
        result.push(topic);
    }
    return result;
}
