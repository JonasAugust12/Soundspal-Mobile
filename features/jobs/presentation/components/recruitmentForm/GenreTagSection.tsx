import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { MultiTagChipPicker } from './MultiTagChipPicker';
import { AddItemRow } from './AddItemRow';
import { POPULAR_GENRE_OPTIONS } from './recruitmentFormConstants';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface GenreTagSectionProps {
    genres: string[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onAddCustom: () => void;
    onTogglePopular: (genres: string[]) => void;
    onRemove: (index: number) => void;
}

export function GenreTagSection({
    genres,
    inputValue,
    onInputChange,
    onAddCustom,
    onTogglePopular,
    onRemove,
}: GenreTagSectionProps) {
    const popularValues = genres.filter((genre) =>
        POPULAR_GENRE_OPTIONS.some((option) => option.value === genre),
    );

    const customGenres = genres
        .map((genre, index) => ({ genre, index }))
        .filter(({ genre }) => !POPULAR_GENRE_OPTIONS.some((option) => option.value === genre));

    return (
        <View style={styles.wrap}>
            <Text style={styles.subtitle}>Thể loại phổ biến</Text>
            <MultiTagChipPicker
                options={POPULAR_GENRE_OPTIONS}
                values={popularValues}
                onChange={(selectedPopular) => {
                    const customOnly = genres.filter(
                        (genre) => !POPULAR_GENRE_OPTIONS.some((option) => option.value === genre),
                    );
                    onTogglePopular([...customOnly, ...selectedPopular]);
                }}
            />

            <Text style={styles.subtitle}>Thêm thể loại khác</Text>
            <AddItemRow
                placeholder="Nhập thể loại nhạc..."
                value={inputValue}
                onChangeText={onInputChange}
                onAdd={onAddCustom}
            />

            {genres.length > 0 ? (
                <View style={styles.chipRow}>
                    {customGenres.map(({ genre, index }) => (
                        <View key={`${genre}-${index}`} style={styles.chip}>
                            <Text style={styles.chipText}>{genre}</Text>
                            <TouchableOpacity onPress={() => onRemove(index)}>
                                <X size={14} color={RECRUITMENT_FORM_COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: 12,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: RECRUITMENT_FORM_COLORS.primaryMuted,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.primaryDark,
    },
});
