import { useInfiniteQuery } from '@tanstack/react-query';
import { searchRepository } from '@/features/explore/data/repositories/SearchRepositoryImpl';
import { jobRepository } from '@/features/jobs/data/repositories/JobRepositoryImpl';

const PAGE_SIZE = 10;

/**
 * Tìm người dùng (ca sĩ / producer / venue) cho luồng tìm kiếm tổng hợp.
 * Chỉ chạy khi `enabled` (có từ khoá) — khớp hành vi autocomplete bên web.
 */
export const useUnifiedUserSearch = (query: string, enabled: boolean) => {
    return useInfiniteQuery({
        queryKey: ['unified-search', 'users', query],
        queryFn: ({ pageParam }) =>
            searchRepository.searchUsers({
                query: query || undefined,
                page: pageParam,
                pageSize: PAGE_SIZE,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const lastLen = lastPage.data?.users?.length ?? 0;
            if (lastLen === 0 || lastLen < PAGE_SIZE) {
                return undefined;
            }
            const total = lastPage.data?.total ?? 0;
            const loaded = allPages.reduce((sum, page) => sum + (page.data?.users?.length ?? 0), 0);
            return loaded < total ? allPages.length + 1 : undefined;
        },
        enabled,
        staleTime: 60000,
    });
};

/**
 * Tìm việc làm (job/gig công khai) cho luồng tìm kiếm tổng hợp.
 * Chỉ chạy khi `enabled` (có từ khoá).
 */
export const useUnifiedJobSearch = (query: string, enabled: boolean) => {
    return useInfiniteQuery({
        queryKey: ['unified-search', 'jobs', query],
        queryFn: ({ pageParam }) =>
            jobRepository.getJobs({
                search: query || undefined,
                page: pageParam,
                pageSize: PAGE_SIZE,
                status: 'published',
                visibility: 'public',
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const pagination = lastPage.pagination;
            if (pagination) {
                return pagination.current_page >= pagination.total_pages
                    ? undefined
                    : pagination.current_page + 1;
            }
            const count = lastPage.posts?.length ?? 0;
            return count < PAGE_SIZE ? undefined : allPages.length + 1;
        },
        enabled,
        staleTime: 60000,
    });
};
