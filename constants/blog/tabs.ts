import type { BlogTab } from '@/types/blog.type';

/** Feed + topic chips only — “My posts” / “Bookmarks” use a separate `BlogLibraryRow` UI. */
export const BLOG_FEED_TABS: BlogTab[] = [
    { id: '1', label: 'For You', value: 'for-you' },
    { id: '2', label: 'Music Trend', value: 'music-trend' },
    { id: '3', label: 'Collaborations', value: 'collaborations' },
    { id: '4', label: 'Production', value: 'production' },
];

/** @deprecated Use `BLOG_FEED_TABS` — name kept for older imports. */
export const BLOG_TABS = BLOG_FEED_TABS;

/** Valid `topic_id` when creating a post (“For you” is feed-only). */
export const BLOG_CREATE_TOPIC_OPTIONS: BlogTab[] = BLOG_FEED_TABS.filter(
    (t) => t.value !== 'for-you',
);
