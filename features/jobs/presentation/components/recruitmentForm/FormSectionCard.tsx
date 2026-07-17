import React from 'react';
import { View, Text, StyleSheet, type ViewProps } from 'react-native';
import { cardShadow } from '@/shared/presentation/ui/shadows';
import { RECRUITMENT_FORM_COLORS, RECRUITMENT_FORM_SPACING } from './recruitmentFormTheme';

interface FormSectionCardProps extends ViewProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    headerRight?: React.ReactNode;
}

export function FormSectionCard({
    title,
    subtitle,
    children,
    headerRight,
    style,
    ...rest
}: FormSectionCardProps) {
    return (
        <View style={[styles.card, style]} {...rest}>
            {(title || headerRight) && (
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        {title ? <Text style={styles.title}>{title}</Text> : null}
                        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                    </View>
                    {headerRight}
                </View>
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
        padding: RECRUITMENT_FORM_SPACING.section,
        gap: RECRUITMENT_FORM_SPACING.field,
        ...cardShadow,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    headerText: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    subtitle: {
        fontSize: 12,
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
});
