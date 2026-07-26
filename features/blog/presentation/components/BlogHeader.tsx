import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

interface BlogHeaderProps {
    /** Ghi đè hành vi nút back nếu cần; mặc định là router.back(). */
    onBackPress?: () => void;
}

export function BlogHeader({ onBackPress }: BlogHeaderProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View
            className={`flex-row items-center px-4 py-4 ${
                isDark ? 'bg-slate-900' : 'bg-white'
            } border-b ${isDark ? 'border-slate-800' : 'border-gray-200'}`}
        >
            <TouchableOpacity
                onPress={handleBack}
                className="p-2 -ml-2"
                accessibilityRole="button"
                accessibilityLabel="Quay lại"
                hitSlop={8}
            >
                <ChevronLeft size={26} color={isDark ? '#E2E8F0' : '#1F2937'} strokeWidth={2} />
            </TouchableOpacity>

            <Text className={`ml-1 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Blog
            </Text>
        </View>
    );
}
