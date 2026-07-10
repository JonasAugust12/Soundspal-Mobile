import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TabScreenWrapper } from '@/shared/presentation/navigation/TabScreenWrapper';
import {
    JobHeader,
    JobTabs,
    JobList,
    SearchBar,
    JOB_PAGE_SIZE,
} from '@/features/jobs/presentation/components';
import {
    useGetJobsInfinite,
    useGetMyPostsInfinite,
} from '@/features/jobs/presentation/hooks/useJobApi';
import { Job } from '@/features/jobs/domain/entities/job.type';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { MOCK_JOBS } from '@/mock-data/jobs';

const SEARCH_DEBOUNCE_MS = 500;

export default function JobsScreen() {
    const { user } = useAuthStore();
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [jobTab, setJobTab] = useState<'others' | 'mine'>('others');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const {
        data: allJobsData,
        isLoading: allJobsLoading,
        isFetchingNextPage: allJobsFetchingNext,
        hasNextPage: allJobsHasNext,
        fetchNextPage: fetchNextAllJobs,
        error: allJobsError,
        refetch: refetchAllJobs,
        isRefetching: allJobsRefetching,
    } = useGetJobsInfinite({
        pageSize: JOB_PAGE_SIZE,
        search: search || undefined,
        status: 'published',
        visibility: 'public',
    });

    const {
        data: myJobsData,
        isLoading: myJobsLoading,
        isFetchingNextPage: myJobsFetchingNext,
        hasNextPage: myJobsHasNext,
        fetchNextPage: fetchNextMyJobs,
        error: myJobsError,
        refetch: refetchMyJobs,
        isRefetching: myJobsRefetching,
    } = useGetMyPostsInfinite({ pageSize: JOB_PAGE_SIZE });

    const currentUserId = user?.id;

    const othersJobs = useMemo(() => {
        const allPosts = allJobsData?.pages.flatMap((page) => page.posts ?? []) ?? [];
        if (!currentUserId) {
            return allPosts;
        }
        return allPosts.filter(
            (job: Job) => String(job.creator_id).trim() !== String(currentUserId).trim(),
        );
    }, [allJobsData, currentUserId]);

    const myJobs = useMemo(
        () => myJobsData?.pages.flatMap((page) => page.posts ?? []) ?? [],
        [myJobsData],
    );

    const othersJobsWithOwnership = useMemo(() => {
        const mapped = othersJobs.map((job) => ({ ...job, isOwned: false as const }));
        // Fallback: hiển thị job mock khi danh sách thật trống (chưa có dữ liệu / đang phát triển).
        if (mapped.length === 0 && !allJobsLoading && !allJobsError && !search) {
            return MOCK_JOBS.map((job) => ({ ...job, isOwned: false as const }));
        }
        return mapped;
    }, [othersJobs, allJobsLoading, allJobsError, search]);

    const myJobsWithOwnership = useMemo(
        () => myJobs.map((job) => ({ ...job, isOwned: true as const })),
        [myJobs],
    );

    const handleLoadMoreOthers = useCallback(() => {
        if (allJobsHasNext && !allJobsFetchingNext) {
            void fetchNextAllJobs();
        }
    }, [allJobsHasNext, allJobsFetchingNext, fetchNextAllJobs]);

    const handleLoadMoreMine = useCallback(() => {
        if (myJobsHasNext && !myJobsFetchingNext) {
            void fetchNextMyJobs();
        }
    }, [myJobsHasNext, myJobsFetchingNext, fetchNextMyJobs]);

    const handleRefreshOthers = useCallback(() => {
        void refetchAllJobs();
    }, [refetchAllJobs]);

    const handleRefreshMine = useCallback(() => {
        void refetchMyJobs();
    }, [refetchMyJobs]);

    const handleTabChange = useCallback((tab: 'others' | 'mine') => {
        setJobTab(tab);
    }, []);

    return (
        <TabScreenWrapper scrollable={false}>
            <View className="flex-1">
                <JobHeader />

                <View className="gap-3">
                    <JobTabs activeTab={jobTab} onTabChange={handleTabChange} />
                    {jobTab === 'others' && (
                        <SearchBar
                            value={searchInput}
                            onChangeText={setSearchInput}
                            placeholder="Tìm kiếm công việc..."
                        />
                    )}
                </View>

                <View
                    style={[styles.listPane, jobTab !== 'others' && styles.listPaneHidden]}
                    pointerEvents={jobTab === 'others' ? 'auto' : 'none'}
                >
                    <JobList
                        jobs={othersJobsWithOwnership}
                        isLoading={allJobsLoading}
                        isFetchingNextPage={allJobsFetchingNext}
                        hasNextPage={!!allJobsHasNext}
                        onLoadMore={handleLoadMoreOthers}
                        onRefresh={handleRefreshOthers}
                        isRefreshing={allJobsRefetching}
                        error={allJobsError}
                        onRetry={handleRefreshOthers}
                        listHeader={
                            <ListSectionHeader
                                count={othersJobsWithOwnership.length}
                                hasMore={!!allJobsHasNext}
                                singular="cơ hội phù hợp"
                            />
                        }
                    />
                </View>

                <View
                    style={[styles.listPane, jobTab !== 'mine' && styles.listPaneHidden]}
                    pointerEvents={jobTab === 'mine' ? 'auto' : 'none'}
                >
                    <JobList
                        jobs={myJobsWithOwnership}
                        isLoading={myJobsLoading}
                        isFetchingNextPage={myJobsFetchingNext}
                        hasNextPage={!!myJobsHasNext}
                        onLoadMore={handleLoadMoreMine}
                        onRefresh={handleRefreshMine}
                        isRefreshing={myJobsRefetching}
                        error={myJobsError}
                        onRetry={handleRefreshMine}
                        listHeader={
                            <ListSectionHeader
                                count={myJobsWithOwnership.length}
                                hasMore={!!myJobsHasNext}
                                singular="tin đã đăng"
                            />
                        }
                    />
                </View>
            </View>
        </TabScreenWrapper>
    );
}

interface ListSectionHeaderProps {
    count: number;
    hasMore: boolean;
    singular: string;
}

function ListSectionHeader({ count, hasMore, singular }: ListSectionHeaderProps) {
    return (
        <View className="px-4 pb-3 flex-row items-baseline gap-1.5">
            <Text className="text-base font-extrabold text-gray-900 dark:text-white">
                {count}
                {hasMore ? '+' : ''}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">{singular}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    listPane: {
        flex: 1,
    },
    listPaneHidden: {
        display: 'none',
    },
});
