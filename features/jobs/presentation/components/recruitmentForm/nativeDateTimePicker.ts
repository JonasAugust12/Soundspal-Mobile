import type { ComponentType } from 'react';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type NativeDateTimePickerProps = {
    value: Date;
    mode?: 'date' | 'time' | 'datetime' | 'countdown';
    display?: 'default' | 'spinner' | 'clock' | 'calendar' | 'compact' | 'inline';
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    is24Hour?: boolean;
    locale?: string;
    accentColor?: string;
    textColor?: string;
    themeVariant?: 'light' | 'dark';
    style?: object;
};

let NativeDateTimePicker: ComponentType<NativeDateTimePickerProps> | null = null;

try {
    const dateTimePickerModule = require('@react-native-community/datetimepicker');
    const picker = dateTimePickerModule?.default;
    if (typeof picker === 'function') {
        NativeDateTimePicker = picker;
    }
} catch {
    NativeDateTimePicker = null;
}

export function isNativeDateTimePickerSupported(): boolean {
    return NativeDateTimePicker != null;
}

export { NativeDateTimePicker };
export type { DateTimePickerEvent };
