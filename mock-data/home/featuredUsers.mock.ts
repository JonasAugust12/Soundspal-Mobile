import type {
    FeaturedUser,
    FeaturedUsersData,
    Genre,
} from '@/features/explore/domain/entities/search.type';
import type { ArtistItem } from '@/features/home/presentation/components';

const MOCK_TIMESTAMP = '2026-07-09T10:00:00.000Z';

const genre = (id: string, name: string): Genre => ({
    id,
    name,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
});

export const MOCK_FEATURED_USERS: FeaturedUser[] = [
    {
        id: 'user-mock-singer-1',
        username: 'minhanh_vocal',
        status: 'active',
        email: 'minhanh@example.com',
        role: 'singer',
        display_name: 'Minh Anh',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        cover_url: 'https://images.unsplash.com/photo-1511379938549-c1f69419868d?w=800',
        brief_bio: 'Ca sĩ Pop/R&B, 5 năm kinh nghiệm biểu diễn live',
        city: 'Quận 1',
        country: 'Việt Nam',
        genres: [genre('g1', 'Pop'), genre('g2', 'R&B'), genre('g3', 'Soul')],
        is_verified: true,
        is_featured: true,
        featured_at: MOCK_TIMESTAMP,
        created_at: MOCK_TIMESTAMP,
        updated_at: MOCK_TIMESTAMP,
    },
    {
        id: 'user-mock-producer-1',
        username: 'beatmaker_k',
        status: 'active',
        email: 'beatmaker@example.com',
        role: 'producer',
        display_name: 'K-Beatmaker',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        cover_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231bb04?w=800',
        brief_bio: 'Producer Hip-hop & Lo-fi, làm việc với nhiều indie artist',
        city: 'Hà Nội',
        country: 'Việt Nam',
        genres: [genre('g4', 'Hip-hop'), genre('g5', 'Lo-fi'), genre('g6', 'Trap')],
        is_verified: true,
        is_featured: true,
        featured_at: MOCK_TIMESTAMP,
        created_at: MOCK_TIMESTAMP,
        updated_at: MOCK_TIMESTAMP,
    },
    {
        id: 'user-mock-venue-1',
        username: 'acoustic_lounge',
        status: 'active',
        email: 'venue@example.com',
        role: 'venue',
        display_name: 'Acoustic Lounge',
        avatar_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
        brief_bio: 'Không gian acoustic 200 chỗ, phù hợp showcase & mini concert',
        city: 'Đà Nẵng',
        country: 'Việt Nam',
        genres: [genre('g7', 'Acoustic'), genre('g8', 'Jazz')],
        is_verified: false,
        is_featured: true,
        featured_at: MOCK_TIMESTAMP,
        created_at: MOCK_TIMESTAMP,
        updated_at: MOCK_TIMESTAMP,
    },
    {
        id: 'user-mock-singer-2',
        username: 'lan_piano',
        status: 'active',
        email: 'lan@example.com',
        role: 'singer',
        display_name: 'Lan Piano',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        brief_bio: 'Ca sĩ kiêm pianist, chuyên ballad và nhạc phim',
        city: 'TP. Hồ Chí Minh',
        country: 'Việt Nam',
        genres: [genre('g9', 'Ballad'), genre('g10', 'Soundtrack')],
        is_verified: true,
        is_featured: true,
        featured_at: MOCK_TIMESTAMP,
        created_at: MOCK_TIMESTAMP,
        updated_at: MOCK_TIMESTAMP,
    },
];

export const MOCK_FEATURED_USERS_RESPONSE: { data: FeaturedUsersData } = {
    data: {
        cache_until: '2026-07-09T12:00:00.000Z',
        cached_at: MOCK_TIMESTAMP,
        count: MOCK_FEATURED_USERS.length,
        users: {
            users: MOCK_FEATURED_USERS,
            total: MOCK_FEATURED_USERS.length,
        },
    },
};

export const MOCK_HOME_ARTIST_ITEMS: ArtistItem[] = MOCK_FEATURED_USERS.map((user) => ({
    id: user.id,
    name: user.display_name,
    description: user.brief_bio || `${user.role} chuyên nghiệp`,
    location:
        user.city && user.country
            ? `${user.city}, ${user.country}`
            : user.city || user.country || 'Chưa cập nhật',
    skills: user.genres?.map((g) => g.name).join('/') || 'Chưa cập nhật',
    image: user.avatar_url ? { uri: user.avatar_url } : require('@/assets/images/user_profile.png'),
    role: user.role,
}));
