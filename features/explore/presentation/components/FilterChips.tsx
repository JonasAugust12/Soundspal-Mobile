import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetAllGenres } from '@/features/profiles/presentation/hooks/useUserApi';
import type { Genre } from '@/features/profiles/domain/entities/user.type';

interface FilterChipsProps {
    /** Danh sách thể loại đang chọn (rỗng = "Tất cả"). */
    selectedGenres: string[];
    /** Bật/tắt một thể loại. */
    onToggleGenre: (genreName: string) => void;
    /** Bỏ chọn tất cả (nhấn chip "Tất cả"). */
    onClear: () => void;
}

export function FilterChips({ selectedGenres, onToggleGenre, onClear }: FilterChipsProps) {
    const { data } = useGetAllGenres();
    const genresContent = data?.genres || [];

    const isSelected = (name: string) =>
        selectedGenres.some((g) => g.toLowerCase() === name.toLowerCase());

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0, gap: 10, paddingBottom: 32 }}
            className="flex-row"
        >
            {/* Chip "Tất cả" — active khi chưa chọn thể loại nào. */}
            <Chip label="Tất cả" active={selectedGenres.length === 0} onPress={onClear} />

            {genresContent.map((g: Genre) => (
                <Chip
                    key={g.id}
                    label={g.name}
                    active={isSelected(g.name)}
                    onPress={() => onToggleGenre(g.name)}
                />
            ))}
        </ScrollView>
    );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    if (active) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
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
                        {label}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPress}
            className="bg-gray-100 px-5 py-2.5 rounded-full border border-gray-200"
        >
            <Text className="text-gray-600 font-body font-medium text-sm tracking-wide">
                {label}
            </Text>
        </TouchableOpacity>
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
