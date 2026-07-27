import React from 'react';
import { View } from 'react-native';

export function CollabRequestCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <View className="px-4 gap-3 pt-1">
            {Array.from({ length: count }).map((_, i) => (
                <View
                    key={i}
                    className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse"
                >
                    <View className="flex-row">
                        <View className="w-1 bg-gray-200" />
                        <View className="flex-1 p-4 flex-row gap-3">
                            <View className="w-12 h-12 rounded-full bg-gray-200" />
                            <View className="flex-1 gap-2">
                                <View className="h-4 w-3/4 rounded bg-gray-200" />
                                <View className="h-3 w-1/3 rounded bg-gray-200" />
                                <View className="h-3 w-1/2 rounded bg-gray-200" />
                                <View className="flex-row gap-2 mt-1">
                                    <View className="h-5 w-20 rounded-full bg-gray-200" />
                                    <View className="h-5 w-24 rounded-full bg-gray-200" />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

export function CollabCalendarSkeleton() {
    return (
        <View className="px-4 gap-4 pt-1 animate-pulse">
            <View className="flex-row flex-wrap gap-2">
                {[0, 1, 2, 3].map((i) => (
                    <View
                        key={i}
                        className="flex-1 min-w-[45%] rounded-2xl bg-white border border-gray-100 p-4"
                    >
                        <View className="h-3 w-16 rounded bg-gray-200 mb-3" />
                        <View className="h-7 w-10 rounded bg-gray-200" />
                    </View>
                ))}
            </View>
            <View className="rounded-2xl bg-white border border-gray-100 h-72" />
            <View className="rounded-2xl bg-white border border-gray-100 p-4 gap-3">
                {[0, 1, 2].map((i) => (
                    <View key={i} className="flex-row gap-3 items-center">
                        <View className="w-10 h-10 rounded-full bg-gray-200" />
                        <View className="flex-1 gap-2">
                            <View className="h-4 w-2/3 rounded bg-gray-200" />
                            <View className="h-3 w-1/2 rounded bg-gray-200" />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
