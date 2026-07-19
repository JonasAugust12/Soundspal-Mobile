import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userRepository } from '@/features/profiles/data/repositories/UserRepositoryImpl';

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
    experiences: () => [...userKeys.all, 'experiences'] as const,
    userExperiences: (username: string) => [...userKeys.experiences(), username] as const,
};

export const useGetCurrentUser = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.current(),
        queryFn: userRepository.getCurrentUser,
        enabled: options?.enabled !== false,
        staleTime: 300000, // 5 minutes
    });
};

export const useGetUserByUsername = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.byUsername(username),
        queryFn: () => userRepository.getUserByUsername(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 300000, // 5 minutes
    });
};

export const useGetCurrentUserMedia = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.currentMedia(),
        queryFn: userRepository.getCurrentUserMedia,
        enabled: options?.enabled !== false,
        staleTime: 180000, // 3 minutes
    });
};

export const useGetUserMedia = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userMedia(username),
        queryFn: () => userRepository.getUserMedia(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 180000, // 3 minutes
    });
};

export const useGetUserVideos = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userVideos(username),
        queryFn: () => userRepository.getUserVideos(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 180000, // 3 minutes
    });
};

export const useUpdateBasicInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateBasicInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUpdateContactInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateContactInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUpdateSocialLinks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateSocialLinks,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUploadUserAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUploadUserCover = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserCover,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUploadUserMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.media() });
        },
    });
};

export const useDeleteUserMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.deleteUserMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.media() });
        },
    });
};

export const useUploadUserVideo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.uploadUserVideo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.videos() });
        },
    });
};

export const useDeleteUserVideo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.deleteUserVideo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.videos() });
        },
    });
};

export const useUpdateFeaturedReleases = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateFeaturedReleases,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useGetAllGenres = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.allGenres(),
        queryFn: userRepository.getAllGenres,
        ...options,
    });
};

export const useGetUserGenres = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userGenres(username),
        queryFn: () => userRepository.getUserGenres(username),
        enabled: !!username && options?.enabled !== false,
        ...options,
    });
};

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

export const useUpdateUserServices = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (services: unknown[]) => userRepository.updateUserServices(services),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUpdateVenueBasic = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateVenueBasic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUpdateVenueContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateVenueContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

export const useUpdateVenueAdditional = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateVenueAdditional,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update My Profile Hook (PATCH /users/me — basic + location + offering + availability)
export const useUpdateMyProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateMyProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// Update Venue Requirements Hook (PATCH /users/me/venue-requirements)
export const useUpdateVenueRequirements = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.updateVenueRequirements,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
};

// ---- Experience (kinh nghiệm) ----

export const useGetUserExperiences = (username: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: userKeys.userExperiences(username),
        queryFn: () => userRepository.getUserExperiences(username),
        enabled: options?.enabled !== false && !!username,
        staleTime: 300000, // 5 minutes
    });
};

export const useCreateExperience = (username: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userRepository.createExperience,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.userExperiences(username) });
        },
    });
};

export const useUpdateExperience = (username: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: Parameters<typeof userRepository.updateExperience>[1];
        }) => userRepository.updateExperience(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.userExperiences(username) });
        },
    });
};

export const useUpdateExperienceGenres = (username: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, genreNames }: { id: string; genreNames: string[] }) =>
            userRepository.updateExperienceGenres(id, genreNames),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.userExperiences(username) });
        },
    });
};

export const useDeleteExperience = (username: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userRepository.deleteExperience(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.userExperiences(username) });
        },
    });
};
