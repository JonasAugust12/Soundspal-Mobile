import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WheelColumn } from './WheelColumn';

interface DateWheelPickerProps {
    value: Date;
    minimumDate?: Date;
    onChange: (date: Date) => void;
}

const MONTH_LABELS = [
    'Thg 1',
    'Thg 2',
    'Thg 3',
    'Thg 4',
    'Thg 5',
    'Thg 6',
    'Thg 7',
    'Thg 8',
    'Thg 9',
    'Thg 10',
    'Thg 11',
    'Thg 12',
];

function getDaysInMonth(year: number, monthIndex: number): number {
    return new Date(year, monthIndex + 1, 0).getDate();
}

function clampDate(year: number, monthIndex: number, day: number): Date {
    const maxDay = getDaysInMonth(year, monthIndex);
    const safeDay = Math.min(day, maxDay);
    return new Date(year, monthIndex, safeDay);
}

export function DateWheelPicker({
    value,
    minimumDate = new Date(),
    onChange,
}: DateWheelPickerProps) {
    const minYear = minimumDate.getFullYear();
    const maxYear = minYear + 5;

    const years = useMemo(
        () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => String(minYear + index)),
        [maxYear, minYear],
    );

    const yearIndex = Math.max(0, Math.min(years.length - 1, value.getFullYear() - minYear));
    const monthIndex = value.getMonth();
    const dayIndex = value.getDate() - 1;

    const year = minYear + yearIndex;
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const dayItems = useMemo(
        () => Array.from({ length: daysInMonth }, (_, index) => String(index + 1).padStart(2, '0')),
        [daysInMonth],
    );

    useEffect(() => {
        if (value.getDate() > daysInMonth) {
            onChange(clampDate(year, monthIndex, value.getDate()));
        }
    }, [daysInMonth, monthIndex, onChange, value, year]);

    const applyChange = (nextYear: number, nextMonth: number, nextDay: number) => {
        const nextDate = clampDate(nextYear, nextMonth, nextDay);
        if (nextDate < stripTime(minimumDate)) {
            onChange(stripTime(minimumDate));
            return;
        }
        onChange(nextDate);
    };

    return (
        <View style={styles.wrap}>
            <WheelColumn
                items={dayItems}
                selectedIndex={Math.min(dayIndex, dayItems.length - 1)}
                onValueChange={(index) => applyChange(year, monthIndex, index + 1)}
            />
            <WheelColumn
                items={MONTH_LABELS}
                selectedIndex={monthIndex}
                onValueChange={(index) => applyChange(year, index, value.getDate())}
            />
            <WheelColumn
                items={years}
                selectedIndex={yearIndex}
                onValueChange={(index) => applyChange(minYear + index, monthIndex, value.getDate())}
                width={88}
            />
        </View>
    );
}

function stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
    },
});
