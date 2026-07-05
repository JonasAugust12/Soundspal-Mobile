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
import { SearchBar } from './SearchBar';
import { JobCardFull } from './JobCardFull';
import { JobCardSkeleton } from './JobCardSkeleton';

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
    search: string;
    onSearchChange: (text: string) => void;
    listHeader?: React.ReactElement;
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
    search,
    onSearchChange,
    listHeader,
}: JobListProps) => {
    const renderItem: ListRenderItem<Job & { isOwned?: boolean }> = useCallback(
        ({ item }) => (
            <View className="w-[90%] self-center">
                <JobCardFull job={item} isOwned={item.isOwned} />
            </View>
        ),
        [],
    );

    const keyExtractor = useCallback((item: Job) => item.id, []);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    const renderListHeader = useCallback(
        () => (
            <View className="gap-5">
                {listHeader}
                <View className="w-full px-4">
                    <SearchBar
                        value={search}
                        onChangeText={onSearchChange}
                        placeholder="Tìm kiếm công việc..."
                    />
                </View>
            </View>
        ),
        [listHeader, search, onSearchChange],
    );

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

    const renderEmpty = useCallback(() => {
        if (isLoading) {
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

        return (
            <View className="flex-1 justify-center items-center py-20">
                <Text className="text-lg text-gray-500 dark:text-gray-400">
                    Không tìm thấy việc làm nào
                </Text>
            </View>
        );
    }, [isLoading, error, onRetry]);

    const itemSeparator = useCallback(() => <View className="h-4" />, []);

    return (
        <FlatList
            data={jobs}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderListFooter}
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={itemSeparator}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.35}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
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
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
        />
    );
};

export { JOB_PAGE_SIZE };
