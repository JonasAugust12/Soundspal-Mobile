import React from 'react';
import { View, Text } from 'react-native';

export function HeaderInfo() {
    return (
        <View className="px-6 mt-8 flex-row justify-between items-start">
            <View className="space-y-1 flex-1 pr-4">
                <Text className="font-body text-[10px] uppercase tracking-widest text-[#f471b7] font-bold">
                    Đang thu âm
                </Text>
                <Text
                    className="font-heading text-3xl text-gray-900 font-extrabold tracking-tight"
                    numberOfLines={1}
                >
                    Midnight Cypher Vol. 4
                </Text>
                <Text className="font-body mt-2 text-gray-500 text-sm">
                    Beat: "Neon Rain" - 128 BPM
                </Text>
            </View>
            <View className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-full flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-red-500" />
                <Text className="font-mono font-bold text-lg text-red-500">02:45.08</Text>
            </View>
        </View>
    );
}
