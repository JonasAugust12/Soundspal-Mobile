import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { cardShadow } from '@/shared/presentation/ui/shadows';

export type JobTabKey = 'others' | 'mine' | 'saved';

interface JobTabsProps {
    activeTab: JobTabKey;
    onTabChange: (tab: JobTabKey) => void;
    // Số đơn đang chờ duyệt trên các bài đăng của venue — Flow 9.
    mineBadge?: number;
    // Số tin đã lưu.
    savedBadge?: number;
}

const TABS: { key: JobTabKey; label: string }[] = [
    { key: 'others', label: 'Khác' },
    { key: 'mine', label: 'Của tôi' },
    { key: 'saved', label: 'Đã lưu' },
];

export const JobTabs = React.memo(function JobTabs({
    activeTab,
    onTabChange,
    mineBadge,
    savedBadge,
}: JobTabsProps) {
    return (
        <View className="w-full px-4">
            <View className="flex-row bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const badge =
                        tab.key === 'mine'
                            ? mineBadge
                            : tab.key === 'saved'
                              ? savedBadge
                              : undefined;
                    return (
                        <Pressable
                            key={tab.key}
                            onPress={() => onTabChange(tab.key)}
                            className={`flex-1 py-3 rounded-xl ${
                                isActive ? 'bg-white dark:bg-gray-700' : 'bg-transparent'
                            }`}
                            style={isActive ? styles.activeTab : undefined}
                        >
                            <View className="flex-row items-center justify-center gap-1.5">
                                <Text
                                    className={`text-center font-bold text-sm ${
                                        isActive
                                            ? 'text-purple-600 dark:text-purple-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {tab.label}
                                </Text>
                                {typeof badge === 'number' && badge > 0 && (
                                    <View className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center">
                                        <Text className="text-white text-[10px] font-bold">
                                            {badge > 99 ? '99+' : badge}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    activeTab: cardShadow,
});
