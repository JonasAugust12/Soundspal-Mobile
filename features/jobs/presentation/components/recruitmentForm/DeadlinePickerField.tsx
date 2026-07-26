import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { FormPickerField } from './FormPickerField';
import { FormTextField } from './FormTextField';
import { PickerBottomSheet } from './PickerBottomSheet';
import { formatDeadlineDate, parseDeadlineDate } from './scheduleUtils';
import { PrettyDatePicker, isPrettyDatePickerSupported } from './prettyDatePicker';
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
    const pickerSupported = isPrettyDatePickerSupported();
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

    const closePicker = () => setVisible(false);

    const confirmDate = () => {
        onChange(formatDeadlineDate(draftDate));
        closePicker();
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
                {PrettyDatePicker ? (
                    <View style={styles.pickerWrapper}>
                        <PrettyDatePicker
                            date={draftDate}
                            mode="date"
                            minimumDate={minimumDate}
                            locale="vi"
                            theme="light"
                            dividerColor={RECRUITMENT_FORM_COLORS.primary}
                            onDateChange={setDraftDate}
                        />
                    </View>
                ) : null}
            </PickerBottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    pickerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
