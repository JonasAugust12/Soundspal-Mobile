import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import type {
    User,
    UpdateUserRequest,
    MediaItem,
    MediaResponse,
    VideoItem,
    VideoResponse,
} from '@/types/user.type';

// API Calls
const userApi = {
    getCurrentUser: () => {
        return createApiCall<User>('GET', '/users/me')();
    },

    getUserByUsername: (username: string) => {
        return createApiCall<User>('GET', `/users/${username}`)();
    },

    getCurrentUserMedia: () => {
        return createApiCall<MediaResponse>('GET', '/users/me/media')();
    },

    getUserMedia: (username: string) => {
        return createApiCall<MediaResponse>('GET', `/users/media/${username}`)();
    },

    getUserVideos: (username: string) => {
        return createApiCall<{ data: VideoResponse }>('GET', `/users/videos/all/${username}`)();
    },

    updateBasicInfo: createApiCall<User, {
        display_name?: string;
        brief_bio?: string;
        detail_bio?: string;
        city?: string;
        country?: string;
    }>('PUT', '/users/me/basic'),

    updateContactInfo: createApiCall<User, {
        email?: string;
        phone_number?: string;
    }>('PUT', '/users/me/contact'),

    updateSocialLinks: createApiCall<User, {
        facebook_url?: string;
        instagram_url?: string;
        youtube_url?: string;
    }>('PUT', '/users/me/social'),

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
        '/users/me/featured-releases'
    ),
};

// Query Keys
export const userKeys = {
    all: ['users'] as const,
    current: () => [...userKeys.all, 'current'] as const,
    byUsername: (username: string) => [...userKeys.all, 'username', username] as const,
    media: () => [...userKeys.all, 'media'] as const,
    currentMedia: () => [...userKeys.media(), 'current'] as const,
    userMedia: (username: string) => [...userKeys.media(), username] as const,
    videos: () => [...userKeys.all, 'videos'] as const,
    userVideos: (username: string) => [...userKeys.videos(), username] as const,
};

// Get Current User Hook
export const useGetCurrentUser = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.current(),
        queryFn: userApi.getCurrentUser,
        enabled: options?.enabled !== false,
        staleTime: 300000, // 5 minutes
    });
};

// Get User By Username Hook
export const useGetUserByUsername = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.byUsername(username),
        queryFn: () => userApi.getUserByUsername(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 300000, // 5 minutes
    });
};

// Get Current User Media Hook
export const useGetCurrentUserMedia = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.currentMedia(),
        queryFn: userApi.getCurrentUserMedia,
        enabled: options?.enabled !== false,
        staleTime: 180000, // 3 minutes
    });
};

// Get User Media Hook
export const useGetUserMedia = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userMedia(username),
        queryFn: () => userApi.getUserMedia(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 180000, // 3 minutes
    });
};

// Get User Videos Hook
export const useGetUserVideos = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userVideos(username),
        queryFn: () => userApi.getUserVideos(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 180000, // 3 minutes
        select: (data) => data.data, // Extract nested data
    });
};

// Update Basic Info Hook
export const useUpdateBasicInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateBasicInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Contact Info Hook
export const useUpdateContactInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateContactInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Social Links Hook
export const useUpdateSocialLinks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateSocialLinks,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Upload User Avatar Hook
export const useUploadUserAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.uploadUserAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Upload User Cover Hook
export const useUploadUserCover = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.uploadUserCover,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Upload User Media Hook
export const useUploadUserMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.uploadUserMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.media() });
        },
    });
};

// Delete User Media Hook
export const useDeleteUserMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.deleteUserMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.media() });
        },
    });
};

// Upload User Video Hook
export const useUploadUserVideo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.uploadUserVideo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.videos() });
        },
    });
};

// Delete User Video Hook
export const useDeleteUserVideo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.deleteUserVideo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.videos() });
        },
    });
};

// Update Featured Releases Hook
export const useUpdateFeaturedReleases = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateFeaturedReleases,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};
