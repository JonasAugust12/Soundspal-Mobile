import { apiClient } from '@/shared/infrastructure/api/apiClient';
import type {
    BlogPost,
    BlogPostFilters,
    BlogsResponse,
    BlogItem,
    CreatePostRequest,
    UpdatePostRequest,
    AddMediaRequest,
    BlogApiSuccessEnvelope,
    BlogSearchParams,
    BlogApiComment,
    CreateCommentRequest,
    UpdateCommentRequest,
    BookmarkPostRequest,
    ApiBookmarkedPost,
    BlogComment,
} from '@/features/blog/domain/entities/blog.type';
import {
    mapBlogItemToBlogPost,
    mapBookmarkRowToBlogPost,
} from '@/features/blog/data/mappers/blogPostMapper';
import { normalizeBlogTopics } from '@/features/blog/data/mappers/blogTopicMapper';
import { mapApiCommentToBlogComment } from '@/features/blog/data/mappers/blogCommentMapper';
import { unwrapBlogData } from '@/features/blog/data/utils/blogResponseUtils';
import {
    BLOG_UPLOAD_LOG_PREFIX,
    previewUri,
    serializeUploadError,
} from '@/features/blog/data/utils/blogUploadUtils';
import {
    type LocalImageAsset,
    resolveBlogMediaFileMeta,
    apiMediaKindFromMime,
    extractStorageUploadUrl,
    postStorageUploadWithFetch,
} from '@/features/blog/data/utils/blogMediaUtils';

const EMPTY_BOOKMARK_BODY: BookmarkPostRequest = {};

// Tolerant array unwrap for list endpoints (bookmarks, comments...): accepts a bare array,
// {data:[...]}, {data:{items|data|posts|bookmarks|comments|records:[...]}}, etc. Trước đây
// chỉ bóc 1 lớp `data` nên envelope lồng trả [] (không thấy bookmark / bình luận).
function extractArrayFromEnvelope(body: unknown): unknown[] {
    let current: unknown = body;
    for (let depth = 0; depth < 3; depth += 1) {
        if (Array.isArray(current)) return current;
        if (!current || typeof current !== 'object') break;

        const obj = current as Record<string, unknown>;
        const nested = [
            obj.items,
            obj.data,
            obj.posts,
            obj.bookmarks,
            obj.comments,
            obj.records,
        ].find(Array.isArray);
        if (Array.isArray(nested)) return nested;

        if ('data' in obj) {
            current = obj.data;
            continue;
        }
        break;
    }
    return [];
}

// Bóc user ra khỏi body của GET /users/{id} (dạng {data:{...}} hoặc user trần).
function extractUserBasic(
    body: unknown,
): { display_name?: string; username?: string; avatar_url?: string } | null {
    if (!body || typeof body !== 'object') return null;
    const outer = body as Record<string, unknown>;
    const u = (outer.data && typeof outer.data === 'object' ? outer.data : outer) as Record<
        string,
        unknown
    >;
    return {
        display_name: typeof u.display_name === 'string' ? u.display_name : undefined,
        username: typeof u.username === 'string' ? u.username : undefined,
        avatar_url: typeof u.avatar_url === 'string' ? u.avatar_url : undefined,
    };
}

// Nhiều comment từ API chỉ có author_id, thiếu tên/avatar → tự gọi GET /users/{id} bù vào
// (giống web). Gọi 1 lần cho mỗi user, lỗi thì bỏ qua để vẫn hiển thị được bình luận.
async function enrichCommentAuthors(rows: BlogApiComment[]): Promise<void> {
    const ids = [
        ...new Set(
            rows
                .filter((r) => !r.author_username && !r.author_avatar_url)
                .map((r) => String(r.author_id ?? r.user_id ?? ''))
                .filter(Boolean),
        ),
    ];
    if (!ids.length) return;

    const entries = await Promise.all(
        ids.map((id) =>
            apiClient
                .get(`/users/${id}`)
                .then((res) => [id, extractUserBasic(res.data)] as const)
                .catch(() => [id, null] as const),
        ),
    );
    const byId = new Map(entries.filter(([, u]) => u).map(([id, u]) => [id, u!]));

    for (const r of rows) {
        const user = byId.get(String(r.author_id ?? r.user_id ?? ''));
        if (!user) continue;
        if (!r.author_username) r.author_username = user.display_name || user.username;
        if (!r.author_avatar_url) r.author_avatar_url = user.avatar_url;
    }
}

export const blogRemoteDataSource = {
    async fetchBlogPosts(filters?: BlogPostFilters): Promise<BlogPost[]> {
        const response = await apiClient.get<BlogsResponse>('/blogs', {
            params: {
                ...(filters?.topic_id ? { topic_id: filters.topic_id } : {}),
                ...(filters?.author_id ? { author_id: filters.author_id } : {}),
                ...(filters?.limit != null ? { page_size: filters.limit } : {}),
                ...(filters?.offset != null && filters?.limit
                    ? { page: Math.floor(filters.offset / filters.limit) + 1 }
                    : {}),
            },
        });
        const items = response.data?.data?.items;
        return Array.isArray(items) ? items.map(mapBlogItemToBlogPost) : [];
    },

    /**
     * GET /blogs/:id — bài viết đơn lẻ.
     *
     * Khác `fetchBlogPosts`: backend chạy `GetByIDWithViewer` nên payload có thêm khối
     * `viewer` (đã vote / đã bookmark). Nhánh list không hydrate phần đó.
     */
    async fetchPostById(id: string): Promise<BlogPost> {
        const { data: body } = await apiClient.get<BlogApiSuccessEnvelope<BlogItem>>(
            `/blogs/${id}`,
        );
        return mapBlogItemToBlogPost(unwrapBlogData<BlogItem>(body, 'fetchBlogPostById'));
    },

    /** GET /blogs/topics — danh mục chủ đề động (thay cho danh sách hardcode). */
    async fetchTopics() {
        const { data: body } = await apiClient.get('/blogs/topics');
        return normalizeBlogTopics(body);
    },

    async createPost(request: CreatePostRequest): Promise<BlogItem> {
        const { data: body } = await apiClient.post<BlogApiSuccessEnvelope<BlogItem>>(
            '/blogs',
            request,
        );
        return unwrapBlogData<BlogItem>(body, 'createBlogPost');
    },

    async updatePost(id: string, request: UpdatePostRequest): Promise<BlogItem> {
        const { data: body } = await apiClient.put<BlogApiSuccessEnvelope<BlogItem>>(
            `/blogs/${id}`,
            request,
        );
        return unwrapBlogData<BlogItem>(body, 'updateBlogPost');
    },

    async publishPost(postId: string): Promise<BlogItem> {
        const { data: body } = await apiClient.patch<BlogApiSuccessEnvelope<BlogItem>>(
            `/blogs/${postId}/publish`,
        );
        return unwrapBlogData<BlogItem>(body, 'publishBlogPost');
    },

    async addPostMedia(postId: string, asset: LocalImageAsset): Promise<BlogItem> {
        const { name, mime } = resolveBlogMediaFileMeta(asset);

        console.warn(
            `${BLOG_UPLOAD_LOG_PREFIX}[start]`,
            JSON.stringify(
                {
                    postId,
                    fileName: name,
                    mime,
                    uriPreview: previewUri(asset.uri),
                },
                null,
                2,
            ),
        );

        const form = new FormData();
        form.append('file', { uri: asset.uri, name, type: mime } as never);

        try {
            console.warn(`${BLOG_UPLOAD_LOG_PREFIX}[step:storage] POST /storage/upload (fetch) …`);
            const uploadPayload = await postStorageUploadWithFetch(form);

            const payloadStr = JSON.stringify(uploadPayload);
            console.warn(
                `${BLOG_UPLOAD_LOG_PREFIX}[step:storage:response]`,
                payloadStr.length > 1200 ? `${payloadStr.slice(0, 1200)}… (truncated)` : payloadStr,
            );

            let publicUrl: string;
            try {
                publicUrl = extractStorageUploadUrl(uploadPayload);
            } catch (parseErr) {
                console.warn(
                    `${BLOG_UPLOAD_LOG_PREFIX}[step:storage:parse_url_failed]`,
                    JSON.stringify(serializeUploadError(parseErr), null, 2),
                );
                throw parseErr;
            }

            console.warn(
                `${BLOG_UPLOAD_LOG_PREFIX}[step:storage:publicUrl]`,
                publicUrl.length > 200 ? `${publicUrl.slice(0, 200)}…` : publicUrl,
            );

            const requestBody: AddMediaRequest = {
                url: publicUrl,
                media_type: apiMediaKindFromMime(mime),
            };

            const attachPath = `/blogs/${postId}/media`;
            console.warn(
                `${BLOG_UPLOAD_LOG_PREFIX}[step:attach]`,
                JSON.stringify({ path: attachPath, body: requestBody }, null, 2),
            );

            const { data: body } = await apiClient.post<BlogApiSuccessEnvelope<BlogItem>>(
                attachPath,
                requestBody,
                { timeout: 60_000 },
            );

            console.warn(`${BLOG_UPLOAD_LOG_PREFIX}[done] attach OK for postId=${postId}`);
            return unwrapBlogData<BlogItem>(body, 'addBlogPostMedia');
        } catch (error) {
            console.warn(
                `${BLOG_UPLOAD_LOG_PREFIX}[ERROR]`,
                JSON.stringify(serializeUploadError(error), null, 2),
            );
            throw error;
        }
    },

    async searchPosts(params: BlogSearchParams): Promise<BlogPost[]> {
        const parts: string[] = [];
        if (params.q?.trim()) parts.push(`q=${encodeURIComponent(params.q.trim())}`);
        if (params.topic_id) parts.push(`topic_id=${encodeURIComponent(params.topic_id)}`);
        if (params.sort) parts.push(`sort=${encodeURIComponent(params.sort)}`);
        params.tag_ids?.forEach((t) => parts.push(`tag_ids[]=${encodeURIComponent(t)}`));
        const qs = parts.length ? `?${parts.join('&')}` : '';

        const { data: body } = await apiClient.get<BlogApiSuccessEnvelope<BlogsResponse['data']>>(
            `/blogs/search${qs}`,
        );

        const payload = body as BlogApiSuccessEnvelope<BlogsResponse['data']> | undefined;
        const items = payload?.data?.items;
        if (!Array.isArray(items)) {
            throw new Error('Invalid blog search response');
        }

        return items.map(mapBlogItemToBlogPost);
    },

    async fetchBookmarks(listId?: string): Promise<BlogPost[]> {
        const { data: body } = await apiClient.get<{ data?: unknown }>('/bookmarks', {
            params: listId ? { list_id: listId } : undefined,
        });
        // Bóc envelope linh hoạt: mảng trần, {data:[...]}, {data:{items|data|posts:[...]}}, ...
        const raw = extractArrayFromEnvelope(body);
        const out: BlogPost[] = [];
        for (const item of raw) {
            if (!item || typeof item !== 'object') continue;
            const mapped = mapBookmarkRowToBlogPost(item as ApiBookmarkedPost);
            if (mapped) out.push(mapped);
        }
        return out;
    },

    async bookmarkPost(
        postId: string,
        request: BookmarkPostRequest = EMPTY_BOOKMARK_BODY,
    ): Promise<void> {
        await apiClient.post(`/blogs/${postId}/bookmark`, request);
    },

    async unbookmarkPost(
        postId: string,
        request: BookmarkPostRequest = EMPTY_BOOKMARK_BODY,
    ): Promise<void> {
        await apiClient.delete(`/blogs/${postId}/bookmark`, { data: request });
    },

    async fetchComments(postId: string): Promise<BlogComment[]> {
        const { data: body } = await apiClient.get(`/blogs/${postId}/comments`);
        // Bóc envelope linh hoạt: mảng trần, {data:[...]}, {data:{items|comments|data:[...]}}…
        const rows = extractArrayFromEnvelope(body).filter(
            (r): r is BlogApiComment => !!r && typeof r === 'object',
        );
        await enrichCommentAuthors(rows);
        return rows.map(mapApiCommentToBlogComment);
    },

    async createComment(postId: string, request: CreateCommentRequest): Promise<BlogApiComment> {
        const { data: body } = await apiClient.post<BlogApiSuccessEnvelope<BlogApiComment>>(
            `/blogs/${postId}/comments`,
            request,
        );
        return unwrapBlogData<BlogApiComment>(body, 'createComment');
    },

    async updateComment(commentId: string, request: UpdateCommentRequest): Promise<BlogApiComment> {
        const { data: body } = await apiClient.put<BlogApiSuccessEnvelope<BlogApiComment>>(
            `/comments/${commentId}`,
            request,
        );
        return unwrapBlogData<BlogApiComment>(body, 'updateComment');
    },

    async deleteComment(commentId: string): Promise<void> {
        await apiClient.delete(`/comments/${commentId}`);
    },
};
