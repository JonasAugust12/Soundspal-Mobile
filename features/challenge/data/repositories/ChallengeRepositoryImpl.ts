import type { IChallengeRepository } from '@/features/challenge/domain/repositories/IChallengeRepository';
import { challengeRemoteDataSource } from '@/features/challenge/data/datasources/challengeRemoteDataSource';

export class ChallengeRepositoryImpl implements IChallengeRepository {
    getBeats = challengeRemoteDataSource.getBeats;
    getBeatById = challengeRemoteDataSource.getBeatById;
    getLeaderboard = challengeRemoteDataSource.getLeaderboard;
    updateBeat = challengeRemoteDataSource.updateBeat;
    deleteBeat = challengeRemoteDataSource.deleteBeat;
    submitEntry = challengeRemoteDataSource.submitEntry;
    voteEntry = challengeRemoteDataSource.voteEntry;
    removeVote = challengeRemoteDataSource.removeVote;
    getUserStats = challengeRemoteDataSource.getUserStats;
    createBeat = challengeRemoteDataSource.createBeat;
    getMyBeats = challengeRemoteDataSource.getMyBeats;
    getMyEntries = challengeRemoteDataSource.getMyEntries;
    deleteEntry = challengeRemoteDataSource.deleteEntry;
    bookmarkBeat = challengeRemoteDataSource.bookmarkBeat;
    unbookmarkBeat = challengeRemoteDataSource.unbookmarkBeat;
    getBookmarkedBeats = challengeRemoteDataSource.getBookmarkedBeats;
}

export const challengeRepository = new ChallengeRepositoryImpl();
