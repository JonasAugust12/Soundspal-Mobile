import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    User,
    MediaItem,
    MediaResponse,
    VideoItem,
    VideoResponse,
    GenresResponse,
} from '@/features/profiles/domain/entities/user.type';
import { ApiResponse } from '@/shared/domain/entities/apiresponse.type';

export const userRemoteDataSource = {
    getCurrentUser: async () => {
        const response = await createApiCall<ApiResponse<User>>('GET', '/users/me')();
        return response.data;
    },

    getUserByUsername: async (username: string) => {
        const response = await createApiCall<ApiResponse<User>>('GET', `/users/${username}`)();
        return response.data;
    },

    getCurrentUserMedia: async () => {
        const response = await createApiCall<ApiResponse<MediaResponse>>(
            'GET',
            '/users/me/media',
        )();
        return response.data;
    },

    getUserMedia: async (username: string) => {
        const response = await createApiCall<ApiResponse<MediaResponse>>(
            'GET',
            `/users/media/${username}`,
        )();
        return response.data;
    },

    getUserVideos: async (username: string) => {
        const response = await createApiCall<ApiResponse<VideoResponse>>(
            'GET',
            `/users/videos/all/${username}`,
        )();
        return response.data;
    },

    updateBasicInfo: createApiCall<
        User,
        {
            display_name?: string;
            brief_bio?: string;
            detail_bio?: string;
            city?: string;
            country?: string;
        }
    >('PUT', '/users/me/basic'),

    updateContactInfo: createApiCall<
        User,
        {
            email?: string;
            phone_number?: string;
        }
    >('PUT', '/users/me/contact'),

    updateSocialLinks: createApiCall<
        User,
        {
            facebook_url?: string;
            instagram_url?: string;
            youtube_url?: string;
        }
    >('PUT', '/users/me/social'),

    uploadUserAvatar: (formData: FormData) => {
        return createApiCall<MediaItem, FormData>('POST', '/users/me/avatar')(formData);
    },

    uploadUserCover: (formData: FormData) => {
        return createApiCall<MediaItem, FormData>('POST', '/users/me/cover')(formData);
    },

    uploadUserMedia: (formData: FormData) => {
        return createApiCall<MediaItem, FormData>('POST', '/users/me/media')(formData);
    },

    deleteUserMedia: (mediaId: string) => {
        return createApiCall<void>('DELETE', `/users/me/media/${mediaId}`)();
    },

    uploadUserVideo: (formData: FormData) => {
        return createApiCall<VideoItem, FormData>('POST', '/users/videos')(formData);
    },

    deleteUserVideo: (videoId: string) => {
        return createApiCall<void>('DELETE', `/users/videos/${videoId}`)();
    },

    updateFeaturedReleases: createApiCall<User, { featured_release_links: string[] }>(
        'PUT',
        '/users/me/featured-releases',
    ),

    // Genre APIs
    getAllGenres: async () => {
        const response = await createApiCall<ApiResponse<GenresResponse>>('GET', '/users/genres')();
        return response.data;
    },

    getUserGenres: async (username: string) => {
        const response = await createApiCall<ApiResponse<GenresResponse>>(
            'GET',
            `/users/genres/${username}`,
        )();
        return response.data;
    },

    updateUserGenres: (username: string, genreNames: string[]) => {
        return createApiCall<unknown, { genre_names: string[] }>(
            'PUT',
            `/users/genres/${username}`,
        )({ genre_names: genreNames });
    },

    updateUserServices: (services: unknown[]) => {
        return createApiCall<unknown, { services: unknown[] }>(
            'PUT',
            '/users/me/services',
        )({
            services,
        });
    },

    // Venue APIs
    updateVenueBasic: createApiCall<
        User,
        {
            display_name?: string;
            brief_bio?: string;
            business_type?: string[];
            capacity?: string;
        }
    >('PUT', '/users/me/venue/basic'),

    updateVenueContact: createApiCall<
        User,
        {
            email?: string;
            phone_number?: string;
            city?: string;
            country?: string;
            detailed_address?: string;
            website_url?: string;
        }
    >('PUT', '/users/me/venue/contact'),

    updateVenueAdditional: createApiCall<
        User,
        {
            open_hour?: string;
            convenient_facilities?: string[];
            rent_price?: string;
        }
    >('PUT', '/users/me/venue/additional'),
};
