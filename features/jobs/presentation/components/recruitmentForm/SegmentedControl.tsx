import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_GRADIENT, RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';
import type { SegmentedOption } from './recruitmentFormConstants';

interface SegmentedControlProps {
    options: readonly SegmentedOption[];
    value: string;
    onChange: (value: string) => void;
    columns?: 2 | 3 | 4;
}

function SegmentItem({
    option,
    isActive,
    onPress,
}: {
    option: SegmentedOption;
    isActive: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={onPress}
            style={({ pressed }) => [
                styles.segment,
                !isActive && styles.segmentInactive,
                pressed && styles.segmentPressed,
            ]}
        >
            {isActive ? (
                <LinearGradient
                    colors={[...PRIMARY_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                />
            ) : null}
            <Text
                style={[
                    styles.segmentText,
                    isActive ? styles.segmentTextActive : styles.segmentTextInactive,
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
            >
                {option.label}
            </Text>
        </Pressable>
    );
}

export function SegmentedControl({ options, value, onChange, columns = 3 }: SegmentedControlProps) {
    const rows: SegmentedOption[][] = [];
    for (let i = 0; i < options.length; i += columns) {
        rows.push(options.slice(i, i + columns) as SegmentedOption[]);
    }

    return (
        <View style={styles.wrapper}>
            {rows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                    {row.map((option, index) => (
                        <React.Fragment key={option.value}>
                            {index > 0 ? <View style={styles.divider} /> : null}
                            <View style={styles.segmentSlot}>
                                <SegmentItem
                                    option={option}
                                    isActive={value === option.value}
                                    onPress={() => onChange(option.value)}
                                />
                            </View>
                        </React.Fragment>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 10,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
    },
    segmentSlot: {
        flex: 1,
        minWidth: 0,
    },
    divider: {
        width: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: RECRUITMENT_FORM_COLORS.border,
    },
    segment: {
        flex: 1,
        minHeight: 46,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        paddingVertical: 10,
        overflow: 'hidden',
    },
    segmentInactive: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
    },
    segmentPressed: {
        opacity: 0.92,
    },
    segmentText: {
        width: '100%',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
        zIndex: 1,
        paddingHorizontal: 2,
    },
    segmentTextActive: {
        color: '#FFFFFF',
    },
    segmentTextInactive: {
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
});
