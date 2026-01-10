import { useQuery } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import type { FeaturedUsersResponse, FeaturedJobsResponse } from '@/types/search.type';

// API Calls
const searchApi = {
    getFeaturedUsers: (limit: number) =>
        createApiCall<FeaturedUsersResponse>('GET', `/landing/featured-users?limit=${limit}`)(),
    getFeaturedJobs: (limit: number) =>
        createApiCall<FeaturedJobsResponse>('GET', `/landing/featured-jobs?limit=${limit}`)(),
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
