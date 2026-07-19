export enum Role {
    GUEST = 'guest',
    SINGER = 'singer',
    PRODUCER = 'producer',
    VENUE = 'venue',
}

export enum UserStatus {
    PENDING = 'pending',
    VALIDATE = 'validate',
    REJECTED = 'rejected',
}

export interface UserService {
    name: string;
    price: number;
    currency: string;
    is_negotiable: boolean;
}

export interface BaseUser {
    id: string;
    username: string;
    status: UserStatus | string;
    email: string;
    phone_number?: string;
    brief_bio?: string;
    detail_bio?: string;
    role: Role;
    display_name: string;
    avatar_url?: string;
    cover_url?: string;
    city?: string;
    country?: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    tier?: 'free' | 'premium' | string;
    subscription_status?: 'active' | 'expired' | 'cancelled' | string;
    subscription_expires_at?: string | null;
    expires_at?: string | null;
    // Premium flags từ user-service (nguồn chuẩn cho trạng thái Premium — xem docs
    // Premium Upgrade): active = is_premium && premium_expired_at còn ở tương lai.
    is_premium?: boolean;
    premium_expired_at?: string | null;
    // Social links
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    website_url?: string;
    // Artist specific
    featured_release_links?: string[];
    genres?: string[];
    services?: UserService[];

    // Profile uplift (đồng bộ với web)
    state_province?: string;
    service_types?: string[];
    fee_min?: number | null;
    fee_max?: number | null;
    is_available?: boolean;
    tiktok_url?: string;
    soundcloud_url?: string;
    // Venue artist requirements
    preferred_genre_ids?: string[];
    artist_requirements_note?: string;
}

export interface ArtistUser extends BaseUser {
    role: Role.SINGER | Role.PRODUCER;
    featured_release_links?: string[];
    genres?: string[];
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
}

export interface VenueUser extends BaseUser {
    role: Role.VENUE;
    genres?: string[];
    business_types?: string[];
    detailed_address?: string;
    capacity?: string;
    website_url?: string;
    open_hour?: string;
    convenient_facilities?: string[];
    rent_price?: string;
}

export type User = ArtistUser | VenueUser | BaseUser;

// PATCH /users/me — cập nhật gộp (basic + location + offering + availability)
export interface UpdateMyProfilePayload {
    display_name?: string;
    brief_bio?: string;
    detail_bio?: string;
    city?: string;
    country?: string;
    state_province?: string;
    service_types?: string[];
    fee_min?: number | null;
    fee_max?: number | null;
    is_available?: boolean;
}

// PATCH /users/me/venue-requirements
export interface UpdateVenueRequirementsPayload {
    preferred_genre_ids: string[];
    artist_requirements_note: string;
}

export interface UpdateUserRequest {
    display_name?: string;
    avatar_url?: string;
    brief_bio?: string;
    detail_bio?: string;
    phone_number?: string;
    city?: string;
    country?: string;
    featured_release_links?: string[];
    genres?: string[];
    business_types?: string[];
    detailed_address?: string;
    capacity?: string;
    website_url?: string;
    open_hour?: string;
    convenient_facilities?: string[];
    rent_price?: string;
}

export interface MediaItem {
    id: string;
    user_id: string;
    media_type: 'portfolio' | 'avatar' | 'cover';
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    width: number;
    height: number;
    created_at: string;
    updated_at: string;
}

export interface MediaResponse {
    media: MediaItem[];
    total: number;
}

export interface VideoItem {
    id: string;
    user_id: string;
    video_url: string;
    title: string;
    thumbnail_url: string;
    created_at: string;
}

export interface VideoResponse {
    items: VideoItem[];
    total: number;
}

export interface ExperienceGenre {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
}

// Kinh nghiệm / work history của artist
export interface Experience {
    id: string;
    user_id: string;
    title?: string;
    description?: string;
    portfolio_url?: string;
    start_date?: string | null; // ISO (YYYY-MM-DD)
    end_date?: string | null; // ISO (YYYY-MM-DD)
    created_at?: string;
    updated_at?: string;
    genres?: ExperienceGenre[];
}

export interface ExperienceCreatePayload {
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    portfolio_url?: string;
    genre_names?: string[];
}

export interface ExperienceUpdatePayload {
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    portfolio_url?: string;
}

// Backend có thể trả mảng trực tiếp hoặc bọc trong {experiences|items, total}
export type ExperienceListData =
    | Experience[]
    | { experiences?: Experience[]; items?: Experience[]; total?: number };

export interface Genre {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface GenresResponse {
    genres: Genre[];
    total: number;
}
