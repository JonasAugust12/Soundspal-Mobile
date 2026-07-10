import React, { useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    ListRenderItem,
    RefreshControl,
} from 'react-native';
import { Job } from '@/features/jobs/domain/entities/job.type';
import { JobCardSkeleton } from './JobCardSkeleton';
import { JobListItem } from './JobListItem';

const JOB_PAGE_SIZE = 10;

interface JobListProps {
    jobs: (Job & { isOwned?: boolean })[];
    isLoading: boolean;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    error?: unknown;
    onRetry?: () => void;
    /** Header cuộn cùng danh sách (vd: số lượng kết quả). Ẩn khi danh sách trống. */
    listHeader?: React.ReactNode;
}

export const JobList = ({
    jobs,
    isLoading,
    isFetchingNextPage = false,
    hasNextPage = false,
    onLoadMore,
    onRefresh,
    isRefreshing = false,
    error,
    onRetry,
    listHeader,
}: JobListProps) => {
    const renderItem: ListRenderItem<Job & { isOwned?: boolean }> = useCallback(
        ({ item }) => <JobListItem item={item} />,
        [],
    );

    const keyExtractor = useCallback((item: Job) => item.id, []);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    const renderListFooter = useCallback(() => {
        if (!isFetchingNextPage) {
            return <View className="h-4" />;
        }
        return (
            <View className="py-6 items-center">
                <ActivityIndicator color="#7C3BED" size="small" />
            </View>
        );
    }, [isFetchingNextPage]);

    const showInitialLoading = isLoading && jobs.length === 0;
    const showEmpty = !showInitialLoading && jobs.length === 0;

    const renderEmpty = useCallback(() => {
        if (showInitialLoading) {
            return (
                <View className="w-full gap-4 px-4">
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 justify-center items-center gap-3 py-20 px-4">
                    <Text className="text-lg text-red-600 dark:text-red-400 text-center">
                        Không thể tải danh sách việc làm
                    </Text>
                    {onRetry && (
                        <TouchableOpacity
                            onPress={onRetry}
                            className="bg-purple-600 px-6 py-3 rounded-xl active:opacity-80"
                        >
                            <Text className="text-white font-semibold">Thử lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        if (showEmpty) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <Text className="text-lg text-gray-500 dark:text-gray-400">
                        Không tìm thấy việc làm nào
                    </Text>
                </View>
            );
        }

        return null;
    }, [showInitialLoading, showEmpty, error, onRetry]);

    const itemSeparator = useCallback(() => <View className="h-4" />, []);

    // Chỉ hiện header khi đã có dữ liệu để không lơ lửng trên trạng thái trống/lỗi.
    const listHeaderComponent = jobs.length > 0 ? <>{listHeader}</> : null;

    return (
        <FlatList
            data={jobs}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={listHeaderComponent}
            ListFooterComponent={renderListFooter}
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={itemSeparator}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.35}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, flexGrow: 1, paddingTop: 12 }}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#7C3BED"
                        colors={['#7C3BED']}
                    />
                ) : undefined
            }
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews
        />
    );
};

export { JOB_PAGE_SIZE };
