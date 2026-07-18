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
import { mapApiCommentToBlogComment } from '@/features/blog/data/mappers/blogCommentMapper';
import { MOCK_BLOG_ARTICLES } from '@/features/blog/domain/constants/mockBlogArticles';
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

export const blogRemoteDataSource = {
    async fetchBlogPosts(filters?: BlogPostFilters): Promise<BlogPost[]> {
        // Trong lúc backend blog chưa đủ nội dung: LUÔN thêm các bài mẫu vào cuối danh
        // sách thật (dedup theo id) để màn Blog đầy đặn, ảnh đẹp, chi tiết đầy đủ.
        // Bài thật vẫn đứng trước và không bị ẩn. Bỏ khối này khi blog thật đã ổn định.
        let realPosts: BlogPost[] = [];
        try {
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
            if (Array.isArray(items)) {
                realPosts = items.map(mapBlogItemToBlogPost);
            }
        } catch {
            // Bỏ qua — vẫn trả bài mẫu bên dưới.
        }

        const seen = new Set(realPosts.map((p) => p.id));
        const extras = MOCK_BLOG_ARTICLES.filter((p) => !seen.has(p.id));
        return [...realPosts, ...extras];
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
        const raw = unwrapBlogData<unknown[]>(body, 'bookmarks');
        if (!Array.isArray(raw)) return [];
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
        const { data: body } = await apiClient.get<BlogApiSuccessEnvelope<BlogApiComment[]>>(
            `/blogs/${postId}/comments`,
        );
        const data = unwrapBlogData<BlogApiComment[]>(body, 'fetchComments');
        if (!Array.isArray(data)) return [];
        return data.map(mapApiCommentToBlogComment);
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
