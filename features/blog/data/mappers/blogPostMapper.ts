import type {
    BlogPost,
    BlogPostMedia,
    BlogItem,
    ApiBookmarkedPost,
} from '@/features/blog/domain/entities/blog.type';

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
    if (row && typeof row === 'object' && 'id' in row && 'title' in row) {
        return mapBlogItemToBlogPost(row as BlogItem);
    }
    return null;
}
