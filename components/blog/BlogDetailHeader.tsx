import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ArrowLeft, Bookmark, Bell } from 'lucide-react-native';

interface BlogDetailHeaderProps {
    onBackPress: () => void;
    onBookmarkPress?: () => void;
    onNotificationPress?: () => void;
    isBookmarked?: boolean;
}

export function BlogDetailHeader({
    onBackPress,
    onBookmarkPress,
    onNotificationPress,
    isBookmarked = false,
}: BlogDetailHeaderProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View
            className={`flex-row items-center justify-between px-4 py-3 border-b ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}
        >
            <TouchableOpacity onPress={onBackPress} className="p-2 -ml-2">
                <ArrowLeft size={24} color={isDark ? '#E2E8F0' : '#1F2937'} strokeWidth={2} />
            </TouchableOpacity>

            <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Soundspal
            </Text>

            <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={onBookmarkPress} className="p-2">
                    <Bookmark
                        size={20}
                        color={isBookmarked ? '#7C3AED' : isDark ? '#E2E8F0' : '#1F2937'}
                        fill={isBookmarked ? '#7C3AED' : 'none'}
                        strokeWidth={1.5}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={onNotificationPress} className="p-2">
                    <Bell size={20} color={isDark ? '#E2E8F0' : '#1F2937'} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
