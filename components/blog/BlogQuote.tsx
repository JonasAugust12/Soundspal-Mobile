import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

interface BlogQuoteProps {
    text: string;
}

export function BlogQuote({ text }: BlogQuoteProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View
            className={`my-6 pl-4 py-4 border-l-4 border-purple-600 ${
                isDark ? 'bg-slate-800/50' : 'bg-purple-50'
            }`}
        >
            <Text
                className={`text-base italic font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
            >
                {text}
            </Text>
        </View>
    );
}
