export interface Genre {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export type UserRole = 'singer' | 'producer' | 'venue';

export interface FeaturedUser {
    id: string;
    username: string;
    status: string;
    email: string;
    role: UserRole;
    display_name: string;
    avatar_url?: string;
    cover_url?: string;
    phone_number?: string;
    brief_bio?: string;
    detail_bio?: string;
    city?: string;
    country?: string;
    genres: Genre[];
    is_verified: boolean;
    is_featured: boolean;
    featured_at: string;
    created_at: string;
    updated_at: string;
}

export interface FeaturedUsersData {
    cache_until: string;
    cached_at: string;
    count: number;
    users: FeaturedUser[];
}

export interface FeaturedUsersResponse {
    message: string;
    data: FeaturedUsersData;
}

export interface FeaturedJob {
    id: string;
    post_type: string;
    status: string;
    visibility: string;
    creator_id: string;
    creator_username: string;
    creator_display_name: string;
    creator_avatar_url?: string;
    creator_role: UserRole;
    title: string;
    brief_description: string;
    description: string;
    type: string;
    recruitment_type?: string;
    location_type?: string;
    location: string;
    budget_min?: number;
    budget_max?: number;
    budget_currency?: string;
    payment_type?: string;
    is_negotiable?: boolean;
    deadline?: string;
    work_time?: string;
    genres: string[];
    required_skills?: string[];
    benefits?: string[];
    experience_level?: string;
    views_count: number;
    applications_count: number;
    bookings_count: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
    is_pool: boolean;
    pool_type?: string;
    submission_deadline?: string;
    auto_notify?: boolean;
    total_submissions?: number;
    can_accept_submissions?: boolean;
    is_deadline_passed?: boolean;
}

export interface FeaturedJobsData {
    cache_until: string;
    cached_at: string;
    count: number;
    jobs: FeaturedJob[];
}

export interface FeaturedJobsResponse {
    message: string;
    data: FeaturedJobsData;
}

// Search types
export interface UserProfile {
    id: string;
    username: string;
    status: string;
    email: string;
    role: UserRole;
    display_name: string;
    avatar_url?: string;
    cover_url?: string;
    phone_number?: string;
    brief_bio?: string;
    detail_bio?: string;
    city?: string;
    country?: string;
    featured_release_links?: string[];
    genres: Genre[] | null;
    is_verified: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface SearchUsersRequest {
    query?: string;
    role?: UserRole;
    location?: string;
    genres?: string[];
    openHour?: string;
    rentPrice?: string;
    capacity?: string;
    businessTypes?: string[];
    convenientFacilities?: string[];
    page?: number;
    pageSize?: number;
    sortBy?: 'displayName';
    sortOrder?: 'asc' | 'desc';
}

export type SearchUsersResponse = UserProfile[];

export interface GetGenresResponse {
    genres: Genre[];
}

