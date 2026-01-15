import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import {
    X,
    MapPin,
    Music,
    Building2,
    Check,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSearchStore, UserRole } from '@/stores/searchStore';
import { useGetGenres } from '@/hooks/useSearchApi';
import { businessTypes } from '@/constants/businessTypes';

export interface FilterSheetProps {
    visible: boolean;
    onClose: () => void;
    currentRole?: UserRole;
}

export function FilterSheet({ visible, onClose, currentRole }: FilterSheetProps) {
    const { filters, toggleGenre, toggleBusinessType, setLocation, resetFilters, applyFilters } =
        useSearchStore();

    // Local state for filters before applying
    const [localLocation, setLocalLocation] = useState(filters.location || '');

    // Fetch genres
    const { data: genresData, isLoading: isLoadingGenres } = useGetGenres();
    const genres = genresData?.data?.genres || [];

    const handleApply = () => {
        applyFilters({
            location: localLocation || undefined,
        });
        onClose();
    };

    const handleReset = () => {
        resetFilters();
        setLocalLocation('');
    };

    const isVenue = currentRole === 'venue';
    const showGenres = currentRole === 'singer' || currentRole === 'producer' || !currentRole;

    const selectedGenresCount = filters.genres.length;
    const selectedBusinessTypesCount = filters.businessTypes.length;
    const hasActiveFilters =
        selectedGenresCount > 0 || selectedBusinessTypesCount > 0 || !!filters.location;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View
                    className="bg-white dark:bg-gray-900 rounded-t-3xl h-[90%]"
                    style={styles.sheet}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <View className="flex-row items-center gap-2">
                            <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                                <SlidersHorizontal size={20} color="#7C3AED" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    Bộ lọc
                                </Text>
                                {hasActiveFilters && (
                                    <Text className="text-xs text-purple-600 dark:text-purple-400">
                                        {selectedGenresCount + selectedBusinessTypesCount} đã chọn
                                    </Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
                        >
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        className="flex-1 px-5"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 24 }}
                    >
                        <View className="gap-6">
                            {/* Location Section */}
                            <View>
                                <View className="flex-row items-center gap-2 mb-3">
                                    <MapPin size={18} color="#7C3AED" />
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                                        Địa điểm
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    className="flex-row items-center px-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    onPress={() => {
                                        // TODO: Implement location picker
                                    }}
                                >
                                    <MapPin size={18} color="#9CA3AF" />
                                    <Text className="flex-1 ml-3 text-gray-500 dark:text-gray-400 text-base">
                                        {localLocation || 'Chọn địa điểm...'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Genres Section - For singer and producer */}
                            {showGenres && (
                                <View>
                                    <View className="flex-row items-center gap-2 mb-3">
                                        <Music size={18} color="#EC4899" />
                                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                                            Thể loại
                                        </Text>
                                        {selectedGenresCount > 0 && (
                                            <View className="bg-pink-100 dark:bg-pink-900/30 px-2 py-0.5 rounded-full">
                                                <Text className="text-xs font-semibold text-pink-600 dark:text-pink-400">
                                                    {selectedGenresCount}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {isLoadingGenres ? (
                                        <View className="py-8 items-center">
                                            <ActivityIndicator color="#7C3AED" />
                                        </View>
                                    ) : (
                                        <View className="flex-row flex-wrap gap-2">
                                            {genres.map((genre) => {
                                                const isSelected = filters.genres.includes(
                                                    genre.id,
                                                );
                                                return (
                                                    <TouchableOpacity
                                                        key={genre.id}
                                                        onPress={() => toggleGenre(genre.id)}
                                                        className={`flex-row items-center px-4 py-2.5 rounded-full border ${
                                                            isSelected
                                                                ? 'bg-purple-600 border-purple-600'
                                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <Check
                                                                size={14}
                                                                color="#FFFFFF"
                                                                style={{ marginRight: 6 }}
                                                            />
                                                        )}
                                                        <Text
                                                            className={`text-sm font-semibold ${
                                                                isSelected
                                                                    ? 'text-white'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {genre.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Business Types - For venue */}
                            {isVenue && (
                                <View>
                                    <View className="flex-row items-center gap-2 mb-3">
                                        <Building2 size={18} color="#F59E0B" />
                                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                                            Loại hình kinh doanh
                                        </Text>
                                        {selectedBusinessTypesCount > 0 && (
                                            <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                                <Text className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                    {selectedBusinessTypesCount}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-row flex-wrap gap-2">
                                        {businessTypes.map((type) => {
                                            const isSelected = filters.businessTypes.includes(
                                                type.value,
                                            );
                                            return (
                                                <TouchableOpacity
                                                    key={type.value}
                                                    onPress={() => toggleBusinessType(type.value)}
                                                    className={`flex-row items-center px-4 py-2.5 rounded-full border ${
                                                        isSelected
                                                            ? 'bg-amber-500 border-amber-500'
                                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <Check
                                                            size={14}
                                                            color="#FFFFFF"
                                                            style={{ marginRight: 6 }}
                                                        />
                                                    )}
                                                    <Text
                                                        className={`text-sm font-semibold ${
                                                            isSelected
                                                                ? 'text-white'
                                                                : 'text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {type.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View
                        style={styles.footer}
                        className="flex-row gap-3 px-5 py-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
                    >
                        <TouchableOpacity
                            onPress={handleReset}
                            className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                            <RotateCcw size={18} color="#6B7280" />
                            <Text className="text-base font-bold text-gray-700 dark:text-gray-300">
                                Đặt lại
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleApply}
                            className="flex-1 rounded-xl overflow-hidden"
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#7C3AED', '#9333EA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="flex-row items-center justify-center gap-2 py-4"
                            >
                                <Check size={18} color="#FFFFFF" strokeWidth={3} />
                                <Text className="text-base font-bold text-white">Áp dụng</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheet: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    footer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});
