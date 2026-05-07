import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BLOG_FEED_TABS } from '@/constants/blog';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type {
    BlogPost,
    BlogPostFilters,
    BlogsResponse,
    BlogItem,
    BlogPostMedia,
    CreatePostRequest,
    UpdatePostRequest,
    AddMediaRequest,
    BlogApiSuccessEnvelope,
    BlogSearchParams,
    BlogApiComment,
    CreateCommentRequest,
    UpdateCommentRequest,
    BlogComment,
    BookmarkPostRequest,
    ApiBookmarkedPost,
} from '@/types/blog.type';

const BLOG_UPLOAD_LOG_PREFIX = '[BlogMediaUpload]';

/** Safe to paste into bug reports (filter Metro logs by `[BlogMediaUpload]`). */
function serializeUploadError(err: unknown): Record<string, unknown> {
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

function previewUri(uri: string): string {
    if (uri.length <= 96) return uri;
    return `${uri.slice(0, 96)}…`;
}

/**
 * Call from UI catch blocks so logs include screen context. Same detail as inside `addBlogPostMedia`.
 */
export function logBlogUploadFailure(context: string, error: unknown): void {
    console.warn(
        `${BLOG_UPLOAD_LOG_PREFIX}[FAIL:${context}]`,
        JSON.stringify(serializeUploadError(error), null, 2),
    );
}

function formatPublishedLabel(publishedAt?: string): string {
    if (!publishedAt) return 'Recently';
    const date = new Date(publishedAt);
    if (Number.isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Maps API blog row to the BlogPost shape used across list + detail UI.
 */
export function mapBlogItemToBlogPost(item: BlogItem): BlogPost {
    const thumbnail = item.media?.[0]?.url ?? '';
    const media: BlogPostMedia[] = (item.media ?? []).map((m) => ({
        id: m.id,
        post_id: item.id,
        url: m.url,
        media_type: m.media_type,
        embed_id: m.embed_id ?? '',
    }));
    return {
        ...item,
        media,
        excerpt: item.short_description,
        category: item.topic_id?.toUpperCase() || 'BLOG',
        thumbnail,
        readTime: item.read_time,
        publishedAt: formatPublishedLabel(item.published_at),
        likes: item.upvote_count,
        comments: item.comment_count,
        creator_username: item.author_id,
        creator_display_name: 'Author',
        creator_role: 'user',
    };
}

async function fetchBlogPostsFromApi(filters?: BlogPostFilters): Promise<BlogPost[]> {
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

    const payload = response.data;
    if (!payload?.data?.items || !Array.isArray(payload.data.items)) {
        throw new Error('Invalid blogs response');
    }

    return payload.data.items.map(mapBlogItemToBlogPost);
}

function unwrapBlogData<T>(body: unknown, label: string): T {
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

/**
 * POST /api/v1/blogs — tạo bài (thường ở trạng thái draft)
 */
export async function createBlogPost(request: CreatePostRequest): Promise<BlogItem> {
    const { data: body } = await apiClient.post<BlogApiSuccessEnvelope<BlogItem>>(
        '/blogs',
        request,
    );
    return unwrapBlogData<BlogItem>(body, 'createBlogPost');
}

/**
 * PUT /api/v1/blogs/{id}
 */
export async function updateBlogPost(id: string, request: UpdatePostRequest): Promise<BlogItem> {
    const { data: body } = await apiClient.put<BlogApiSuccessEnvelope<BlogItem>>(
        `/blogs/${id}`,
        request,
    );
    return unwrapBlogData<BlogItem>(body, 'updateBlogPost');
}

/**
 * PATCH /api/v1/blogs/{id}/publish
 */
export async function publishBlogPost(postId: string): Promise<BlogItem> {
    const { data: body } = await apiClient.patch<BlogApiSuccessEnvelope<BlogItem>>(
        `/blogs/${postId}/publish`,
    );
    return unwrapBlogData<BlogItem>(body, 'publishBlogPost');
}

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

/** Stable filename + mime for RN multipart (Android content:// URIs often lack a usable basename). */
function resolveBlogMediaFileMeta(asset: LocalImageAsset): { name: string; mime: string } {
    const mime = asset.mimeType?.trim() || 'image/jpeg';
    const raw = asset.name?.trim();
    const hasExtension = raw ? /\.[a-z0-9]{2,8}$/i.test(raw) : false;
    const name = raw && hasExtension ? raw : `cover_${Date.now()}.${extensionForImageMime(mime)}`;
    return { name, mime };
}

function apiMediaKindFromMime(mime: string): string {
    const m = mime.toLowerCase();
    if (m.startsWith('video/')) return 'video';
    if (m.startsWith('audio/')) return 'audio';
    return 'image';
}

/** Parse POST /storage/upload body (flat or dto.SuccessResponse wrapper). */
function extractStorageUploadUrl(payload: unknown): string {
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

/**
 * RN Android often surfaces multipart uploads as Axios ERR_NETWORK (XHR adapter).
 * Native `fetch` uses a different stack and usually completes TLS + multipart reliably.
 */
async function postStorageUploadWithFetch(form: FormData): Promise<unknown> {
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

/**
 * 1) POST /storage/upload — multipart file
 * 2) POST /blogs/{id}/media — JSON dto.AddMediaRequest (Swagger consumes application/json)
 */
export async function addBlogPostMedia(postId: string, asset: LocalImageAsset): Promise<BlogItem> {
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
}

/**
 * Fetches all blog tabs
 */
export function useBlogTabs() {
    return useQuery({
        queryKey: ['blogTabs'],
        queryFn: async () => {
            return BLOG_FEED_TABS;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Query key for the main blog list: one unfiltered fetch; filter by tab on the client.
 */
export const BLOG_FEED_QUERY_KEY = ['blogPosts', 'feed'] as const;

/**
 * Main feed: GET /blogs (no topic/author) — use for the blog screen list + detail cache.
 */
export function useBlogFeed(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: BLOG_FEED_QUERY_KEY,
        queryFn: () => fetchBlogPostsFromApi(undefined),
        enabled: options?.enabled !== false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

/**
 * Fetch blogs from GET /api/v1/blogs (optional server filters; separate cache per filters).
 */
export function useBlogPosts(filters?: BlogPostFilters, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['blogPosts', filters],
        queryFn: () => fetchBlogPostsFromApi(filters),
        enabled: options?.enabled !== false,
        staleTime: 0,
        gcTime: 1000 * 60 * 10,
    });
}

/**
 * GET /api/v1/blogs/search — query + paginated `data.items` (dto.PaginatedPostListResponse)
 */
export async function searchBlogsFromApi(params: BlogSearchParams): Promise<BlogPost[]> {
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
}

export function useBlogSearch(params: BlogSearchParams, options?: { enabled?: boolean }) {
    const q = params.q?.trim() ?? '';
    return useQuery({
        queryKey: ['blogSearch', params.q, params.topic_id, params.sort, params.tag_ids],
        queryFn: () => searchBlogsFromApi(params),
        enabled: options?.enabled !== false && q.length > 0,
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
        /** Avoid empty flash while a new search query is loading */
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Map GET /bookmarks rows to `BlogPost` (supports `{ post: BlogItem }` or flat `BlogItem`).
 */
function mapBookmarkRowToBlogPost(row: ApiBookmarkedPost | BlogItem): BlogPost | null {
    if (
        row &&
        typeof row === 'object' &&
        'post' in row &&
        row.post &&
        typeof row.post === 'object'
    ) {
        return mapBlogItemToBlogPost(row.post as BlogItem);
    }
    if (row && typeof row === 'object' && 'id' in row && 'title' in row) {
        return mapBlogItemToBlogPost(row as BlogItem);
    }
    return null;
}

export async function fetchBookmarksFromApi(listId?: string): Promise<BlogPost[]> {
    const { data: body } = await apiClient.get<{ data?: unknown }>('/bookmarks', {
        params: listId ? { list_id: listId } : undefined,
    });
    const raw = unwrapBlogData<unknown[]>(body, 'bookmarks');
    if (!Array.isArray(raw)) return [];
    const out: BlogPost[] = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const mapped = mapBookmarkRowToBlogPost(item as ApiBookmarkedPost);
        if (mapped) out.push(mapped);
    }
    return out;
}

const EMPTY_BOOKMARK_BODY: BookmarkPostRequest = {};

/**
 * POST /blogs/:id/bookmark
 */
export async function bookmarkPostApi(
    postId: string,
    request: BookmarkPostRequest = EMPTY_BOOKMARK_BODY,
): Promise<void> {
    await apiClient.post(`/blogs/${postId}/bookmark`, request);
}

/**
 * DELETE /blogs/:id/bookmark
 */
export async function unbookmarkPostApi(
    postId: string,
    request: BookmarkPostRequest = EMPTY_BOOKMARK_BODY,
): Promise<void> {
    await apiClient.delete(`/blogs/${postId}/bookmark`, { data: request });
}

export const BOOKMARKS_QUERY_KEY = ['bookmarks', 'list'] as const;

export function useBookmarksList(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: BOOKMARKS_QUERY_KEY,
        queryFn: () => fetchBookmarksFromApi(),
        enabled: options?.enabled !== false,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 15,
    });
}

export function useBookmarkPostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, body }: { postId: string; body?: BookmarkPostRequest }) =>
            bookmarkPostApi(postId, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}

export function useUnbookmarkPostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, body }: { postId: string; body?: BookmarkPostRequest }) =>
            unbookmarkPostApi(postId, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}

function formatCommentTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
}

function dicebearCommentPng(seed: string): string {
    return `https://api.dicebear.com/7.x/avataaars/png?size=128&seed=${encodeURIComponent(seed || 'user')}`;
}

export function mapApiCommentToBlogComment(row: BlogApiComment): BlogComment {
    const text = (row.content ?? row.body ?? row.text ?? '').trim();
    const authorId = String(row.user?.id ?? row.user_id ?? row.author_id ?? row.author?.id ?? '');
    const name = String(row.user?.display_name ?? row.user?.username ?? row.author?.name ?? 'User');
    const u = row.user;
    const rawAvatar = String(
        u?.avatar_url ??
            u?.avatar ??
            row.author?.avatar ??
            row.avatar_url ??
            row.profile_image ??
            row.image_url ??
            '',
    ).trim();
    const avatar = rawAvatar || dicebearCommentPng(authorId || name);
    return {
        id: String(row.id),
        author: {
            id: authorId || 'unknown',
            name,
            avatar,
        },
        text: text || undefined,
        isVoiceMessage: false,
        timestamp: formatCommentTime(row.created_at),
        likes: row.like_count ?? row.upvote_count ?? 0,
    };
}

async function fetchCommentsFromApi(postId: string): Promise<BlogComment[]> {
    const { data: body } = await apiClient.get<BlogApiSuccessEnvelope<BlogApiComment[]>>(
        `/blogs/${postId}/comments`,
    );
    const data = unwrapBlogData<BlogApiComment[]>(body, 'fetchComments');
    if (!Array.isArray(data)) return [];
    return data.map(mapApiCommentToBlogComment);
}

export function useBlogComments(postId: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['blogComments', postId],
        queryFn: () => fetchCommentsFromApi(postId as string),
        enabled: options?.enabled !== false && !!postId,
        staleTime: 0,
    });
}

export async function createCommentApi(
    postId: string,
    request: CreateCommentRequest,
): Promise<BlogApiComment> {
    const { data: body } = await apiClient.post<BlogApiSuccessEnvelope<BlogApiComment>>(
        `/blogs/${postId}/comments`,
        request,
    );
    return unwrapBlogData<BlogApiComment>(body, 'createComment');
}

export async function updateCommentApi(
    commentId: string,
    request: UpdateCommentRequest,
): Promise<BlogApiComment> {
    const { data: body } = await apiClient.put<BlogApiSuccessEnvelope<BlogApiComment>>(
        `/comments/${commentId}`,
        request,
    );
    return unwrapBlogData<BlogApiComment>(body, 'updateComment');
}

export async function deleteCommentApi(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
}

export function useUpdateBlogPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdatePostRequest }): Promise<BlogItem> =>
            updateBlogPost(id, body),
        onSuccess: (data: BlogItem) => {
            if (data.id) {
                void queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
                void queryClient.invalidateQueries({ queryKey: ['blogArticle', data.id] });
            }
        },
    });
}

export function useCreateComment(postId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateCommentRequest) => {
            if (!postId) throw new Error('Missing post id');
            return createCommentApi(postId, request);
        },
        onSuccess: () => {
            if (!postId) return;
            queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
            queryClient.invalidateQueries({ queryKey: ['blogArticle', postId] });
        },
    });
}

export function useUpdateComment(postId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            commentId,
            request,
        }: {
            commentId: string;
            request: UpdateCommentRequest;
        }) => updateCommentApi(commentId, request),
        onSuccess: () => {
            if (!postId) return;
            queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
            queryClient.invalidateQueries({ queryKey: ['blogArticle', postId] });
        },
    });
}

export function useDeleteComment(postId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) => deleteCommentApi(commentId),
        onSuccess: () => {
            if (!postId) return;
            queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
            queryClient.invalidateQueries({ queryKey: ['blogArticle', postId] });
        },
    });
}

/**
 * Single article: backend has no GET /blogs/:id — reuse list cache or fetch /blogs and pick by id.
 */
export function useBlogArticle(articleId?: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['blogArticle', articleId],
        queryFn: async () => {
            if (!articleId) throw new Error('Article ID is required');

            const posts = await queryClient.fetchQuery({
                queryKey: BLOG_FEED_QUERY_KEY,
                queryFn: () => fetchBlogPostsFromApi(undefined),
            });

            const article = posts.find((p) => p.id === articleId);
            if (!article) throw new Error('Blog not found');
            return article;
        },
        enabled: !!articleId,
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

/** @deprecated Use `useCreateComment(postId)` and the comments API. */
export function useAddBlogComment() {
    return {
        mutate: async (_articleId: string, _comment: { text?: string; voiceUrl?: string }) => {
            return { id: 'deprecated', timestamp: 'NOW', likes: 0 };
        },
    };
}

/**
 * Adds a reaction (like) to a comment
 * TODO: Replace with API call to POST /api/blog/comments/:commentId/like
 */
export function useAddCommentLike() {
    return {
        mutate: async (commentId: string) => {
            // TODO: Replace with actual API call
            // const response = await apiClient.post(`/blog/comments/${commentId}/like`);
            // return response.data;
            console.warn('Adding like to comment:', commentId);
        },
    };
}
