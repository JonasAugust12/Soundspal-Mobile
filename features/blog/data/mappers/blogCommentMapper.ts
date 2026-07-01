import type { BlogApiComment, BlogComment } from '@/features/blog/domain/entities/blog.type';

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
