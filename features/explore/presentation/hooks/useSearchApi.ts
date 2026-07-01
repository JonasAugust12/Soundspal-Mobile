import { useQuery } from '@tanstack/react-query';
import { searchRepository } from '@/features/explore/data/repositories/SearchRepositoryImpl';
import type { SearchUsersRequest } from '@/features/explore/domain/entities/search.type';

// API Calls
// Search Users Hook
export const useSearchUsers = (params: SearchUsersRequest) => {
    return useQuery({
        queryKey: ['search-users', params],
        queryFn: () => searchRepository.searchUsers(params),
        staleTime: 60000, // 1 minute
    });
};

// Get Genres Hook
export const useGetGenres = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: () => searchRepository.getGenres(),
        staleTime: 3600000, // 1 hour - genres rarely change
    });
};

// Featured Users Hook
export const useFeaturedUsers = (limit: number = 10) => {
    return useQuery({
        queryKey: ['featured-users', limit],
        queryFn: () => searchRepository.getFeaturedUsers(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes - featured content doesn't change often
        gcTime: 10 * 60 * 1000, // 10 minutes cache time (previously cacheTime)
    });
};

// Featured Jobs Hook
export const useFeaturedJobs = (limit: number = 10) => {
    return useQuery({
        queryKey: ['featured-jobs', limit],
        queryFn: () => searchRepository.getFeaturedJobs(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes cache time
    });
};
