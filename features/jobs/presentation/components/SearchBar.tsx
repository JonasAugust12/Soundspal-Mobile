import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { cardShadow } from '@/shared/presentation/ui/shadows';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = ({
    value,
    onChangeText,
    placeholder = 'Tìm kiếm công việc...',
}: SearchBarProps) => {
    return (
        <View className="w-full px-4">
            <View
                className="flex-row items-center gap-3 bg-white dark:bg-gray-800 px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700"
                style={styles.searchContainer}
            >
                <Search size={22} color="#7C3BED" />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-base text-gray-900 dark:text-white font-medium"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: cardShadow,
});
