export interface HomeHeroMock {
    badgeLabel: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    ctaLabel: string;
    ctaRoute: '/(challenge)/explore';
    gradientColors: readonly [string, string, string];
}

export const MOCK_HOME_HERO: HomeHeroMock = {
    badgeLabel: 'Thử thách mới',
    titleLine1: 'SONIC PULSE',
    titleLine2: 'CYBERPUNK',
    description: 'Trổ tài thu âm trên beat Cyberpunk, leo rank và tỏa sáng ngay hôm nay!',
    ctaLabel: 'Tham gia ngay',
    ctaRoute: '/(challenge)/explore',
    gradientColors: ['#7C3BED', '#9333EA', '#A855F7'],
};
