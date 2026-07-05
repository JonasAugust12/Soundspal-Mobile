import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { TabScreenWrapper } from '@/shared/presentation/navigation/TabScreenWrapper';
import {
    JobHeader,
    JobTabs,
    JobList,
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
    } = useGetJobsInfinite(
        {
            pageSize: JOB_PAGE_SIZE,
            search: search || undefined,
            status: 'published',
            visibility: 'public',
        },
        { enabled: jobTab === 'others' },
    );

    const {
        data: myJobsData,
        isLoading: myJobsLoading,
        isFetchingNextPage: myJobsFetchingNext,
        hasNextPage: myJobsHasNext,
        fetchNextPage: fetchNextMyJobs,
        error: myJobsError,
        refetch: refetchMyJobs,
        isRefetching: myJobsRefetching,
    } = useGetMyPostsInfinite({ pageSize: JOB_PAGE_SIZE }, { enabled: jobTab === 'mine' });

    const currentUserId = user?.id;

    const displayJobs = useMemo(() => {
        if (jobTab === 'mine') {
            return myJobsData?.pages.flatMap((page) => page.posts ?? []) ?? [];
        }

        const allPosts = allJobsData?.pages.flatMap((page) => page.posts ?? []) ?? [];
        if (!currentUserId) {
            return allPosts;
        }

        return allPosts.filter(
            (job: Job) => String(job.creator_id).trim() !== String(currentUserId).trim(),
        );
    }, [jobTab, myJobsData, allJobsData, currentUserId]);

    const jobsWithOwnership = useMemo(
        () =>
            displayJobs.map((job: Job) => ({
                ...job,
                isOwned:
                    jobTab === 'mine' ||
                    (currentUserId
                        ? String(job.creator_id).trim() === String(currentUserId).trim()
                        : false),
            })),
        [displayJobs, currentUserId, jobTab],
    );

    const isLoading = jobTab === 'mine' ? myJobsLoading : allJobsLoading;
    const isFetchingNextPage = jobTab === 'mine' ? myJobsFetchingNext : allJobsFetchingNext;
    const hasNextPage = jobTab === 'mine' ? myJobsHasNext : allJobsHasNext;
    const error = jobTab === 'mine' ? myJobsError : allJobsError;
    const isRefreshing = jobTab === 'mine' ? myJobsRefetching : allJobsRefetching;

    const handleLoadMore = useCallback(() => {
        if (jobTab === 'mine') {
            if (myJobsHasNext && !myJobsFetchingNext) {
                void fetchNextMyJobs();
            }
            return;
        }
        if (allJobsHasNext && !allJobsFetchingNext) {
            void fetchNextAllJobs();
        }
    }, [
        jobTab,
        myJobsHasNext,
        myJobsFetchingNext,
        fetchNextMyJobs,
        allJobsHasNext,
        allJobsFetchingNext,
        fetchNextAllJobs,
    ]);

    const handleRefresh = useCallback(() => {
        if (jobTab === 'mine') {
            void refetchMyJobs();
            return;
        }
        void refetchAllJobs();
    }, [jobTab, refetchMyJobs, refetchAllJobs]);

    const handleRetry = handleRefresh;

    const listHeader = useMemo(
        () => (
            <View className="gap-5">
                <JobHeader />
                <JobTabs activeTab={jobTab} onTabChange={setJobTab} />
            </View>
        ),
        [jobTab],
    );

    return (
        <TabScreenWrapper scrollable={false}>
            <JobList
                jobs={jobsWithOwnership}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={handleLoadMore}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                error={error}
                onRetry={handleRetry}
                search={searchInput}
                onSearchChange={setSearchInput}
                listHeader={listHeader}
            />
        </TabScreenWrapper>
    );
}
