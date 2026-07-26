import { createApiCall } from '@/shared/infrastructure/api/apiClient';
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
    GetBookmarkedBeatsParams,
} from '@/features/challenge/domain/entities/challenge.type';

export const challengeRemoteDataSource = {
    getBeats: (params: GetBeatsParams = {}) => {
        let url = '/beats';
        const queryParts = [];
        if (params.page !== undefined) queryParts.push(`page=${params.page}`);
        if (params.page_size !== undefined) queryParts.push(`page_size=${params.page_size}`);
        if (params.genre) queryParts.push(`genre=${encodeURIComponent(params.genre)}`);

        if (queryParts.length > 0) {
            url += '?' + queryParts.join('&');
        }

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

    // Bookmark (challenge) — idempotent 204, cần Bearer token. Xem CHALLENGE_BOOKMARK_API.
    bookmarkBeat: (id: string) => createApiCall<void>('POST', `/beats/${id}/bookmark`)(),

    unbookmarkBeat: (id: string) => createApiCall<void>('DELETE', `/beats/${id}/bookmark`)(),

    // GET /beats/bookmarked — sort mới bookmark trước; mọi item có is_bookmarked=true.
    getBookmarkedBeats: (params: GetBookmarkedBeatsParams = {}) => {
        const queryParts: string[] = [];
        if (params.page !== undefined) queryParts.push(`page=${params.page}`);
        if (params.page_size !== undefined) queryParts.push(`page_size=${params.page_size}`);
        const qs = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
        return createApiCall<GetBeatsResponse>('GET', `/beats/bookmarked${qs}`)();
    },
};

/** @deprecated Use challengeRepository instead */
export const challengeApi = challengeRemoteDataSource;
