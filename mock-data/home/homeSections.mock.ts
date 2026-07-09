export interface HomeSectionMock {
    id: string;
    title: string;
    accentColor: string;
    seeAllLabel: string;
    seeAllRoute: string;
    badgeLabel?: string;
    emptyMessage: string;
}

export const MOCK_HOME_SECTIONS = {
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
} as const satisfies Record<string, HomeSectionMock>;

export const MOCK_HOME_HEADER = {
    blogButtonAccessibilityLabel: 'Mở Blog',
    blogRoute: '/(blog)' as const,
};
