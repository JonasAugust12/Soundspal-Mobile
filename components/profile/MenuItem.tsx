import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface MenuItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
}

export default function MenuItem({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
}: MenuItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700"
        >
            <View className="flex-row items-center px-4 py-3 gap-3">
                {/* Icon Container */}
                <View className="w-10 h-10 items-center justify-center rounded-lg">
                    {icon}
                </View>

                {/* Content */}
                <View className="flex-1 gap-1">
                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Chevron */}
                {showChevron && (
                    <View className="text-gray-400 dark:text-gray-600">
                        <ChevronRight size={20} />
                    </View>
                )}
            </View>

            {/* Separator */}
            <View className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />
        </TouchableOpacity>
    );
}
