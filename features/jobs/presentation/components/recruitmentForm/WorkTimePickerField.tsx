import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, StyleSheet, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FormPickerField } from './FormPickerField';
import { FormTextField } from './FormTextField';
import { TagChipPicker } from './TagChipPicker';
import { PickerBottomSheet } from './PickerBottomSheet';
import { TimeWheelPicker } from './TimeWheelPicker';
import {
    DEFAULT_WORK_TIME_DRAFT,
    WORK_PERIOD_OPTIONS,
    WEEKDAY_OPTIONS,
    type WorkTimeDraft,
    formatTimeParts,
    formatWorkTimeString,
    parseWorkTimeString,
} from './scheduleUtils';
import {
    NativeDateTimePicker,
    isNativeDateTimePickerSupported,
    type DateTimePickerEvent,
} from './nativeDateTimePicker';
import { PRIMARY_GRADIENT, RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface WorkTimePickerFieldProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    hideLabel?: boolean;
}

type ActiveTimeField = 'start' | 'end';

export function WorkTimePickerField({
    label = 'Thời gian làm việc',
    value,
    onChange,
    hideLabel = false,
}: WorkTimePickerFieldProps) {
    const pickerSupported = isNativeDateTimePickerSupported();
    const [visible, setVisible] = useState(false);
    const [draft, setDraft] = useState<WorkTimeDraft>(DEFAULT_WORK_TIME_DRAFT);
    const [activeTimeField, setActiveTimeField] = useState<ActiveTimeField>('start');
    const [iosPickerDate, setIosPickerDate] = useState(new Date());

    const openSheet = () => {
        const parsed = parseWorkTimeString(value);
        const nextDraft = parsed.days.length > 0 ? parsed : DEFAULT_WORK_TIME_DRAFT;
        setDraft(nextDraft);
        setActiveTimeField('start');
        setVisible(true);
    };

    const closeSheet = () => {
        setVisible(false);
    };

    const toggleDay = (day: string) => {
        setDraft((current) => {
            const exists = current.days.includes(day);
            const days = exists
                ? current.days.filter((item) => item !== day)
                : [...current.days, day];

            return { ...current, days };
        });
    };

    const confirmSheet = () => {
        if (draft.days.length === 0) {
            return;
        }

        onChange(formatWorkTimeString(draft));
        closeSheet();
    };

    const updateActiveTime = (hour: number, minute: number) => {
        setDraft((current) => ({
            ...current,
            ...(activeTimeField === 'start'
                ? { startHour: hour, startMinute: minute }
                : { endHour: hour, endMinute: minute }),
        }));
    };

    const handleIosTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'dismissed' || !selectedDate) {
            return;
        }

        updateActiveTime(selectedDate.getHours(), selectedDate.getMinutes());
        setIosPickerDate(selectedDate);
    };

    const activeHour = activeTimeField === 'start' ? draft.startHour : draft.endHour;
    const activeMinute = activeTimeField === 'start' ? draft.startMinute : draft.endMinute;
    const canConfirm = draft.days.length > 0;

    const useNativeSpinner = Platform.OS === 'ios';
    const IosDateTimePicker = NativeDateTimePicker;

    useEffect(() => {
        if (!visible || !useNativeSpinner) {
            return;
        }

        const date = new Date();
        date.setHours(
            activeTimeField === 'start' ? draft.startHour : draft.endHour,
            activeTimeField === 'start' ? draft.startMinute : draft.endMinute,
            0,
            0,
        );
        setIosPickerDate(date);
    }, [
        activeTimeField,
        draft.endHour,
        draft.endMinute,
        draft.startHour,
        draft.startMinute,
        useNativeSpinner,
        visible,
    ]);

    if (!pickerSupported) {
        return (
            <FormTextField
                label={label}
                placeholder="Ví dụ: Tối T6, T7, CN (19:30 - 21:30)"
                value={value ?? ''}
                onChangeText={onChange}
            />
        );
    }

    return (
        <>
            <FormPickerField
                label={hideLabel ? undefined : label}
                value={value}
                placeholder="Chọn ngày và khung giờ làm việc"
                onPress={openSheet}
                icon={Clock}
            />

            <PickerBottomSheet
                visible={visible}
                title="Thời gian làm việc"
                onClose={closeSheet}
                onConfirm={confirmSheet}
                confirmDisabled={!canConfirm}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sheetContent}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ngày trong tuần</Text>
                        <View style={styles.dayRow}>
                            {WEEKDAY_OPTIONS.map((day) => {
                                const isSelected = draft.days.includes(day.value);
                                return (
                                    <Pressable
                                        key={day.value}
                                        onPress={() => toggleDay(day.value)}
                                        style={({ pressed }) => [
                                            styles.dayChipOuter,
                                            pressed && styles.dayChipPressed,
                                        ]}
                                    >
                                        {isSelected ? (
                                            <LinearGradient
                                                colors={[...PRIMARY_GRADIENT]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.dayChip}
                                            >
                                                <Text style={styles.dayChipTextActive}>
                                                    {day.label}
                                                </Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={[styles.dayChip, styles.dayChipInactive]}>
                                                <Text style={styles.dayChipTextInactive}>
                                                    {day.label}
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Buổi</Text>
                        <TagChipPicker
                            options={WORK_PERIOD_OPTIONS}
                            value={draft.period ?? 'Tối'}
                            onChange={(period) => setDraft((current) => ({ ...current, period }))}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Khung giờ</Text>
                        <View style={styles.timeTabRow}>
                            {(['start', 'end'] as const).map((field) => {
                                const isActive = activeTimeField === field;
                                const timeLabel =
                                    field === 'start'
                                        ? formatTimeParts(draft.startHour, draft.startMinute)
                                        : formatTimeParts(draft.endHour, draft.endMinute);

                                return (
                                    <Pressable
                                        key={field}
                                        onPress={() => setActiveTimeField(field)}
                                        style={styles.timeTabOuter}
                                    >
                                        {isActive ? (
                                            <LinearGradient
                                                colors={[...PRIMARY_GRADIENT]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.timeTab}
                                            >
                                                <Text style={styles.timeTabLabelActive}>
                                                    {field === 'start' ? 'Bắt đầu' : 'Kết thúc'}
                                                </Text>
                                                <Text style={styles.timeTabValueActive}>
                                                    {timeLabel}
                                                </Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={[styles.timeTab, styles.timeTabInactive]}>
                                                <Text style={styles.timeTabLabel}>
                                                    {field === 'start' ? 'Bắt đầu' : 'Kết thúc'}
                                                </Text>
                                                <Text style={styles.timeTabValue}>{timeLabel}</Text>
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>

                        {useNativeSpinner && IosDateTimePicker ? (
                            <IosDateTimePicker
                                value={iosPickerDate}
                                mode="time"
                                display="spinner"
                                is24Hour
                                onChange={handleIosTimeChange}
                                locale="vi-VN"
                                accentColor={RECRUITMENT_FORM_COLORS.primary}
                                textColor={RECRUITMENT_FORM_COLORS.text}
                                themeVariant="light"
                                style={styles.nativePicker}
                            />
                        ) : (
                            <TimeWheelPicker
                                hour={activeHour}
                                minute={activeMinute}
                                onChange={updateActiveTime}
                            />
                        )}
                    </View>

                    <View style={styles.previewBox}>
                        <Text style={styles.previewLabel}>Xem trước</Text>
                        <Text style={styles.previewValue}>
                            {canConfirm
                                ? formatWorkTimeString(draft)
                                : 'Vui lòng chọn ít nhất một ngày'}
                        </Text>
                    </View>
                </ScrollView>
            </PickerBottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    sheetContent: {
        gap: 18,
        paddingBottom: 4,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    dayRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayChipOuter: {
        borderRadius: 999,
    },
    dayChipPressed: {
        opacity: 0.9,
    },
    dayChip: {
        minWidth: 44,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    dayChipInactive: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
    },
    dayChipTextActive: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    dayChipTextInactive: {
        color: RECRUITMENT_FORM_COLORS.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    timeTabRow: {
        flexDirection: 'row',
        gap: 10,
    },
    timeTabOuter: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    timeTab: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 4,
        alignItems: 'center',
    },
    timeTabInactive: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
    },
    timeTabLabel: {
        fontSize: 12,
        color: RECRUITMENT_FORM_COLORS.textSubtle,
        fontWeight: '600',
    },
    timeTabLabelActive: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    timeTabValue: {
        fontSize: 18,
        fontWeight: '700',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    timeTabValueActive: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    nativePicker: {
        alignSelf: 'center',
        width: '100%',
    },
    previewBox: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: RECRUITMENT_FORM_COLORS.border,
        borderRadius: 12,
        padding: 14,
        gap: 6,
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.textSubtle,
    },
    previewValue: {
        fontSize: 14,
        lineHeight: 20,
        color: RECRUITMENT_FORM_COLORS.text,
    },
});
