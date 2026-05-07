import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import type {
    GetBeatsResponse,
    GetBeatsParams,
    Beat,
    BeatEntry,
    GetLeaderboardResponse,
    UserStats,
    GetMyBeatsResponse,
    GetMyBeatsParams,
    GetMyEntriesResponse,
    GetMyEntriesParams,
} from '@/types/challenge.type';

// API Calls
export const challengeApi = {
    getBeats: (params: GetBeatsParams = {}) => {
        let url = '/beats';
        const queryParts = [];
        if (params.page !== undefined) queryParts.push(`page=${params.page}`);
        if (params.page_size !== undefined) queryParts.push(`page_size=${params.page_size}`);
        if (params.genre) queryParts.push(`genre=${encodeURIComponent(params.genre)}`);

        if (queryParts.length > 0) {
            url += '?' + queryParts.join('&');
        }

        // The API returns the format { beats: [...], pagination: {...} } directly,
        // or wrapped in ApiResponse based on standard backend conventions.
        // API currently returns the direct payload instead of ApiResponse
        return createApiCall<GetBeatsResponse>('GET', url)();
    },

    getBeatById: (id: string) => createApiCall<Beat>('GET', `/beats/${id}`)(),

    getLeaderboard: (
        id: string,
        limit: number = 20,
        offset: number = 0,
        includeUnscored: boolean = false,
    ) =>
        createApiCall<GetLeaderboardResponse>(
            'GET',
            `/beats/${id}/leaderboard?limit=${limit}&offset=${offset}&include_unscored=${includeUnscored}`,
        )(),

    updateBeat: (id: string, body: Partial<Beat>) =>
        createApiCall<Beat, Partial<Beat>>('PUT', `/beats/${id}`)(body),

    deleteBeat: (id: string) => createApiCall<void>('DELETE', `/beats/${id}`)(),

    submitEntry: (id: string, formData: FormData) =>
        createApiCall<BeatEntry, FormData>('POST', `/beats/${id}/entries`)(formData),

    voteEntry: (entryId: string, voteType: 'up') =>
        createApiCall<void, { vote_type: string }>(
            'POST',
            `/beats/entries/${entryId}/vote`,
        )({ vote_type: voteType }),

    removeVote: (entryId: string) =>
        createApiCall<void>('DELETE', `/beats/entries/${entryId}/vote`)(),

    getUserStats: (userId: string) => createApiCall<UserStats>('GET', `/beats/stats/${userId}`)(),

    createBeat: (formData: FormData) => createApiCall<Beat, FormData>('POST', '/beats')(formData),

    getMyBeats: (params: GetMyBeatsParams = {}) => {
        const queryParts: string[] = [];
        if (params.page !== undefined) queryParts.push(`page=${params.page}`);
        if (params.page_size !== undefined) queryParts.push(`page_size=${params.page_size}`);
        if (params.genre) queryParts.push(`genre=${encodeURIComponent(params.genre)}`);
        const qs = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
        return createApiCall<GetMyBeatsResponse>('GET', `/beats/my${qs}`)();
    },

    getMyEntries: (params: GetMyEntriesParams = {}) => {
        const queryParts: string[] = [];
        if (params.page !== undefined) queryParts.push(`page=${params.page}`);
        if (params.page_size !== undefined) queryParts.push(`page_size=${params.page_size}`);
        if (params.beat_id) queryParts.push(`beat_id=${params.beat_id}`);
        if (params.scoring_status) queryParts.push(`scoring_status=${params.scoring_status}`);
        const qs = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
        return createApiCall<GetMyEntriesResponse>('GET', `/beats/entries/my${qs}`)();
    },

    deleteEntry: (entryId: string) => createApiCall<void>('DELETE', `/beats/entries/${entryId}`)(),
};

// Custom Hooks

export const useGetBeats = (params: GetBeatsParams = {}) => {
    return useQuery({
        queryKey: ['beats', params],
        queryFn: () => challengeApi.getBeats(params),
        staleTime: 60000,
    });
};

export const useGetBeatById = (id: string | undefined) => {
    return useQuery({
        queryKey: ['beat', id],
        queryFn: () => {
            if (!id) throw new Error('Beat ID is required');
            return challengeApi.getBeatById(id);
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
            return challengeApi.getLeaderboard(id, limit, offset, includeUnscored);
        },
        enabled: !!id,
        staleTime: 30000,
    });
};

export const useGetMyBeats = (params: GetMyBeatsParams = {}) => {
    return useQuery({
        queryKey: ['my-beats', params],
        queryFn: () => challengeApi.getMyBeats(params),
        staleTime: 30000,
    });
};

export const useGetMyEntries = (params: GetMyEntriesParams = {}) => {
    return useQuery({
        queryKey: ['my-entries', params],
        queryFn: () => challengeApi.getMyEntries(params),
        staleTime: 30000,
    });
};

export const useDeleteBeat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => challengeApi.deleteBeat(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-beats'] });
            queryClient.invalidateQueries({ queryKey: ['beats'] });
        },
    });
};

export const useDeleteEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entryId: string) => challengeApi.deleteEntry(entryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-entries'] });
        },
    });
};

// Mutation hooks for submission and rating can be added later as needed
