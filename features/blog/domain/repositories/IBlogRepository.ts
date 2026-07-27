import type {
    BlogPost,
    BlogPostFilters,
    BlogTopic,
    BlogItem,
    LocalImageAsset,
    BlogSearchParams,
    BlogComment,
    BlogApiComment,
    CreatePostRequest,
    UpdatePostRequest,
    CreateCommentRequest,
    UpdateCommentRequest,
    BookmarkPostRequest,
} from '@/features/blog/domain/entities/blog.type';

export interface IBlogRepository {
    fetchBlogPosts(filters?: BlogPostFilters): Promise<BlogPost[]>;
    fetchTopics(): Promise<BlogTopic[]>;
    createPost(request: CreatePostRequest): Promise<BlogItem>;
    updatePost(id: string, request: UpdatePostRequest): Promise<BlogItem>;
    publishPost(postId: string): Promise<BlogItem>;
    addPostMedia(postId: string, asset: LocalImageAsset): Promise<BlogItem>;
    searchPosts(params: BlogSearchParams): Promise<BlogPost[]>;
    fetchBookmarks(listId?: string): Promise<BlogPost[]>;
    bookmarkPost(postId: string, request?: BookmarkPostRequest): Promise<void>;
    unbookmarkPost(postId: string, request?: BookmarkPostRequest): Promise<void>;
    fetchComments(postId: string): Promise<BlogComment[]>;
    createComment(postId: string, request: CreateCommentRequest): Promise<BlogApiComment>;
    updateComment(commentId: string, request: UpdateCommentRequest): Promise<BlogApiComment>;
    deleteComment(commentId: string): Promise<void>;
}
