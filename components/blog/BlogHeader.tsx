import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Bell } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface BlogHeaderProps {
    onMenuPress?: () => void;
    onNotificationPress?: () => void;
}

export function BlogHeader({ onMenuPress, onNotificationPress }: BlogHeaderProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View
            className={`flex-row items-center justify-between px-4 py-4 ${
                isDark ? 'bg-slate-900' : 'bg-white'
            } border-b ${isDark ? 'border-slate-800' : 'border-gray-200'}`}
        >
            <TouchableOpacity onPress={onMenuPress} className="p-2">
                <Menu size={24} color={isDark ? '#E2E8F0' : '#1F2937'} strokeWidth={1.5} />
            </TouchableOpacity>

            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Soundspal
            </Text>

            <TouchableOpacity onPress={onNotificationPress} className="p-2">
                <Bell size={24} color={isDark ? '#E2E8F0' : '#1F2937'} strokeWidth={1.5} />
            </TouchableOpacity>
        </View>
    );
}
