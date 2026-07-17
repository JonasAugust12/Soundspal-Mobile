import React from 'react';
import { View } from 'react-native';

export const JobCardSkeleton = () => {
    return (
        <View className="w-full px-4">
            <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 p-4 gap-4">
                {/* Image and Title Row */}
                <View className="flex-row gap-3">
                    {/* Image Skeleton */}
                    <View className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />

                    <View className="flex-1 gap-2">
                        {/* Title Skeleton */}
                        <View className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 animate-pulse" />
                        {/* Type Skeleton */}
                        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 animate-pulse" />
                    </View>
                </View>

                {/* Tags Skeleton */}
                <View className="flex-row flex-wrap gap-2">
                    <View className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <View className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <View className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </View>

                {/* Info Row Skeleton */}
                <View className="flex-row flex-wrap gap-3">
                    <View className="h-10 flex-1 min-w-[45%] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <View className="h-10 flex-1 min-w-[45%] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <View className="h-10 flex-1 min-w-[45%] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <View className="h-10 flex-1 min-w-[45%] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                </View>

                {/* Button Skeleton */}
                <View className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mt-2" />
            </View>
        </View>
    );
};
