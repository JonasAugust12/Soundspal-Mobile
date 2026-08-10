import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { CalendarDays, FileUp, Handshake, X } from 'lucide-react-native';
import { useCreateCollabRequest } from '@/features/collabRequests/presentation/hooks/useCollabRequestApi';
import {
    resolveCreateCollabError,
    toApiDate,
} from '@/features/collabRequests/domain/utils/collabRequestHelpers';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { colors } from '@/shared/domain/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    visible: boolean;
    onClose: () => void;
    receiverId: string;
    receiverName: string;
}

function toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function toHm(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function CreateCollabRequestModal({ visible, onClose, receiverId, receiverName }: Props) {
    const { showSuccess, showError } = useToast();
    const createMutation = useCreateCollabRequest();
    const insets = useSafeAreaInsets();
    // Sync lock: isPending flips async — without this, double-tap can fire two POSTs (2nd → 409).
    const submitLockRef = useRef(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [file, setFile] = useState<{
        uri: string;
        name: string;
        mimeType: string;
    } | null>(null);

    const [picker, setPicker] = useState<null | 'startDate' | 'endDate' | 'startTime' | 'endTime'>(
        null,
    );

    const reset = () => {
        setTitle('');
        setDescription('');
        setStartDate(null);
        setEndDate(null);
        setStartTime(null);
        setEndTime(null);
        setIsPublic(false);
        setFile(null);
        setPicker(null);
    };

    const handleClose = () => {
        submitLockRef.current = false;
        reset();
        onClose();
    };

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            multiple: false,
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        setFile({
            uri: asset.uri,
            name: asset.name || 'attachment',
            mimeType: asset.mimeType || 'application/octet-stream',
        });
    };

    const canSubmit = useMemo(
        () =>
            Boolean(title.trim() && description.trim() && startDate && endDate) &&
            !createMutation.isPending,
        [title, description, startDate, endDate, createMutation.isPending],
    );

    const handleSubmit = () => {
        if (submitLockRef.current || createMutation.isPending) return;
        if (!receiverId.trim()) {
            showError('Lỗi', 'Thiếu thông tin người nhận.');
            return;
        }
        if (!title.trim() || !description.trim() || !startDate || !endDate) {
            showError('Thiếu thông tin', 'Vui lòng điền tiêu đề, mô tả và ngày.');
            return;
        }
        const startIso = toIsoDate(startDate);
        const endIso = toIsoDate(endDate);
        if (endIso < startIso) {
            showError('Ngày không hợp lệ', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
            return;
        }

        submitLockRef.current = true;
        createMutation.mutate(
            {
                payload: {
                    receiver_id: receiverId,
                    title: title.trim(),
                    description: description.trim(),
                    start_date: toApiDate(startIso),
                    end_date: toApiDate(endIso),
                    start_time: startTime ? toHm(startTime) : null,
                    end_time: endTime ? toHm(endTime) : null,
                    is_public: isPublic,
                },
                file,
            },
            {
                onSuccess: () => {
                    showSuccess('Thành công', 'Đã gửi đề nghị hợp tác.');
                    handleClose();
                },
                onError: (err: unknown) => {
                    const { title, message } = resolveCreateCollabError(err);
                    showError(title, message);
                },
                onSettled: () => {
                    submitLockRef.current = false;
                },
            },
        );
    };

    const onPickerChange = (_: unknown, date?: Date) => {
        if (Platform.OS === 'android') setPicker(null);
        if (!date || !picker) return;
        if (picker === 'startDate') setStartDate(date);
        if (picker === 'endDate') setEndDate(date);
        if (picker === 'startTime') setStartTime(date);
        if (picker === 'endTime') setEndTime(date);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <Pressable className="flex-1 bg-black/50 justify-end" onPress={handleClose}>
                <Pressable
                    className="bg-white rounded-t-3xl h-[92%] overflow-hidden"
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="items-center pt-3">
                        <View className="w-10 h-1 rounded-full bg-gray-300" />
                    </View>

                    <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2 flex-1">
                            <LinearGradient
                                colors={['#7C3BED', '#F471B7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-10 h-10 rounded-2xl items-center justify-center"
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Handshake size={20} color="#fff" />
                            </LinearGradient>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900">
                                    Gửi đề nghị hợp tác
                                </Text>
                                <Text className="text-sm text-gray-500" numberOfLines={1}>
                                    Tới {receiverName}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} className="p-1">
                            <X size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="flex-1 px-5"
                        contentContainerStyle={{ paddingBottom: 24, gap: 14 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Field label="Tiêu đề">
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="VD: Thu âm EP, Live show..."
                                placeholderTextColor="#9CA3AF"
                                className="border border-gray-200 rounded-xl px-3 py-3 text-gray-900 bg-gray-50"
                            />
                        </Field>

                        <Field label="Mô tả">
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Mô tả ngắn về dự án và mong muốn hợp tác"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                                className="border border-gray-200 rounded-xl px-3 py-3 text-gray-900 bg-gray-50 min-h-[100px]"
                            />
                        </Field>

                        <Text className="text-sm font-bold text-gray-800">Lịch hợp tác</Text>
                        <View className="flex-row gap-2">
                            <DateChip
                                label="Bắt đầu"
                                value={
                                    startDate
                                        ? toIsoDate(startDate).split('-').reverse().join('/')
                                        : 'Chọn ngày'
                                }
                                onPress={() => setPicker('startDate')}
                            />
                            <DateChip
                                label="Kết thúc"
                                value={
                                    endDate
                                        ? toIsoDate(endDate).split('-').reverse().join('/')
                                        : 'Chọn ngày'
                                }
                                onPress={() => setPicker('endDate')}
                            />
                        </View>
                        <View className="flex-row gap-2">
                            <DateChip
                                label="Giờ bắt đầu"
                                value={startTime ? toHm(startTime) : 'Tuỳ chọn'}
                                onPress={() => setPicker('startTime')}
                            />
                            <DateChip
                                label="Giờ kết thúc"
                                value={endTime ? toHm(endTime) : 'Tuỳ chọn'}
                                onPress={() => setPicker('endTime')}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => void pickFile()}
                            className="flex-row items-center gap-3 border border-dashed border-primary/40 rounded-xl px-3 py-3 bg-primary/5"
                        >
                            <FileUp size={18} color={colors.primary01} />
                            <Text className="flex-1 text-sm text-gray-700" numberOfLines={1}>
                                {file?.name || 'Chọn file đính kèm (tuỳ chọn, tối đa 10MB)'}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-3">
                            <View className="flex-1 pr-3">
                                <Text className="text-sm font-semibold text-gray-900">
                                    Công khai trên hồ sơ
                                </Text>
                                <Text className="text-xs text-gray-500 mt-0.5">
                                    Hiện trong mục Đã hợp tác với khi được chấp nhận
                                </Text>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={setIsPublic}
                                trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                                thumbColor={isPublic ? colors.primary01 : '#F3F4F6'}
                            />
                        </View>
                    </ScrollView>

                    {/* Edge-to-edge: tự chừa chỗ cho thanh điều hướng, không thì nút bị đè. */}
                    <View
                        className="px-5 pt-2 border-t border-gray-100 flex-row gap-3"
                        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                    >
                        <TouchableOpacity
                            onPress={handleClose}
                            className="flex-1 py-3.5 rounded-full border border-gray-200 items-center"
                        >
                            <Text className="font-semibold text-gray-700">Huỷ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            disabled={!canSubmit}
                            onPress={handleSubmit}
                            className={`flex-1 py-3.5 rounded-full items-center ${
                                canSubmit ? 'bg-primary' : 'bg-primary/40'
                            }`}
                        >
                            {createMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="font-semibold text-white">Gửi đề nghị</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {picker ? (
                        <DateTimePicker
                            value={
                                picker === 'startDate'
                                    ? startDate || new Date()
                                    : picker === 'endDate'
                                      ? endDate || new Date()
                                      : picker === 'startTime'
                                        ? startTime || new Date()
                                        : endTime || new Date()
                            }
                            mode={picker.endsWith('Time') ? 'time' : 'date'}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onPickerChange}
                        />
                    ) : null}
                    {Platform.OS === 'ios' && picker ? (
                        <TouchableOpacity
                            onPress={() => setPicker(null)}
                            className="mx-5 mb-4 py-3 rounded-full bg-primary items-center"
                        >
                            <Text className="text-white font-semibold">Xong</Text>
                        </TouchableOpacity>
                    ) : null}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View className="gap-1.5">
            <Text className="text-sm font-semibold text-gray-800">{label}</Text>
            {children}
        </View>
    );
}

function DateChip({
    label,
    value,
    onPress,
}: {
    label: string;
    value: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5"
        >
            <Text className="text-[11px] font-medium text-gray-500 mb-0.5">{label}</Text>
            <View className="flex-row items-center gap-1.5">
                <CalendarDays size={14} color={colors.primary01} />
                <Text className="text-sm font-semibold text-gray-800">{value}</Text>
            </View>
        </TouchableOpacity>
    );
}
