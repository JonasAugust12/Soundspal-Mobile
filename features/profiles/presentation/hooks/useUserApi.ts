import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userRepository } from '@/features/profiles/data/repositories/UserRepositoryImpl';

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
    genres: () => [...userKeys.all, 'genres'] as const,
    allGenres: () => [...userKeys.genres(), 'all'] as const,
    userGenres: (username: string) => [...userKeys.genres(), username] as const,
};

// Get Current User Hook
export const useGetCurrentUser = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.current(),
        queryFn: userRepository.getCurrentUser,
        enabled: options?.enabled !== false,
        staleTime: 300000, // 5 minutes
    });
};

// Get User By Username Hook
export const useGetUserByUsername = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.byUsername(username),
        queryFn: () => userRepository.getUserByUsername(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 300000, // 5 minutes
    });
};

// Get Current User Media Hook
export const useGetCurrentUserMedia = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.currentMedia(),
        queryFn: userRepository.getCurrentUserMedia,
        enabled: options?.enabled !== false,
        staleTime: 180000, // 3 minutes
    });
};

// Get User Media Hook
export const useGetUserMedia = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userMedia(username),
        queryFn: () => userRepository.getUserMedia(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 180000, // 3 minutes
    });
};

// Get User Videos Hook
export const useGetUserVideos = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userVideos(username),
        queryFn: () => userRepository.getUserVideos(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 180000, // 3 minutes
    });
};

// Update Basic Info Hook
export const useUpdateBasicInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateBasicInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Contact Info Hook
export const useUpdateContactInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateContactInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Social Links Hook
export const useUpdateSocialLinks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateSocialLinks,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Upload User Avatar Hook
export const useUploadUserAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Upload User Cover Hook
export const useUploadUserCover = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserCover,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Upload User Media Hook
export const useUploadUserMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.media() });
        },
    });
};

// Delete User Media Hook
export const useDeleteUserMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.deleteUserMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.media() });
        },
    });
};

// Upload User Video Hook
export const useUploadUserVideo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserVideo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.videos() });
        },
    });
};

// Delete User Video Hook
export const useDeleteUserVideo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.deleteUserVideo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.videos() });
        },
    });
};

// Update Featured Releases Hook
export const useUpdateFeaturedReleases = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateFeaturedReleases,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Get All Genres Hook
export const useGetAllGenres = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.allGenres(),
        queryFn: userRepository.getAllGenres,
        ...options,
    });
};

// Get User Genres Hook
export const useGetUserGenres = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userGenres(username),
        queryFn: () => userRepository.getUserGenres(username),
        enabled: !!username && options?.enabled !== false,
        ...options,
    });
};

// Update User Genres Hook
export const useUpdateUserGenres = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ username, genreNames }: { username: string; genreNames: string[] }) =>
            userRepository.updateUserGenres(username, genreNames),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.userGenres(variables.username) });
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update User Services Hook
export const useUpdateUserServices = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (services: unknown[]) => userRepository.updateUserServices(services),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Venue Basic Hook
export const useUpdateVenueBasic = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateVenueBasic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Venue Contact Hook
export const useUpdateVenueContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateVenueContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Venue Additional Hook
export const useUpdateVenueAdditional = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateVenueAdditional,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};
