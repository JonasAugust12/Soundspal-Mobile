import type {
    BlogPost,
    BlogPostMedia,
    BlogItem,
    ApiBookmarkedPost,
} from '@/features/blog/domain/entities/blog.type';

/**
 * Ngày đăng bài dạng tuyệt đối "dd/MM/yyyy" (vi-VN). Thay cho việc hiển thị id/topic_id
 * thô trên thẻ — người dùng cần biết bài đăng ngày nào.
 */
function formatPublishedLabel(publishedAt?: string, createdAt?: string): string {
    const source = publishedAt || createdAt;
    if (!source) return 'Chưa xuất bản';
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return 'Chưa xuất bản';
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

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
        category: 'BÀI VIẾT',
        thumbnail,
        readTime: item.read_time,
        publishedAt: formatPublishedLabel(item.published_at, item.created_at),
        likes: item.upvote_count,
        comments: item.comment_count,
        creator_username: item.author_id,
        creator_display_name: 'Tác giả',
        creator_role: 'user',
    };
}

export function mapBookmarkRowToBlogPost(row: ApiBookmarkedPost | BlogItem): BlogPost | null {
    if (
        row &&
        typeof row === 'object' &&
        'post' in row &&
        row.post &&
        typeof row.post === 'object'
    ) {
        return mapBlogItemToBlogPost(row.post as BlogItem);
    }
    // Bài viết trả thẳng trong danh sách bookmark (giống web dùng normalizePost cho từng
    // hàng): chỉ cần có `id` — các field khác đã có default trong mapBlogItemToBlogPost.
    if (row && typeof row === 'object' && 'id' in row) {
        return mapBlogItemToBlogPost(row as BlogItem);
    }
    return null;
}
