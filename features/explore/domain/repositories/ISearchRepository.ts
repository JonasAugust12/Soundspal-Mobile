import type { searchRemoteDataSource } from '@/features/explore/data/datasources/searchRemoteDataSource';

export interface ISearchRepository {
    searchUsers(
        ...args: Parameters<typeof searchRemoteDataSource.searchUsers>
    ): ReturnType<typeof searchRemoteDataSource.searchUsers>;
    getGenres(
        ...args: Parameters<typeof searchRemoteDataSource.getGenres>
    ): ReturnType<typeof searchRemoteDataSource.getGenres>;
    getFeaturedUsers(
        ...args: Parameters<typeof searchRemoteDataSource.getFeaturedUsers>
    ): ReturnType<typeof searchRemoteDataSource.getFeaturedUsers>;
    getFeaturedJobs(
        ...args: Parameters<typeof searchRemoteDataSource.getFeaturedJobs>
    ): ReturnType<typeof searchRemoteDataSource.getFeaturedJobs>;
}
