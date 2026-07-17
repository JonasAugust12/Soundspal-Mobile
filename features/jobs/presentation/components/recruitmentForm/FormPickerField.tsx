import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronDown } from 'lucide-react-native';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface FormPickerFieldProps {
    label?: string;
    value?: string;
    placeholder: string;
    onPress: () => void;
    icon: LucideIcon;
}

export function FormPickerField({
    label,
    value,
    placeholder,
    onPress,
    icon: Icon,
}: FormPickerFieldProps) {
    const hasValue = Boolean(value?.trim());

    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <Pressable
                accessibilityRole="button"
                onPress={onPress}
                style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
            >
                <View style={styles.fieldRow}>
                    <View style={styles.iconSlot}>
                        <Icon size={18} color={RECRUITMENT_FORM_COLORS.textSubtle} />
                    </View>
                    <Text
                        style={[styles.value, !hasValue && styles.placeholder]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {hasValue ? value : placeholder}
                    </Text>
                    <View style={styles.iconSlot}>
                        <ChevronDown size={18} color={RECRUITMENT_FORM_COLORS.textSubtle} />
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    field: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        minHeight: 50,
        justifyContent: 'center',
    },
    fieldPressed: {
        opacity: 0.92,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    iconSlot: {
        flexShrink: 0,
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    value: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        fontSize: 15,
        color: RECRUITMENT_FORM_COLORS.text,
        lineHeight: 20,
    },
    placeholder: {
        color: RECRUITMENT_FORM_COLORS.textSubtle,
    },
});
