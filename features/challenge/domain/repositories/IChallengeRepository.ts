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

export interface IChallengeRepository {
    getBeats(params?: GetBeatsParams): Promise<GetBeatsResponse>;
    getBeatById(id: string): Promise<Beat>;
    getLeaderboard(
        id: string,
        limit?: number,
        offset?: number,
        includeUnscored?: boolean,
    ): Promise<GetLeaderboardResponse>;
    updateBeat(id: string, body: Partial<Beat>): Promise<Beat>;
    deleteBeat(id: string): Promise<void>;
    submitEntry(id: string, formData: FormData): Promise<BeatEntry>;
    voteEntry(entryId: string, voteType: 'up'): Promise<void>;
    removeVote(entryId: string): Promise<void>;
    getUserStats(userId: string): Promise<UserStats>;
    createBeat(formData: FormData): Promise<Beat>;
    getMyBeats(params?: GetMyBeatsParams): Promise<GetMyBeatsResponse>;
    getMyEntries(params?: GetMyEntriesParams): Promise<GetMyEntriesResponse>;
    deleteEntry(entryId: string): Promise<void>;
    bookmarkBeat(id: string): Promise<void>;
    unbookmarkBeat(id: string): Promise<void>;
    getBookmarkedBeats(params?: GetBookmarkedBeatsParams): Promise<GetBeatsResponse>;
}
