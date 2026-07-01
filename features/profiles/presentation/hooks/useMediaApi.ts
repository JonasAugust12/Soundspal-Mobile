import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaRepository } from '@/features/profiles/data/repositories/MediaRepositoryImpl';

export const mediaKeys = {
    all: ['media'] as const,
    lists: () => [...mediaKeys.all, 'list'] as const,
    myMedia: () => [...mediaKeys.lists(), 'myMedia'] as const,
};

export const useGetMyMedia = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: mediaKeys.myMedia(),
        queryFn: () => mediaRepository.getMyMedia(),
        enabled: options?.enabled !== false,
        staleTime: 60000,
    });
};

export const useUploadMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mediaRepository.uploadMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mediaKeys.myMedia() });
        },
    });
};

export const useDeleteMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mediaRepository.deleteMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mediaKeys.myMedia() });
        },
    });
};
