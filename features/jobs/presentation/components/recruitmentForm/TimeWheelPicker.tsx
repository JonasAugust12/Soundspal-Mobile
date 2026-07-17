import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WheelColumn } from './WheelColumn';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface TimeWheelPickerProps {
    hour: number;
    minute: number;
    onChange: (hour: number, minute: number) => void;
}

const HOUR_ITEMS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTE_ITEMS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

export function TimeWheelPicker({ hour, minute, onChange }: TimeWheelPickerProps) {
    const hourIndex = useMemo(() => Math.max(0, Math.min(23, hour)), [hour]);
    const minuteIndex = useMemo(() => Math.max(0, Math.min(59, minute)), [minute]);

    return (
        <View style={styles.wrap}>
            <View style={styles.columns}>
                <WheelColumn
                    items={HOUR_ITEMS}
                    selectedIndex={hourIndex}
                    onValueChange={(index) => onChange(index, minuteIndex)}
                />
                <Text style={styles.separator}>:</Text>
                <WheelColumn
                    items={MINUTE_ITEMS}
                    selectedIndex={minuteIndex}
                    onValueChange={(index) => onChange(hourIndex, index)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingVertical: 4,
    },
    columns: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    separator: {
        fontSize: 24,
        fontWeight: '700',
        color: RECRUITMENT_FORM_COLORS.primary,
        marginHorizontal: 2,
    },
});
