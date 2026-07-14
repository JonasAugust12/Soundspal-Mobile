import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { cardShadow } from '@/shared/presentation/ui/shadows';

interface JobTabsProps {
    activeTab: 'others' | 'mine';
    onTabChange: (tab: 'others' | 'mine') => void;
    // Số đơn đang chờ duyệt trên các bài đăng của venue — Flow 9.
    mineBadge?: number;
}

export const JobTabs = React.memo(function JobTabs({
    activeTab,
    onTabChange,
    mineBadge,
}: JobTabsProps) {
    return (
        <View className="w-full px-4">
            <View className="flex-row bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                <Pressable
                    onPress={() => onTabChange('others')}
                    className={`flex-1 py-3 rounded-xl ${
                        activeTab === 'others' ? 'bg-white dark:bg-gray-700' : 'bg-transparent'
                    }`}
                    style={activeTab === 'others' ? styles.activeTab : undefined}
                >
                    <Text
                        className={`text-center font-bold text-sm ${
                            activeTab === 'others'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Các job khác
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => onTabChange('mine')}
                    className={`flex-1 py-3 rounded-xl ${
                        activeTab === 'mine' ? 'bg-white dark:bg-gray-700' : 'bg-transparent'
                    }`}
                    style={activeTab === 'mine' ? styles.activeTab : undefined}
                >
                    <View className="flex-row items-center justify-center gap-1.5">
                        <Text
                            className={`text-center font-bold text-sm ${
                                activeTab === 'mine'
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            Job của tôi
                        </Text>
                        {typeof mineBadge === 'number' && mineBadge > 0 && (
                            <View className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center">
                                <Text className="text-white text-[10px] font-bold">
                                    {mineBadge > 99 ? '99+' : mineBadge}
                                </Text>
                            </View>
                        )}
                    </View>
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    activeTab: cardShadow,
});
