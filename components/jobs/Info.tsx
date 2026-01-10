import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface InfoProps {
    icon: LucideIcon;
    text: string;
    iconColor?: string;
    iconSize?: number;
}

export const Info = ({ icon: Icon, text, iconColor = '#7C3BED', iconSize = 14 }: InfoProps) => {
    return (
        <View className="flex-row items-center gap-1.5">
            <Icon size={iconSize} color={iconColor} />
            <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {text}
            </Text>
        </View>
    );
};
