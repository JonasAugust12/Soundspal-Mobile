import type { BlogTab } from '@/features/blog/domain/entities/blog.type';

/** Feed + topic chips only — “My posts” / “Bookmarks” use a separate `BlogLibraryRow` UI. */
export const BLOG_FEED_TABS: BlogTab[] = [
    { id: '1', label: 'Dành cho bạn', value: 'for-you' },
    { id: '2', label: 'Xu hướng âm nhạc', value: 'music-trend' },
    { id: '3', label: 'Hợp tác', value: 'collaborations' },
    { id: '4', label: 'Sản xuất', value: 'production' },
];

/** @deprecated Use `BLOG_FEED_TABS` — name kept for older imports. */
export const BLOG_TABS = BLOG_FEED_TABS;

/** Valid `topic_id` when creating a post (“For you” is feed-only). */
export const BLOG_CREATE_TOPIC_OPTIONS: BlogTab[] = BLOG_FEED_TABS.filter(
    (t) => t.value !== 'for-you',
);
