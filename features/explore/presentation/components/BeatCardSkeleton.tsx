import React from 'react';
import { View } from 'react-native';

export function BeatCardSkeleton() {
    return (
        <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100 opacity-60">
            <View className="flex-row gap-5">
                {/* Artwork */}
                <View className="w-32 h-32 rounded-xl bg-gray-200" />

                {/* Info */}
                <View className="flex-1 justify-between py-1">
                    <View>
                        <View className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                        <View className="h-4 w-1/2 bg-gray-200 rounded mt-1" />
                    </View>

                    {/* Stats */}
                    <View className="flex-row items-center gap-4 mt-2">
                        <View className="h-4 w-16 bg-gray-200 rounded" />
                        <View className="h-4 w-12 bg-gray-200 rounded" />
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-between">
                <View className="h-6 w-20 bg-gray-200 rounded-md" />
                <View className="h-6 w-24 bg-gray-200 rounded-full" />
            </View>
        </View>
    );
}
