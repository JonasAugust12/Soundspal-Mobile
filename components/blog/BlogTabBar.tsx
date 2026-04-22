import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import type { BlogTab } from '@/types/blog.type';

interface BlogTabBarProps {
    tabs: BlogTab[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function BlogTabBar({ tabs, activeTab, onTabChange }: BlogTabBarProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className={isDark ? 'bg-slate-900' : 'bg-white'}>
            <Text
                className={`px-4 pt-3 text-[11px] font-bold uppercase tracking-widest ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
            >
                Discover
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                <View className="flex-row px-4 py-2 pb-3 gap-2">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => onTabChange(tab.value)}
                            className={`px-4 py-2 rounded-full ${
                                activeTab === tab.value
                                    ? 'bg-purple-600'
                                    : isDark
                                      ? 'bg-slate-800'
                                      : 'bg-gray-200'
                            }`}
                        >
                            <Text
                                className={`font-semibold text-sm ${
                                    activeTab === tab.value
                                        ? 'text-white'
                                        : isDark
                                          ? 'text-gray-300'
                                          : 'text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
