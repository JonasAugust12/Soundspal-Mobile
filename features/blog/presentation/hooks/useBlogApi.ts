import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { blogRepository } from '@/features/blog/data/repositories/BlogRepositoryImpl';
import { AddBlogPostMediaUseCase } from '@/features/blog/domain/usecases/AddBlogPostMediaUseCase';
import type {
    BlogPostFilters,
    BlogSearchParams,
    UpdatePostRequest,
    CreateCommentRequest,
    UpdateCommentRequest,
    BookmarkPostRequest,
    BlogItem,
} from '@/features/blog/domain/entities/blog.type';

const addBlogPostMediaUseCase = new AddBlogPostMediaUseCase(blogRepository);

// Re-exports for components that call imperative APIs
export { logBlogUploadFailure } from '@/features/blog/data/utils/blogUploadUtils';
export { mapBlogItemToBlogPost } from '@/features/blog/data/mappers/blogPostMapper';
export { mapApiCommentToBlogComment } from '@/features/blog/data/mappers/blogCommentMapper';
export type { LocalImageAsset } from '@/features/blog/data/utils/blogMediaUtils';

export const createBlogPost = blogRepository.createPost.bind(blogRepository);
export const updateBlogPost = blogRepository.updatePost.bind(blogRepository);
export const publishBlogPost = blogRepository.publishPost.bind(blogRepository);
export const addBlogPostMedia = (
    postId: string,
    asset: Parameters<typeof addBlogPostMediaUseCase.execute>[1],
) => addBlogPostMediaUseCase.execute(postId, asset);
export const searchBlogsFromApi = blogRepository.searchPosts.bind(blogRepository);
export const fetchBookmarksFromApi = blogRepository.fetchBookmarks.bind(blogRepository);
export const bookmarkPostApi = blogRepository.bookmarkPost.bind(blogRepository);
export const unbookmarkPostApi = blogRepository.unbookmarkPost.bind(blogRepository);
export const createCommentApi = blogRepository.createComment.bind(blogRepository);
export const updateCommentApi = blogRepository.updateComment.bind(blogRepository);
export const deleteCommentApi = blogRepository.deleteComment.bind(blogRepository);

/** Danh mục chủ đề blog lấy động từ GET /blogs/topics (không hardcode). */
export function useBlogTopics(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['blogTopics'],
        queryFn: () => blogRepository.fetchTopics(),
        enabled: options?.enabled !== false,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
    });
}

export const BLOG_FEED_QUERY_KEY = ['blogPosts', 'feed'] as const;

export function useBlogFeed(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: BLOG_FEED_QUERY_KEY,
        queryFn: () => blogRepository.fetchBlogPosts(undefined),
        enabled: options?.enabled !== false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

export function useBlogPosts(filters?: BlogPostFilters, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['blogPosts', filters],
        queryFn: () => blogRepository.fetchBlogPosts(filters),
        enabled: options?.enabled !== false,
        staleTime: 0,
        gcTime: 1000 * 60 * 10,
    });
}

export function useBlogSearch(params: BlogSearchParams, options?: { enabled?: boolean }) {
    const q = params.q?.trim() ?? '';
    return useQuery({
        queryKey: ['blogSearch', params.q, params.topic_id, params.sort, params.tag_ids],
        queryFn: () => blogRepository.searchPosts(params),
        enabled: options?.enabled !== false && q.length > 0,
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData,
    });
}

export const BOOKMARKS_QUERY_KEY = ['bookmarks', 'list'] as const;

export function useBookmarksList(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: BOOKMARKS_QUERY_KEY,
        queryFn: () => blogRepository.fetchBookmarks(),
        enabled: options?.enabled !== false,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 15,
    });
}

export function useBookmarkPostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, body }: { postId: string; body?: BookmarkPostRequest }) =>
            blogRepository.bookmarkPost(postId, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}

export function useUnbookmarkPostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, body }: { postId: string; body?: BookmarkPostRequest }) =>
            blogRepository.unbookmarkPost(postId, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}

export function useBlogComments(postId: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['blogComments', postId],
        queryFn: () => blogRepository.fetchComments(postId as string),
        enabled: options?.enabled !== false && !!postId,
        staleTime: 0,
    });
}

export function useUpdateBlogPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdatePostRequest }): Promise<BlogItem> =>
            blogRepository.updatePost(id, body),
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
            return blogRepository.createComment(postId, request);
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
        }) => blogRepository.updateComment(commentId, request),
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
        mutationFn: (commentId: string) => blogRepository.deleteComment(commentId),
        onSuccess: () => {
            if (!postId) return;
            queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
            queryClient.invalidateQueries({ queryKey: ['blogArticle', postId] });
        },
    });
}

export function useBlogArticle(articleId?: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['blogArticle', articleId],
        queryFn: async () => {
            if (!articleId) throw new Error('Article ID is required');

            const posts = await queryClient.fetchQuery({
                queryKey: BLOG_FEED_QUERY_KEY,
                queryFn: () => blogRepository.fetchBlogPosts(undefined),
            });

            const article = posts.find((p) => p.id === articleId);
            if (!article) throw new Error('Blog not found');
            return article;
        },
        enabled: !!articleId,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
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

/** @deprecated Replace with POST /api/blog/comments/:commentId/like when available. */
export function useAddCommentLike() {
    return {
        mutate: async (commentId: string) => {
            console.warn('Adding like to comment:', commentId);
        },
    };
}
