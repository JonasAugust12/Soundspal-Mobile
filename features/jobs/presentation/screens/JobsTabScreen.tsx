import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TabScreenWrapper } from '@/shared/presentation/navigation/TabScreenWrapper';
import {
    JobFilterSheet,
    countActiveFilters,
    type JobFilters,
} from '@/features/jobs/presentation/components/JobFilterSheet';
import {
    JobHeader,
    JobTabs,
    JobList,
    SearchBar,
    JOB_PAGE_SIZE,
} from '@/features/jobs/presentation/components';
import type { JobTabKey } from '@/features/jobs/presentation/components/JobTabs';
import {
    useGetJobsInfinite,
    useGetMyPostsInfinite,
    useGetPendingApplicationsCount,
} from '@/features/jobs/presentation/hooks/useJobApi';
import { Job } from '@/features/jobs/domain/entities/job.type';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useJobBookmarkStore } from '@/features/jobs/presentation/store/jobBookmarkStore';

const SEARCH_DEBOUNCE_MS = 500;

export default function JobsScreen() {
    const { user } = useAuthStore();
    const router = useRouter();
    const isVenue = user?.role === 'venue';
    const isArtist = user?.role === 'producer' || user?.role === 'singer';
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [jobTab, setJobTab] = useState<JobTabKey>('others');
    const savedJobs = useJobBookmarkStore((s) => s.savedJobs);
    const [filters, setFilters] = useState<JobFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const activeFilterCount = countActiveFilters(filters);

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
        ...filters,
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

    // Flow 9 — badge số đơn chờ duyệt, chỉ bật cho venue.
    const { data: pendingCountData } = useGetPendingApplicationsCount({ enabled: isVenue });
    const pendingCount = isVenue ? (pendingCountData?.count ?? 0) : 0;

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

    // Tab "Đã lưu" — đọc thẳng job đã lưu trong store (kể cả job lưu từ trang chủ / chi
    // tiết mà chưa nằm trong danh sách đã tải). Không còn lọc từ list khác.
    const savedJobsWithOwnership = useMemo(
        () =>
            savedJobs.map((job) => ({
                ...job,
                isOwned: String(job.creator_id).trim() === String(currentUserId).trim(),
            })),
        [savedJobs, currentUserId],
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

    const handleTabChange = useCallback((tab: JobTabKey) => {
        setJobTab(tab);
    }, []);

    return (
        <TabScreenWrapper scrollable={false}>
            <View className="flex-1">
                <JobHeader
                    onOpenMyApplications={
                        isArtist
                            ? () => router.push('/(jobs)/my-applications' as `${string}`)
                            : undefined
                    }
                />

                <View className="gap-3">
                    <JobTabs
                        activeTab={jobTab}
                        onTabChange={handleTabChange}
                        mineBadge={pendingCount}
                        savedBadge={savedJobs.length}
                    />
                    {jobTab === 'others' && (
                        <View className="flex-row items-center gap-2 pr-4">
                            <View className="flex-1">
                                <SearchBar
                                    value={searchInput}
                                    onChangeText={setSearchInput}
                                    placeholder="Tìm kiếm công việc..."
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowFilters(true)}
                                className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 items-center justify-center"
                                activeOpacity={0.7}
                            >
                                <SlidersHorizontal size={20} color="#7C3BED" />
                                {activeFilterCount > 0 && (
                                    <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-purple-600 items-center justify-center">
                                        <Text className="text-white text-[10px] font-bold">
                                            {activeFilterCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
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

                <View
                    style={[styles.listPane, jobTab !== 'saved' && styles.listPaneHidden]}
                    pointerEvents={jobTab === 'saved' ? 'auto' : 'none'}
                >
                    <JobList
                        jobs={savedJobsWithOwnership}
                        isLoading={false}
                        isFetchingNextPage={false}
                        hasNextPage={false}
                        onLoadMore={() => {}}
                        onRefresh={handleRefreshOthers}
                        isRefreshing={allJobsRefetching}
                        error={null}
                        onRetry={handleRefreshOthers}
                        listHeader={
                            <ListSectionHeader
                                count={savedJobsWithOwnership.length}
                                hasMore={false}
                                singular="tin đã lưu"
                            />
                        }
                    />
                </View>
            </View>

            <JobFilterSheet
                visible={showFilters}
                initialFilters={filters}
                onApply={setFilters}
                onClose={() => setShowFilters(false)}
            />
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
