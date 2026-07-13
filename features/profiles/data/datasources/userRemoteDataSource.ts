import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import {
    postMultipartWithFetch,
    unwrapUploadPayload,
} from '@/shared/infrastructure/api/multipartUpload';
import type {
    User,
    MediaItem,
    MediaResponse,
    VideoItem,
    VideoResponse,
    GenresResponse,
    Experience,
    ExperienceCreatePayload,
    ExperienceUpdatePayload,
    ExperienceListData,
    UpdateMyProfilePayload,
    UpdateVenueRequirementsPayload,
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
            tiktok_url?: string;
            soundcloud_url?: string;
        }
    >('PUT', '/users/me/social'),

    // Cập nhật gộp hồ sơ (basic + location + offering + availability)
    updateMyProfile: createApiCall<User, UpdateMyProfilePayload>('PATCH', '/users/me'),

    // Yêu cầu nghệ sĩ của venue
    updateVenueRequirements: createApiCall<User, UpdateVenueRequirementsPayload>(
        'PATCH',
        '/users/me/venue-requirements',
    ),

    // Upload đi qua fetch (không phải axios) vì axios 1.x trên RN gửi hỏng multipart — xem multipartUpload.ts.
    uploadUserAvatar: async (formData: FormData): Promise<MediaItem> => {
        const payload = await postMultipartWithFetch('/users/me/avatar', formData);
        return unwrapUploadPayload<MediaItem>(payload);
    },

    uploadUserCover: async (formData: FormData): Promise<MediaItem> => {
        const payload = await postMultipartWithFetch('/users/me/cover', formData);
        return unwrapUploadPayload<MediaItem>(payload);
    },

    uploadUserMedia: async (formData: FormData): Promise<MediaItem> => {
        const payload = await postMultipartWithFetch('/users/me/media', formData);
        return unwrapUploadPayload<MediaItem>(payload);
    },

    deleteUserMedia: (mediaId: string) => {
        return createApiCall<void>('DELETE', `/users/me/media/${mediaId}`)();
    },

    uploadUserVideo: async (formData: FormData): Promise<VideoItem> => {
        const payload = await postMultipartWithFetch('/users/videos', formData);
        return unwrapUploadPayload<VideoItem>(payload);
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
            state_province?: string;
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

    // Experience (kinh nghiệm / work history)
    getUserExperiences: async (username: string): Promise<Experience[]> => {
        const response = await createApiCall<ApiResponse<ExperienceListData>>(
            'GET',
            `/users/experiences/${username}`,
        )();
        const data = response.data;
        if (Array.isArray(data)) return data;
        return data?.experiences ?? data?.items ?? [];
    },

    createExperience: async (payload: ExperienceCreatePayload): Promise<Experience> => {
        const response = await createApiCall<ApiResponse<Experience>, ExperienceCreatePayload>(
            'POST',
            '/experiences',
        )(payload);
        return response.data;
    },

    updateExperience: async (id: string, payload: ExperienceUpdatePayload): Promise<Experience> => {
        const response = await createApiCall<ApiResponse<Experience>, ExperienceUpdatePayload>(
            'PUT',
            `/experiences/${id}`,
        )(payload);
        return response.data;
    },

    deleteExperience: (id: string): Promise<void> => {
        return createApiCall<void>('DELETE', `/experiences/${id}`)();
    },

    updateExperienceGenres: (id: string, genreNames: string[]): Promise<unknown> => {
        return createApiCall<unknown, { genre_names: string[] }>(
            'PUT',
            `/experiences/genres/${id}`,
        )({ genre_names: genreNames });
    },
};
