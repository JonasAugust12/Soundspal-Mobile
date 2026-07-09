import React, { useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet } from 'react-native';
import { GradientFocusOutline } from './GradientFocusOutline';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

const MILLION = 1_000_000;

interface BudgetSectionProps {
    isFixed: boolean;
    onToggleFixed: (isFixed: boolean) => void;
    budgetMin?: number;
    budgetMax?: number;
    onBudgetMinChange: (value: number | undefined) => void;
    onBudgetMaxChange: (value: number | undefined) => void;
}

function toMillionDisplay(value?: number): string {
    if (value === undefined || value === null) {
        return '';
    }
    const millions = value / MILLION;
    return Number.isInteger(millions) ? String(millions) : String(millions);
}

function parseMillionInput(text: string): number | undefined {
    const trimmed = text.trim();
    if (!trimmed) {
        return undefined;
    }
    const parsed = Number(trimmed.replace(',', '.'));
    if (Number.isNaN(parsed)) {
        return undefined;
    }
    return Math.round(parsed * MILLION);
}

export function BudgetSection({
    isFixed,
    onToggleFixed,
    budgetMin,
    budgetMax,
    onBudgetMinChange,
    onBudgetMaxChange,
}: BudgetSectionProps) {
    const [focusedField, setFocusedField] = useState<'min' | 'max' | null>(null);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Ngân sách</Text>
                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Cố định</Text>
                    <Switch
                        value={isFixed}
                        onValueChange={onToggleFixed}
                        trackColor={{
                            false: RECRUITMENT_FORM_COLORS.border,
                            true: RECRUITMENT_FORM_COLORS.primaryLight,
                        }}
                        thumbColor={isFixed ? RECRUITMENT_FORM_COLORS.primaryAccent : '#FFFFFF'}
                        ios_backgroundColor={RECRUITMENT_FORM_COLORS.border}
                    />
                </View>
            </View>

            {isFixed ? (
                <View style={styles.rangeRow}>
                    <GradientFocusOutline
                        focused={focusedField === 'min'}
                        style={styles.rangeInputShell}
                    >
                        <View style={styles.rangeInputWrap}>
                            <TextInput
                                value={toMillionDisplay(budgetMin)}
                                onChangeText={(text) => onBudgetMinChange(parseMillionInput(text))}
                                placeholder="Min"
                                placeholderTextColor={RECRUITMENT_FORM_COLORS.textSubtle}
                                keyboardType="decimal-pad"
                                style={styles.rangeInput}
                                onFocus={() => setFocusedField('min')}
                                onBlur={() => setFocusedField(null)}
                                onEndEditing={() => setFocusedField(null)}
                            />
                            <Text style={styles.suffix}>triệu VND</Text>
                        </View>
                    </GradientFocusOutline>

                    <Text style={styles.dash}>–</Text>

                    <GradientFocusOutline
                        focused={focusedField === 'max'}
                        style={styles.rangeInputShell}
                    >
                        <View style={styles.rangeInputWrap}>
                            <TextInput
                                value={toMillionDisplay(budgetMax)}
                                onChangeText={(text) => onBudgetMaxChange(parseMillionInput(text))}
                                placeholder="Max"
                                placeholderTextColor={RECRUITMENT_FORM_COLORS.textSubtle}
                                keyboardType="decimal-pad"
                                style={styles.rangeInput}
                                onFocus={() => setFocusedField('max')}
                                onBlur={() => setFocusedField(null)}
                                onEndEditing={() => setFocusedField(null)}
                            />
                            <Text style={styles.suffix}>triệu VND</Text>
                        </View>
                    </GradientFocusOutline>
                </View>
            ) : (
                <Text style={styles.negotiableHint}>
                    Mức ngân sách sẽ được thỏa thuận trực tiếp với ứng viên.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toggleLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
    rangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rangeInputShell: {
        flex: 1,
        minWidth: 0,
    },
    rangeInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        minHeight: 50,
    },
    rangeInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.text,
        paddingVertical: 12,
        minWidth: 32,
    },
    suffix: {
        fontSize: 11,
        fontWeight: '500',
        color: RECRUITMENT_FORM_COLORS.textSubtle,
        marginLeft: 4,
    },
    dash: {
        fontSize: 16,
        fontWeight: '500',
        color: RECRUITMENT_FORM_COLORS.textSubtle,
    },
    negotiableHint: {
        fontSize: 13,
        lineHeight: 20,
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
});
