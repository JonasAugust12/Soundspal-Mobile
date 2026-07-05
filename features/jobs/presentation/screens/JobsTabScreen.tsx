import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

    const othersJobsWithOwnership = useMemo(
        () => othersJobs.map((job) => ({ ...job, isOwned: false as const })),
        [othersJobs],
    );

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
                <JobTabs activeTab={jobTab} onTabChange={handleTabChange} />

                {jobTab === 'others' && (
                    <View className="pb-3">
                        <SearchBar
                            value={searchInput}
                            onChangeText={setSearchInput}
                            placeholder="Tìm kiếm công việc..."
                        />
                    </View>
                )}

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
                    />
                </View>
            </View>
        </TabScreenWrapper>
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
