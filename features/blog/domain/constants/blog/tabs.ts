import type { BlogTab } from '@/features/blog/domain/entities/blog.type';

/** Giá trị tab "Dành cho bạn" (feed tổng, không phải một chủ đề). */
export const BLOG_FOR_YOU_VALUE = 'for-you';

/** Tab feed mặc định; các chủ đề còn lại được lấy động từ GET /blogs/topics. */
export const BLOG_FOR_YOU_TAB: BlogTab = {
    id: 'for-you',
    label: 'Dành cho bạn',
    value: BLOG_FOR_YOU_VALUE,
};

/**
 * @deprecated Chủ đề nay lấy động từ /blogs/topics (useBlogTopics). Chỉ còn tab
 * "Dành cho bạn" là tĩnh; giữ mảng này cho tương thích import cũ.
 */
export const BLOG_FEED_TABS: BlogTab[] = [BLOG_FOR_YOU_TAB];
