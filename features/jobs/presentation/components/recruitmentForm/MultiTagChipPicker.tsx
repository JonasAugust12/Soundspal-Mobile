import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { raisedShadow } from '@/shared/presentation/ui/shadows';
import { PRIMARY_GRADIENT, RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';
import type { TagChipOption } from './TagChipPicker';

interface MultiTagChipPickerProps {
    options: readonly TagChipOption[];
    values: string[];
    onChange: (values: string[]) => void;
}

export function MultiTagChipPicker({ options, values, onChange }: MultiTagChipPickerProps) {
    const toggleValue = (value: string) => {
        if (values.includes(value)) {
            onChange(values.filter((item) => item !== value));
            return;
        }
        onChange([...values, value]);
    };

    return (
        <View style={styles.wrap}>
            {options.map((option) => {
                const isActive = values.includes(option.value);
                const Icon = option.Icon;

                return (
                    <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        onPress={() => toggleValue(option.value)}
                        style={({ pressed }) => [styles.chipOuter, pressed && styles.chipPressed]}
                    >
                        {isActive ? (
                            <LinearGradient
                                colors={[...PRIMARY_GRADIENT]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.chip}
                            >
                                {Icon ? <Icon size={16} color="#FFFFFF" /> : null}
                                <Text style={[styles.label, styles.labelActive]} numberOfLines={1}>
                                    {option.label}
                                </Text>
                            </LinearGradient>
                        ) : (
                            <View style={[styles.chip, styles.chipInactive]}>
                                {Icon ? (
                                    <Icon size={16} color={RECRUITMENT_FORM_COLORS.textSubtle} />
                                ) : null}
                                <Text
                                    style={[styles.label, styles.labelInactive]}
                                    numberOfLines={1}
                                >
                                    {option.label}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chipOuter: {
        borderRadius: 999,
        ...raisedShadow,
    },
    chipPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 999,
        minHeight: 42,
    },
    chipInactive: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
    },
    labelActive: {
        color: '#FFFFFF',
    },
    labelInactive: {
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
});
