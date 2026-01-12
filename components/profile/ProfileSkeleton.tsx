import React from 'react';
import { View } from 'react-native';

export function ProfileSkeleton() {
    return (
        <View className="gap-4">
            {/* Background skeleton */}
            <View className="h-44 w-full bg-muted animate-pulse" />

            {/* Avatar and info skeleton */}
            <View className="flex-row items-center gap-4 px-5 -mt-14">
                <View className="w-24 h-24 rounded-lg bg-muted animate-pulse" />
                <View className="gap-2 flex-1">
                    <View className="w-32 h-5 rounded bg-muted animate-pulse" />
                    <View className="w-24 h-4 rounded bg-muted animate-pulse" />
                </View>
            </View>

            {/* Bio skeleton */}
            <View className="px-5 gap-2">
                <View className="w-full h-4 rounded bg-muted animate-pulse" />
                <View className="w-3/4 h-4 rounded bg-muted animate-pulse" />
            </View>

            {/* Button skeleton */}
            <View className="px-5">
                <View className="w-full h-12 rounded-xl bg-muted animate-pulse" />
            </View>

            {/* Sections skeleton */}
            <View className="px-5 gap-4">
                <View className="w-32 h-5 rounded bg-muted animate-pulse" />
                <View className="w-full h-48 rounded-xl bg-muted animate-pulse" />
            </View>

            <View className="px-5 gap-4">
                <View className="w-32 h-5 rounded bg-muted animate-pulse" />
                <View className="flex-row gap-3">
                    <View className="flex-1 h-40 rounded-xl bg-muted animate-pulse" />
                    <View className="flex-1 h-40 rounded-xl bg-muted animate-pulse" />
                </View>
            </View>
        </View>
    );
}
