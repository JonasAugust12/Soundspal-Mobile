import { useQuery } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import type {
    FeaturedUsersResponse,
    FeaturedJobsResponse,
    SearchUsersRequest,
    SearchUsersResponse,
    GetGenresResponse,
} from '@/types/search.type';

// API Calls
const searchApi = {
    searchUsers: (params: SearchUsersRequest) => {
        // Remove undefined values and pagination params
        const { page, pageSize, ...restParams } = params;
        const cleanParams = Object.fromEntries(
            Object.entries(restParams).filter(([_, v]) => v !== undefined)
        );

        return createApiCall<SearchUsersResponse, typeof cleanParams>('POST', '/search/users')(
            cleanParams
        );
    },

    getGenres: () => createApiCall<GetGenresResponse>('GET', '/users/genres')(),

    getFeaturedUsers: (limit: number) =>
        createApiCall<FeaturedUsersResponse>('GET', `/landing/featured-users?limit=${limit}`)(),
    getFeaturedJobs: (limit: number) =>
        createApiCall<FeaturedJobsResponse>('GET', `/landing/featured-jobs?limit=${limit}`)(),
};

// Search Users Hook
export const useSearchUsers = (params: SearchUsersRequest) => {
    return useQuery({
        queryKey: ['search-users', params],
        queryFn: () => searchApi.searchUsers(params),
        staleTime: 60000, // 1 minute
    });
};

// Get Genres Hook
export const useGetGenres = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: searchApi.getGenres,
        staleTime: 3600000, // 1 hour - genres rarely change
    });
};

// Featured Users Hook
export const useFeaturedUsers = (limit: number = 10) => {
    return useQuery({
        queryKey: ['featured-users', limit],
        queryFn: () => searchApi.getFeaturedUsers(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes - featured content doesn't change often
        gcTime: 10 * 60 * 1000, // 10 minutes cache time (previously cacheTime)
    });
};

// Featured Jobs Hook
export const useFeaturedJobs = (limit: number = 10) => {
    return useQuery({
        queryKey: ['featured-jobs', limit],
        queryFn: () => searchApi.getFeaturedJobs(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes cache time
    });
};
