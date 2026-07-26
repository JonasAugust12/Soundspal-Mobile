import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

interface CollabTabsProps {
    activeTab: 'sent' | 'received';
    onTabChange: (tab: 'sent' | 'received') => void;
}

// Đổ bóng nhẹ, tách riêng iOS (shadow*) và Android (elevation) — trước đây gộp chung một object
// nên Android chỉ nhận elevation:2, đổ bóng đậm/thô như viền quầng. Giờ bóng mảnh + viền hairline
// để tab đang chọn nổi lên tự nhiên trên cả hai nền tảng.
const activeTabShadow = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    android: { elevation: 1 },
});

export const CollabTabs = ({ activeTab, onTabChange }: CollabTabsProps) => {
    return (
        <View className="flex-row gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full">
            {['sent', 'received'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => onTabChange(tab as 'sent' | 'received')}
                        className={`flex-1 py-3 rounded-lg items-center justify-center ${
                            isActive
                                ? 'bg-white dark:bg-gray-700 border border-black/5 dark:border-white/10'
                                : 'bg-transparent'
                        }`}
                        style={isActive ? activeTabShadow : undefined}
                    >
                        <Text
                            className={`font-semibold text-sm ${
                                isActive
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            {tab === 'sent' ? 'Đã gửi' : 'Nhận được'}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
