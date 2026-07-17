import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { FormPickerField } from './FormPickerField';
import { FormTextField } from './FormTextField';
import { PickerBottomSheet } from './PickerBottomSheet';
import { DateWheelPicker } from './DateWheelPicker';
import { formatDeadlineDate, parseDeadlineDate } from './scheduleUtils';
import {
    NativeDateTimePicker,
    isNativeDateTimePickerSupported,
    type DateTimePickerEvent,
} from './nativeDateTimePicker';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface DeadlinePickerFieldProps {
    label?: string;
    value?: string;
    onChange: (value: string | undefined) => void;
    minimumDate?: Date;
    hideLabel?: boolean;
}

export function DeadlinePickerField({
    label = 'Hạn nộp',
    value,
    onChange,
    minimumDate = new Date(),
    hideLabel = false,
}: DeadlinePickerFieldProps) {
    const [visible, setVisible] = useState(false);
    const pickerSupported = isNativeDateTimePickerSupported();
    const initialDate = useMemo(
        () => parseDeadlineDate(value) ?? new Date(minimumDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        [minimumDate, value],
    );
    const [draftDate, setDraftDate] = useState(initialDate);

    const openPicker = () => {
        if (!pickerSupported) {
            return;
        }
        setDraftDate(parseDeadlineDate(value) ?? initialDate);
        setVisible(true);
    };

    const closePicker = () => {
        setVisible(false);
    };

    const confirmDate = () => {
        onChange(formatDeadlineDate(draftDate));
        closePicker();
    };

    const handleIosChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'dismissed' || !selectedDate) {
            return;
        }
        setDraftDate(selectedDate);
    };

    if (!pickerSupported) {
        return (
            <FormTextField
                label={`${label} (dd-MM-yyyy)`}
                placeholder="Ví dụ: 01-12-2026"
                value={value ?? ''}
                onChangeText={(text) => onChange(text.trim() || undefined)}
            />
        );
    }

    const useNativeSpinner = Platform.OS === 'ios';
    const IosDateTimePicker = NativeDateTimePicker;

    return (
        <>
            <FormPickerField
                label={hideLabel ? undefined : `${label} (dd-MM-yyyy)`}
                value={value}
                placeholder="Chọn ngày hết hạn nộp hồ sơ"
                onPress={openPicker}
                icon={Calendar}
            />

            <PickerBottomSheet
                visible={visible}
                title="Chọn hạn nộp"
                onClose={closePicker}
                onConfirm={confirmDate}
            >
                {useNativeSpinner && IosDateTimePicker ? (
                    <IosDateTimePicker
                        value={draftDate}
                        mode="date"
                        display="spinner"
                        minimumDate={minimumDate}
                        onChange={handleIosChange}
                        locale="vi-VN"
                        accentColor={RECRUITMENT_FORM_COLORS.primary}
                        textColor={RECRUITMENT_FORM_COLORS.text}
                        themeVariant="light"
                        style={styles.nativePicker}
                    />
                ) : (
                    <DateWheelPicker
                        value={draftDate}
                        minimumDate={minimumDate}
                        onChange={setDraftDate}
                    />
                )}
            </PickerBottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    nativePicker: {
        alignSelf: 'center',
        width: '100%',
    },
});
