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

// Common fields for all user types
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
    // Social links
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    website_url?: string;
    // Artist specific
    featured_release_links?: string[];
    genres?: string[];
    services?: UserService[];
}

// Singer/Producer specific fields
export interface ArtistUser extends BaseUser {
    role: Role.SINGER | Role.PRODUCER;
    featured_release_links?: string[];
    genres?: string[];
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
}

// Venue specific fields
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

// Union type for all user types
export type User = ArtistUser | VenueUser | BaseUser;

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
