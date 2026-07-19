import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { searchRepository } from '@/features/explore/data/repositories/SearchRepositoryImpl';
import type { SearchUsersRequest } from '@/features/explore/domain/entities/search.type';

const DEFAULT_PAGE_SIZE = 20;

type SearchUsersPageParams = Omit<SearchUsersRequest, 'page'>;

// Search Users Hook (single page — kept for tests / simple callers)
export const useSearchUsers = (params: SearchUsersRequest) => {
    return useQuery({
        queryKey: ['search-users', params],
        queryFn: () => searchRepository.searchUsers(params),
        staleTime: 60000,
    });
};

/** Paginated search — loads more artists as the user scrolls. */
export const useSearchUsersInfinite = (params: SearchUsersPageParams) => {
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

    return useInfiniteQuery({
        queryKey: ['search-users-infinite', params],
        queryFn: ({ pageParam }) =>
            searchRepository.searchUsers({
                ...params,
                page: pageParam,
                pageSize,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const lastPageUsers = lastPage.data?.users?.length ?? 0;
            if (lastPageUsers === 0 || lastPageUsers < pageSize) {
                return undefined;
            }
            const total = lastPage.data?.total ?? 0;
            const loadedCount = allPages.reduce(
                (sum, page) => sum + (page.data?.users?.length ?? 0),
                0,
            );
            return loadedCount < total ? allPages.length + 1 : undefined;
        },
        staleTime: 60000,
    });
};

export const useGetGenres = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: () => searchRepository.getGenres(),
        staleTime: 3600000, // 1 hour - genres rarely change
    });
};

export const useFeaturedUsers = (limit: number = 10) => {
    return useQuery({
        queryKey: ['featured-users', limit],
        queryFn: () => searchRepository.getFeaturedUsers(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes - featured content doesn't change often
        gcTime: 10 * 60 * 1000, // 10 minutes cache time (previously cacheTime)
    });
};

export const useFeaturedJobs = (limit: number = 10) => {
    return useQuery({
        queryKey: ['featured-jobs', limit],
        queryFn: () => searchRepository.getFeaturedJobs(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes cache time
    });
};
