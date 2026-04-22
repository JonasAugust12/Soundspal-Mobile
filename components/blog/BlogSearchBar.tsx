import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Search, X } from 'lucide-react-native';

interface BlogSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    isSearching?: boolean;
    placeholder?: string;
}

export function BlogSearchBar({
    value,
    onChangeText,
    isSearching,
    placeholder = 'Search posts, topics, tags...',
}: BlogSearchBarProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="px-4 pt-1 pb-3">
            <View
                className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-200'
                }`}
            >
                {isSearching ? (
                    <ActivityIndicator size="small" color={isDark ? '#A78BFA' : '#7C3AED'} />
                ) : (
                    <Search size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                )}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    className={`flex-1 py-1 text-base ${isDark ? 'text-white' : 'text-slate-900'}`}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
                {value.length > 0 ? (
                    <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
                        <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}
