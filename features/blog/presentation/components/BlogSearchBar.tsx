import React from 'react';
import { View, TextInput, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';

interface BlogSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    /** Gọi khi người dùng nhấn phím Search/Done trên bàn phím (tìm theo submit). */
    onSubmitSearch?: () => void;
    isSearching?: boolean;
    placeholder?: string;
}

/**
 * Thanh tìm kiếm blog — dùng đúng kiểu thanh tìm kiếm ở trang Khám phá (nền xám nhạt,
 * bo góc 2xl, icon kính lúp xám), CHỈ bỏ nút lọc ở cuối. Tìm theo submit (nhấn phím
 * "search"); khi đang tìm hiện spinner nhỏ ở cuối thay cho nút lọc.
 */
export function BlogSearchBar({
    value,
    onChangeText,
    onSubmitSearch,
    isSearching,
    placeholder = 'Tìm bài viết, chủ đề, thẻ...',
}: BlogSearchBarProps) {
    return (
        <View className="px-4 pt-1 pb-3">
            <View className="min-h-[52px] flex-row items-center rounded-2xl bg-gray-100 px-4">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 px-3 py-3 text-base text-gray-900"
                    returnKeyType="search"
                    underlineColorAndroid="transparent"
                    onSubmitEditing={() => {
                        if (value.trim().length > 0) onSubmitSearch?.();
                    }}
                />
                {isSearching ? <ActivityIndicator size="small" color="#7C3AED" /> : null}
            </View>
        </View>
    );
}
