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

type AndroidPickerOpenParams = {
    value: Date;
    mode?: 'date' | 'time';
    display?: 'default' | 'spinner' | 'clock' | 'calendar';
    is24Hour?: boolean;
    minimumDate?: Date;
    maximumDate?: Date;
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
};

type AndroidPickerApi = {
    open: (params: AndroidPickerOpenParams) => void;
    dismiss: (mode?: 'date' | 'time') => void;
};

let NativeDateTimePicker: ComponentType<NativeDateTimePickerProps> | null = null;
let DateTimePickerAndroid: AndroidPickerApi | null = null;

try {
    const dateTimePickerModule = require('@react-native-community/datetimepicker');
    const picker = dateTimePickerModule?.default;
    if (typeof picker === 'function') {
        NativeDateTimePicker = picker;
    }
    const androidApi = dateTimePickerModule?.DateTimePickerAndroid;
    if (androidApi && typeof androidApi.open === 'function') {
        DateTimePickerAndroid = androidApi;
    }
} catch {
    NativeDateTimePicker = null;
    DateTimePickerAndroid = null;
}

export function isNativeDateTimePickerSupported(): boolean {
    return NativeDateTimePicker != null;
}

export { NativeDateTimePicker, DateTimePickerAndroid };
export type { DateTimePickerEvent };
