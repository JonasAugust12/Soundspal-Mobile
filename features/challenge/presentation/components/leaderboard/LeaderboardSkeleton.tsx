import React from 'react';
import { View } from 'react-native';

export function LeaderboardSkeleton() {
    return (
        <View className="animate-pulse">
            <View className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <View className="h-10 w-3/4 bg-gray-200 rounded mb-4" />
            <View className="h-14 bg-gray-200 rounded-2xl mb-8" />
            <View className="h-[340px] bg-gray-200 rounded-3xl mb-10" />
            <View className="gap-3">
                {[1, 2, 3].map((i) => (
                    <View key={i} className="h-20 bg-gray-200 rounded-2xl" />
                ))}
            </View>
        </View>
    );
}
