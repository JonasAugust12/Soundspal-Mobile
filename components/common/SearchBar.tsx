import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';

export type SearchBarProps = {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    onFilterPress?: () => void;
    showFilter?: boolean;
    onSubmitEditing?: () => void;
};

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Tìm kiếm ...',
    onFilterPress,
    showFilter = true,
    onSubmitEditing,
}: SearchBarProps) {
    return (
        <View className="px-4">
            <View className="flex-row items-center gap-2 border border-border bg-card rounded-full px-3 h-11 w-full">
                <Search size={18} color="#71717a" />
                <TextInput
                    className="flex-1 text-foreground"
                    placeholder={placeholder}
                    placeholderTextColor="#71717a"
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmitEditing}
                    returnKeyType="search"
                />
                {showFilter && (
                    <Pressable
                        onPress={onFilterPress}
                        className="rounded-full bg-secondary p-2 active:opacity-80"
                    >
                        <SlidersHorizontal size={16} color="#09090b" />
                    </Pressable>
                )}
            </View>
        </View>
    );
}
