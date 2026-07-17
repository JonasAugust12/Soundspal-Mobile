/**
 * Chữ + cấu hình hiển thị của màn Home.
 *
 * Đây KHÔNG phải dữ liệu — không có API nào trả về mấy thứ này (tiêu đề mục, nhãn nút,
 * màu gradient, route điều hướng). Dữ liệu thật (nghệ sĩ / việc làm / bài viết) lấy qua
 * useFeaturedUsers / useFeaturedJobs / useBlogFeed.
 */

export interface HomeSection {
    id: string;
    title: string;
    accentColor: string;
    seeAllLabel: string;
    seeAllRoute: string;
    badgeLabel?: string;
    emptyMessage: string;
}

export const HOME_SECTIONS = {
    blog: {
        id: 'blog',
        title: 'Blog · Tin tức',
        accentColor: '#3B82F6',
        seeAllLabel: 'Tất cả',
        seeAllRoute: '/(blog)',
        emptyMessage: 'Chưa có bài viết',
    },
    artists: {
        id: 'artists',
        title: 'Nghệ sĩ nổi bật',
        accentColor: '#7C3BED',
        seeAllLabel: 'Tất cả',
        seeAllRoute: '/(tabs)/explore',
        emptyMessage: 'Chưa có nghệ sĩ nổi bật',
    },
    jobs: {
        id: 'jobs',
        title: 'Việc làm hot',
        accentColor: '#F97316',
        seeAllLabel: 'Tất cả',
        seeAllRoute: '/(tabs)/jobs',
        badgeLabel: 'Mới',
        emptyMessage: 'Chưa có việc làm nổi bật',
    },
} as const satisfies Record<string, HomeSection>;

export const HOME_HEADER = {
    blogButtonAccessibilityLabel: 'Mở Blog',
    blogRoute: '/(blog)' as const,
};

export interface HomeSearchContent {
    title: string;
    subtitle: string;
    exploreRoute: '/(tabs)/explore';
    gradientColors: readonly [string, string];
}

export const HOME_SEARCH: HomeSearchContent = {
    title: 'Tìm kiếm nghệ sĩ, địa điểm...',
    subtitle: 'Ca sĩ, Producer, Địa điểm biểu diễn',
    exploreRoute: '/(tabs)/explore',
    gradientColors: ['#7C3BED', '#EC4899'],
};

export interface HomeHeroContent {
    badgeLabel: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    ctaLabel: string;
    ctaRoute: '/(challenge)/explore';
    gradientColors: readonly [string, string, string];
}

export const HOME_HERO: HomeHeroContent = {
    badgeLabel: 'Thử thách mới',
    titleLine1: 'SONIC PULSE',
    titleLine2: 'CYBERPUNK',
    description: 'Trổ tài thu âm trên beat Cyberpunk, leo rank và tỏa sáng ngay hôm nay!',
    ctaLabel: 'Tham gia ngay',
    ctaRoute: '/(challenge)/explore',
    gradientColors: ['#7C3BED', '#9333EA', '#A855F7'],
};
