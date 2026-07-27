import type { ApiResponse } from '@/shared/domain/entities/apiresponse.type';
import type {
    SearchUsersRequest,
    SearchUsersData,
    GetGenresData,
    FeaturedUsersData,
    FeaturedJobsData,
} from '@/features/explore/domain/entities/search.type';

export interface ISearchRepository {
    searchUsers(params: SearchUsersRequest): Promise<ApiResponse<SearchUsersData>>;
    getGenres(): Promise<ApiResponse<GetGenresData>>;
    getFeaturedUsers(limit: number): Promise<ApiResponse<FeaturedUsersData>>;
    getFeaturedJobs(limit: number): Promise<ApiResponse<FeaturedJobsData>>;
}
