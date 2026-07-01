import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import { ApiResponse } from '@/shared/domain/entities/apiresponse.type';
import type {
    FeaturedUsersData,
    FeaturedJobsData,
    SearchUsersRequest,
    SearchUsersData,
    GetGenresData,
} from '@/features/explore/domain/entities/search.type';

export const searchRemoteDataSource = {
    searchUsers: (params: SearchUsersRequest) => {
        // Remove undefined values and pagination params
        const { page: _page, pageSize: _pageSize, ...restParams } = params;
        const cleanParams = Object.fromEntries(
            Object.entries(restParams).filter(([_, v]) => v !== undefined),
        );

        return createApiCall<ApiResponse<SearchUsersData>, typeof cleanParams>(
            'POST',
            '/search/users',
        )(cleanParams);
    },

    getGenres: () => createApiCall<ApiResponse<GetGenresData>>('GET', '/users/genres')(),

    getFeaturedUsers: (limit: number) =>
        createApiCall<ApiResponse<FeaturedUsersData>>(
            'GET',
            `/landing/featured-users?limit=${limit}`,
        )(),
    getFeaturedJobs: (limit: number) =>
        createApiCall<ApiResponse<FeaturedJobsData>>(
            'GET',
            `/landing/featured-jobs?limit=${limit}`,
        )(),
};
