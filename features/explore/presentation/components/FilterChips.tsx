import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetAllGenres } from '@/features/profiles/presentation/hooks/useUserApi';
import type { Genre } from '@/features/profiles/domain/entities/user.type';

interface FilterChipsProps {
    selectedGenre: string;
    onSelectGenre: (genreId: string) => void;
}

export function FilterChips({ selectedGenre, onSelectGenre }: FilterChipsProps) {
    const { data } = useGetAllGenres();
    const genresContent = data?.genres || [];

    const allGenres = [
        { id: '', name: 'Tất cả' },
        ...genresContent.map((g: Genre) => ({ id: g.name, name: g.name })),
    ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0, gap: 10, paddingBottom: 32 }}
            className="flex-row"
        >
            {allGenres.map((item) => {
                const isActive = selectedGenre === item.id;

                if (isActive) {
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.8}
                            onPress={() => onSelectGenre(item.id)}
                            style={[styles.shadowChip, { borderRadius: 9999 }]}
                        >
                            <LinearGradient
                                colors={['#7d3bed', '#f471b7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 9999 }}
                                className="px-5 py-2.5"
                            >
                                <Text className="text-white font-body font-bold text-sm tracking-wide">
                                    {item.name}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.6}
                        onPress={() => onSelectGenre(item.id)}
                        className="bg-gray-100 px-5 py-2.5 rounded-full border border-gray-200"
                    >
                        <Text className="text-gray-600 font-body font-medium text-sm tracking-wide">
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    shadowChip: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
