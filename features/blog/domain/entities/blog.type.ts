export interface BlogAuthor {
    id: string;
    name: string;
    avatar: string;
}

export interface BlogTab {
    id: string;
    label: string;
    value: string;
}

/**
 * Chủ đề blog lấy động từ GET /blogs/topics (giống web) — không hardcode.
 * `id` là topic_id backend gắn cho post; `name` là nhãn hiển thị tiếng Việt.
 */
export interface BlogTopic {
    id: string;
    name: string;
    slug: string;
    post_count?: number;
}

export interface BlogComment {
    id: string;
    author: BlogAuthor;
    text?: string;
    voiceUrl?: string;
    voiceDuration?: number; // in seconds
    timestamp: string;
    likes: number;
    isVoiceMessage?: boolean;
}

/**
 * Blog Post Media từ API
 */
export interface BlogPostMedia {
    id: string;
    post_id: string;
    url: string;
    media_type: string;
    embed_id: string;
    duration_seconds?: number;
}

/**
 * Creator/Author info từ API
 */
export interface PostCreator {
    creator_id?: string;
    creator_username?: string;
    creator_display_name?: string;
    creator_role?: 'artist' | 'producer' | 'venue' | 'user';
}

/**
 * Post từ API /posts endpoint - Cấu trúc chung cho tất cả loại posts
 */
export interface BlogPost extends PostCreator {
    id: string;
    post_type?: 'availability' | 'job' | 'event' | 'blog';
    status: 'draft' | 'published' | 'archived';
    visibility?: 'public' | 'private';
    title: string;
    brief_description?: string;
    description?: string;
    content?: string;
    type?: string; // artist, producer, venue type, etc.
    // Post metrics
    views_count?: number;
    view_count?: number;
    applications_count?: number;
    bookings_count?: number;
    // Job/Availability specific
    recruitment_type?: 'contract' | 'fulltime' | 'freelance';
    location_type?: 'onsite' | 'remote' | 'hybrid';
    budget_currency?: string;
    is_negotiable?: boolean;
    // Pool & notifications
    is_pool?: boolean;
    pool_type?: 'job' | 'availability';
    auto_notify?: boolean;
    // Submission tracking
    total_submissions?: number;
    can_accept_submissions?: boolean;
    is_deadline_passed?: boolean;
    // Timestamps
    created_at: string;
    updated_at: string;
    published_at?: string;
    // Legacy fields for backward compatibility
    slug?: string;
    tags?: string[];
    media?: BlogPostMedia[];
    read_time?: number;
    comment_count?: number;
    excerpt?: string;
    // UI-specific properties
    category?: string;
    readTime?: number;
    publishedAt?: string;
    thumbnail?: string;
    likes?: number;
    comments?: number;
    upvote_count?: number;
    downvote_count?: number;
    bookmark_count?: number;
    author_id?: string;
    topic_id?: string;
    short_description?: string;
    is_featured?: boolean;
}

/**
 * Posts API Response từ /posts endpoint
 */
export interface BlogPostsResponse {
    posts: BlogPost[];
    message?: string;
}

/**
 * Filter options cho useBlogPosts hook
 */
export interface BlogPostFilters {
    sort?: string;
    topic_id?: string;
    /** Filter list to posts by this author (GET /blogs) */
    author_id?: string;
    tag_ids?: string[];
    limit?: number;
    offset?: number;
}

/**
 * Blog Media từ API /blogs endpoint
 */
export interface BlogMedia {
    id: string;
    url: string;
    media_type: string;
    embed_id?: string;
}

/**
 * Blog Item từ API /blogs endpoint
 */
export interface BlogItem {
    id: string;
    author_id: string;
    topic_id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    short_description: string;
    content: string;
    read_time: number;
    view_count: number;
    upvote_count: number;
    downvote_count: number;
    comment_count: number;
    bookmark_count: number;
    published_at: string;
    created_at: string;
    updated_at: string;
    tags: string[];
    media: BlogMedia[];
}

/**
 * Pagination metadata từ API /blogs endpoint
 */
export interface BlogMeta {
    page: number;
    page_size: number;
    total: number;
}

/**
 * API Response từ /blogs endpoint
 */
export interface BlogsResponse {
    message: string;
    data: {
        items: BlogItem[];
        meta: BlogMeta;
    };
}

/** Same nested shape as `BlogsResponse.data` — used by GET /blogs/search (dto.PaginatedPostListResponse). */
export type PaginatedPostListResponse = BlogsResponse['data'];

/**
 * Envelope thường gặp từ API (dto.SuccessResponse)
 */
export interface BlogApiSuccessEnvelope<T> {
    message?: string;
    data: T;
}

/**
 * Body POST /blogs — dto.CreatePostRequest (cấu trúc phỏng theo swagger; có thể chỉnh nếu backend đổi tên field)
 */
export interface CreatePostRequest {
    title: string;
    content: string;
    short_description: string;
    topic_id: string;
    tags: string[];
}

/** PUT /blogs/:id — dto.UpdatePostRequest (same fields as create, per typical Go DTOs) */
export interface UpdatePostRequest {
    title: string;
    content: string;
    short_description: string;
    topic_id: string;
    tags: string[];
}

/**
 * POST /blogs/:id/media — dto.AddMediaRequest (Swagger: consumes application/json).
 * Upload binary via POST /storage/upload first, then send the resulting URL here.
 */
export interface AddMediaRequest {
    url: string;
    media_type: string;
    embed_id?: string;
}

/** GET /blogs/search query params */
export interface BlogSearchParams {
    q?: string;
    topic_id?: string;
    sort?: string;
    tag_ids?: string[];
}

/**
 * GET /blogs/search — dto.SuccessResponse with `data`: dto.PaginatedPostListResponse
 */
export interface BlogSearchResponse {
    message?: string;
    data: PaginatedPostListResponse;
}

/** GET /blogs/:id/comments — raw row (tolerant field names) */
export interface BlogApiComment {
    id: string;
    post_id?: string;
    content?: string;
    body?: string;
    text?: string;
    user_id?: string;
    author_id?: string;
    parent_id?: string | null;
    created_at: string;
    updated_at?: string;
    like_count?: number;
    upvote_count?: number;
    user?: {
        id?: string;
        display_name?: string;
        username?: string;
        avatar_url?: string;
        /** Some APIs use this instead of avatar_url */
        avatar?: string;
    };
    author?: { id?: string; name?: string; avatar?: string };
    avatar_url?: string;
    profile_image?: string;
    image_url?: string;
}

export interface BlogCommentsListResponse {
    message?: string;
    data: BlogApiComment[];
}

export interface CreateCommentRequest {
    content: string;
    parent_id?: string | null;
}

export interface UpdateCommentRequest {
    content: string;
}

/** POST/DELETE /blogs/:id/bookmark body — dto.BookmarkPostRequest */
export interface BookmarkPostRequest {
    list_id?: string;
}

/**
 * GET /bookmarks item — `blog.BookmarkedPost` (post may be nested or row may be a post).
 */
export interface ApiBookmarkedPost {
    id?: string;
    post_id?: string;
    list_id?: string;
    post?: BlogItem;
    created_at?: string;
}

export interface BookmarksListResponse {
    message?: string;
    data: ApiBookmarkedPost[] | BlogItem[];
}
