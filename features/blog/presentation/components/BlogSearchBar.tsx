import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Search, X } from 'lucide-react-native';

interface BlogSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    /** Called when user presses Search/Done on the keyboard (submit-based search). */
    onSubmitSearch?: () => void;
    /** Clears draft + should reset committed query in parent */
    onClear?: () => void;
    isSearching?: boolean;
    placeholder?: string;
}

export function BlogSearchBar({
    value,
    onChangeText,
    onSubmitSearch,
    onClear,
    isSearching,
    placeholder = 'Search posts, topics, tags...',
}: BlogSearchBarProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const canSubmit = value.trim().length > 0;

    return (
        <View className="px-4 pt-1 pb-3">
            <View
                className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border min-h-[48px] ${
                    isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-200'
                }`}
            >
                {/* Fixed slot so spinner ↔ icon swap does not resize the row */}
                <View className="w-6 h-6 items-center justify-center shrink-0">
                    {isSearching ? (
                        <ActivityIndicator size="small" color={isDark ? '#A78BFA' : '#7C3AED'} />
                    ) : (
                        <Search size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    )}
                </View>

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    className={`flex-1 py-1 text-base ${isDark ? 'text-white' : 'text-slate-900'}`}
                    returnKeyType="search"
                    clearButtonMode="never"
                    underlineColorAndroid="transparent"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                        if (canSubmit) onSubmitSearch?.();
                    }}
                />

                {/* Fixed trailing width so Search / clear never appear suddenly and shift the field */}
                <View className="flex-row items-center shrink-0 gap-2 pl-1">
                    {onSubmitSearch ? (
                        <TouchableOpacity
                            onPress={onSubmitSearch}
                            disabled={!canSubmit}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !canSubmit }}
                            className="py-1 px-1 min-w-[52px] items-center justify-center"
                        >
                            <Text
                                className={`text-sm font-semibold ${
                                    canSubmit
                                        ? isDark
                                            ? 'text-violet-400'
                                            : 'text-violet-600'
                                        : isDark
                                          ? 'text-slate-600'
                                          : 'text-gray-400'
                                }`}
                            >
                                Search
                            </Text>
                        </TouchableOpacity>
                    ) : null}

                    <View className="w-9 h-9 items-center justify-center">
                        {value.length > 0 ? (
                            <TouchableOpacity
                                onPress={() => (onClear ? onClear() : onChangeText(''))}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel="Clear search"
                            >
                                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                            </TouchableOpacity>
                        ) : (
                            <View className="w-[18px] h-[18px]" />
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
