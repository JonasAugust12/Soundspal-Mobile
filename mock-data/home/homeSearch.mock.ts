export interface HomeSearchMock {
    title: string;
    subtitle: string;
    exploreRoute: '/(tabs)/explore';
    gradientColors: readonly [string, string];
}

export const MOCK_HOME_SEARCH: HomeSearchMock = {
    title: 'Tìm kiếm nghệ sĩ, địa điểm...',
    subtitle: 'Ca sĩ, Producer, Địa điểm biểu diễn',
    exploreRoute: '/(tabs)/explore',
    gradientColors: ['#7C3BED', '#EC4899'],
};
