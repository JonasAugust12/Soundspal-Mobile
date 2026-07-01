import type { ISearchRepository } from '@/features/explore/domain/repositories/ISearchRepository';
import { searchRemoteDataSource } from '@/features/explore/data/datasources/searchRemoteDataSource';

export class SearchRepositoryImpl implements ISearchRepository {
    searchUsers = searchRemoteDataSource.searchUsers;
    getGenres = searchRemoteDataSource.getGenres;
    getFeaturedUsers = searchRemoteDataSource.getFeaturedUsers;
    getFeaturedJobs = searchRemoteDataSource.getFeaturedJobs;
}

export const searchRepository = new SearchRepositoryImpl();
