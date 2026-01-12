import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Job } from '@/types/job.type';
import { SearchBar } from './SearchBar';
import { JobCardFull } from './JobCardFull';
import { JobCardSkeleton } from './JobCardSkeleton';

interface JobListProps {
    jobs: (Job & { isOwned?: boolean })[];
    isLoading: boolean;
    error?: any;
    onRetry?: () => void;
    search: string;
    onSearchChange: (text: string) => void;
}

export const JobList = ({
    jobs,
    isLoading,
    error,
    onRetry,
    search,
    onSearchChange
}: JobListProps) => {
    if (isLoading) {
        return (
            <View className="flex-1 w-full gap-4">
                <SearchBar value={search} onChangeText={onSearchChange} placeholder="Tìm kiếm công việc..." />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center gap-3 py-20">
                <Text className="text-lg text-red-600 dark:text-red-400">
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
        <View className="flex-1 w-full gap-3">
            <SearchBar value={search} onChangeText={onSearchChange} placeholder="Tìm kiếm công việc..." />

            {jobs.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                    <Text className="text-lg text-gray-500 dark:text-gray-400">
                        Không tìm thấy việc làm nào
                    </Text>
                </View>
            ) : (
                <View className="flex-1 items-center gap-4 w-[90%] self-center">
                    {jobs.map((job) => (
                        <JobCardFull
                            key={job.id}
                            job={job}
                            isOwned={job.isOwned}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};
