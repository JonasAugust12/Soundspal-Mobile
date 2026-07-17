import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    GetBeatsParams,
    GetMyBeatsParams,
    GetMyEntriesParams,
} from '@/features/challenge/domain/entities/challenge.type';
import { challengeRepository } from '@/features/challenge/data/repositories/ChallengeRepositoryImpl';

export { challengeApi } from '@/features/challenge/data/datasources/challengeRemoteDataSource';

export const useGetBeats = (params: GetBeatsParams = {}) => {
    return useQuery({
        queryKey: ['beats', params],
        queryFn: () => challengeRepository.getBeats(params),
        staleTime: 60000,
    });
};

export const useGetBeatById = (id: string | undefined) => {
    return useQuery({
        queryKey: ['beat', id],
        queryFn: () => {
            if (!id) throw new Error('Beat ID is required');
            return challengeRepository.getBeatById(id);
        },
        enabled: !!id,
        staleTime: 60000,
    });
};

export const useGetLeaderboard = (
    id: string | undefined,
    limit: number = 20,
    offset: number = 0,
    includeUnscored: boolean = false,
) => {
    return useQuery({
        queryKey: ['beat-leaderboard', id, limit, offset, includeUnscored],
        queryFn: () => {
            if (!id) throw new Error('Beat ID is required');
            return challengeRepository.getLeaderboard(id, limit, offset, includeUnscored);
        },
        enabled: !!id,
        staleTime: 30000,
    });
};

export const useGetMyBeats = (params: GetMyBeatsParams = {}) => {
    return useQuery({
        queryKey: ['my-beats', params],
        queryFn: () => challengeRepository.getMyBeats(params),
        staleTime: 30000,
    });
};

export const useGetMyEntries = (params: GetMyEntriesParams = {}) => {
    return useQuery({
        queryKey: ['my-entries', params],
        queryFn: () => challengeRepository.getMyEntries(params),
        staleTime: 30000,
    });
};

export const useDeleteBeat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => challengeRepository.deleteBeat(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-beats'] });
            queryClient.invalidateQueries({ queryKey: ['beats'] });
        },
    });
};

export const useDeleteEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entryId: string) => challengeRepository.deleteEntry(entryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-entries'] });
        },
    });
};
