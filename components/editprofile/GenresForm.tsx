import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Check, Music } from 'lucide-react-native';

import { useGetAllGenres, useGetUserGenres, useUpdateUserGenres } from '@/hooks/useUserApi';
import { useAuthStore } from '@/stores/authStore';
import { Genre } from '@/types/user.type';

interface GenresFormProps {
    onSaveSuccess?: () => void;
}

export function GenresForm({ onSaveSuccess }: GenresFormProps) {
    const { user } = useAuthStore();
    const username = user?.username || '';

    const { data: allGenresData, isLoading: isLoadingAll } = useGetAllGenres();
    const {
        data: userGenresData,
        isLoading: isLoadingUser,
        refetch,
    } = useGetUserGenres(username, {
        enabled: !!username,
    });
    const updateGenres = useUpdateUserGenres();

    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // Initialize selected genres from user data
    useEffect(() => {
        if (userGenresData?.genres) {
            setSelectedGenres(userGenresData.genres.map((g) => g.name));
        }
    }, [userGenresData]);

    const allGenres = allGenresData?.genres || [];
    const isLoading = isLoadingAll || isLoadingUser;

    const toggleGenre = (genreName: string) => {
        setSelectedGenres((prev) =>
            prev.includes(genreName) ? prev.filter((g) => g !== genreName) : [...prev, genreName],
        );
    };

    const handleSave = async () => {
        try {
            console.warn('Selected genres for update:', selectedGenres);
            await updateGenres.mutateAsync({
                username,
                genreNames: selectedGenres,
            });
            refetch();
            onSaveSuccess?.();
        } catch (error) {
            console.error('Failed to update genres:', error);
        }
    };

    if (isLoading) {
        return (
            <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    return (
        <View className="gap-6">
            {/* Header */}
            <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                    <Music size={20} color="#7C3AED" />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                        Thể loại âm nhạc
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        Chọn các thể loại bạn thường biểu diễn
                    </Text>
                </View>
            </View>

            {/* Genre chips */}
            <View className="flex-row flex-wrap gap-2">
                {allGenres.map((genre: Genre) => {
                    const isSelected = selectedGenres.includes(genre.name);
                    return (
                        <TouchableOpacity
                            key={genre.id}
                            onPress={() => toggleGenre(genre.name)}
                            className={`flex-row items-center px-4 py-2.5 rounded-full border ${
                                isSelected
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                            activeOpacity={0.7}
                        >
                            {isSelected && (
                                <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                            )}
                            <Text
                                className={`text-sm font-semibold ${
                                    isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {genre.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Selected count */}
            {selectedGenres.length > 0 && (
                <View className="flex-row items-center gap-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                    <View className="bg-purple-600 px-2 py-0.5 rounded-full">
                        <Text className="text-xs font-bold text-white">
                            {selectedGenres.length}
                        </Text>
                    </View>
                    <Text className="text-sm text-purple-700 dark:text-purple-300">
                        thể loại đã chọn
                    </Text>
                </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
                onPress={handleSave}
                disabled={updateGenres.isPending}
                className={`py-4 rounded-xl bg-purple-600 items-center ${
                    updateGenres.isPending ? 'opacity-50' : ''
                }`}
                activeOpacity={0.8}
            >
                <Text className="text-base font-bold text-white">
                    {updateGenres.isPending ? 'Đang lưu...' : 'Lưu thể loại'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
