import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Briefcase, Check, Calendar, Pencil, Trash2, Plus, X, Save } from 'lucide-react-native';

import {
    useGetUserExperiences,
    useCreateExperience,
    useUpdateExperience,
    useUpdateExperienceGenres,
    useDeleteExperience,
    useGetAllGenres,
} from '@/features/profiles/presentation/hooks/useUserApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { GradientPill, AppDialog } from '@/shared/presentation/ui';
import type { Experience, Genre } from '@/features/profiles/domain/entities/user.type';

interface ExperienceFormProps {
    onSaveSuccess?: () => void;
}

interface FormState {
    id?: string;
    title: string;
    description: string;
    start_date: string; // ISO YYYY-MM-DD hoặc ''
    end_date: string;
    portfolio_url: string;
    genres: string[];
}

const EMPTY_FORM: FormState = {
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    portfolio_url: '',
    genres: [],
};

const toISODate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const displayMonthYear = (iso?: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// Server trả về datetime đầy đủ (RFC3339). Form chỉ giữ phần ngày 'YYYY-MM-DD'.
const toDateOnly = (iso?: string | null): string => (iso ? iso.slice(0, 10) : '');

// Backend (Go) yêu cầu RFC3339 → thêm 'T00:00:00Z' cho phần ngày. Rỗng thì bỏ qua.
const dateToApi = (dateOnly: string): string | undefined =>
    dateOnly ? `${dateOnly}T00:00:00Z` : undefined;

export function ExperienceForm({ onSaveSuccess }: ExperienceFormProps) {
    const { user } = useAuthStore();
    const username = user?.username || '';

    const { data: experiences = [], isLoading } = useGetUserExperiences(username, {
        enabled: !!username,
    });
    const { data: allGenresData } = useGetAllGenres();
    const allGenres = allGenresData?.genres || [];

    const createExperience = useCreateExperience(username);
    const updateExperience = useUpdateExperience(username);
    const updateExperienceGenres = useUpdateExperienceGenres(username);
    const deleteExperience = useDeleteExperience(username);

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);

    const isEditing = !!form.id;
    const isSaving = createExperience.isPending || updateExperience.isPending;

    const setField = (changes: Partial<FormState>) => {
        setForm((prev) => ({ ...prev, ...changes }));
        setError('');
    };

    const toggleGenre = (name: string) => {
        setForm((prev) => ({
            ...prev,
            genres: prev.genres.includes(name)
                ? prev.genres.filter((g) => g !== name)
                : [...prev.genres, name],
        }));
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setError('');
    };

    const startEdit = (exp: Experience) => {
        setForm({
            id: exp.id,
            title: exp.title || '',
            description: exp.description || '',
            start_date: toDateOnly(exp.start_date),
            end_date: toDateOnly(exp.end_date),
            portfolio_url: exp.portfolio_url || '',
            genres: (exp.genres || []).map((g) => g.name),
        });
        setError('');
    };

    const onPickDate = (event: DateTimePickerEvent, date?: Date) => {
        const field = showPicker;
        // Android tự đóng; iOS đóng bằng nút Xong
        if (Platform.OS === 'android') setShowPicker(null);
        if (event.type === 'dismissed' || !date || !field) return;
        setField(
            field === 'start' ? { start_date: toISODate(date) } : { end_date: toISODate(date) },
        );
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            setError('Vui lòng nhập chức danh / vị trí');
            return;
        }

        try {
            if (form.id) {
                await updateExperience.mutateAsync({
                    id: form.id,
                    payload: {
                        title: form.title.trim(),
                        description: form.description.trim() || undefined,
                        start_date: dateToApi(form.start_date),
                        end_date: dateToApi(form.end_date),
                        portfolio_url: form.portfolio_url.trim() || undefined,
                    },
                });
                await updateExperienceGenres.mutateAsync({ id: form.id, genreNames: form.genres });
            } else {
                await createExperience.mutateAsync({
                    title: form.title.trim(),
                    description: form.description.trim() || undefined,
                    start_date: dateToApi(form.start_date),
                    end_date: dateToApi(form.end_date),
                    portfolio_url: form.portfolio_url.trim() || undefined,
                    genre_names: form.genres,
                });
            }
            resetForm();
            onSaveSuccess?.();
        } catch (e) {
            console.error('Save experience failed:', e);
            setError('Không thể lưu kinh nghiệm. Vui lòng thử lại.');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteExperience.mutateAsync(deleteTarget.id);
            if (form.id === deleteTarget.id) resetForm();
            setDeleteTarget(null);
            onSaveSuccess?.();
        } catch (e) {
            console.error('Delete experience failed:', e);
        }
    };

    return (
        <View className="gap-6">
            {/* Header */}
            <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                    <Briefcase size={20} color="#7C3AED" />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                        Kinh nghiệm
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {isEditing ? 'Đang chỉnh sửa một mục' : 'Thêm quá trình hoạt động của bạn'}
                    </Text>
                </View>
            </View>

            {/* Form */}
            <View className="gap-4 p-4 rounded-2xl bg-secondary/40 dark:bg-gray-800/40 border border-border">
                {/* Title */}
                <View className="gap-2">
                    <Text className="text-sm font-bold text-foreground">Chức danh / Vị trí *</Text>
                    <TextInput
                        placeholder="VD: Ca sĩ chính - Ban nhạc XYZ"
                        value={form.title}
                        onChangeText={(t) => setField({ title: t })}
                        className={`px-4 py-4 bg-white dark:bg-gray-900 rounded-xl text-foreground text-base border ${
                            error && !form.title.trim() ? 'border-red-500' : 'border-transparent'
                        }`}
                        placeholderTextColor="#71717a"
                    />
                </View>

                {/* Description */}
                <View className="gap-2">
                    <Text className="text-sm font-bold text-foreground">Mô tả</Text>
                    <TextInput
                        placeholder="Mô tả công việc, thành tích..."
                        value={form.description}
                        onChangeText={(t) => setField({ description: t })}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="px-4 py-4 bg-white dark:bg-gray-900 rounded-xl text-foreground text-base min-h-[100px] border border-transparent"
                        placeholderTextColor="#71717a"
                    />
                </View>

                {/* Dates */}
                <View className="flex-row gap-4">
                    <View className="flex-1 gap-2">
                        <Text className="text-sm font-bold text-foreground">Bắt đầu</Text>
                        <TouchableOpacity
                            onPress={() => setShowPicker('start')}
                            className="flex-row items-center gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded-xl border border-transparent"
                        >
                            <Calendar size={16} color="#7C3AED" />
                            <Text className={form.start_date ? 'text-foreground' : 'text-gray-400'}>
                                {form.start_date ? displayMonthYear(form.start_date) : 'MM/YYYY'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 gap-2">
                        <Text className="text-sm font-bold text-foreground">Kết thúc</Text>
                        <TouchableOpacity
                            onPress={() => setShowPicker('end')}
                            className="flex-row items-center gap-2 px-4 py-4 bg-white dark:bg-gray-900 rounded-xl border border-transparent"
                        >
                            <Calendar size={16} color="#7C3AED" />
                            <Text className={form.end_date ? 'text-foreground' : 'text-gray-400'}>
                                {form.end_date ? displayMonthYear(form.end_date) : 'Hiện tại'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={
                            (showPicker === 'start' ? form.start_date : form.end_date)
                                ? new Date(showPicker === 'start' ? form.start_date : form.end_date)
                                : new Date()
                        }
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onPickDate}
                    />
                )}

                {/* Portfolio URL */}
                <View className="gap-2">
                    <Text className="text-sm font-bold text-foreground">Link portfolio</Text>
                    <TextInput
                        placeholder="https://..."
                        value={form.portfolio_url}
                        onChangeText={(t) => setField({ portfolio_url: t })}
                        autoCapitalize="none"
                        keyboardType="url"
                        className="px-4 py-4 bg-white dark:bg-gray-900 rounded-xl text-foreground text-base border border-transparent"
                        placeholderTextColor="#71717a"
                    />
                </View>

                {/* Genres */}
                {allGenres.length > 0 && (
                    <View className="gap-2">
                        <Text className="text-sm font-bold text-foreground">Thể loại</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {allGenres.map((genre: Genre) => {
                                const selected = form.genres.includes(genre.name);
                                return (
                                    <GradientPill
                                        key={genre.id}
                                        active={selected}
                                        onPress={() => toggleGenre(genre.name)}
                                        className="flex-row items-center px-3.5 py-2 rounded-full"
                                        inactiveClassName="border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                    >
                                        {selected && (
                                            <Check
                                                size={12}
                                                color="#FFFFFF"
                                                style={{ marginRight: 4 }}
                                            />
                                        )}
                                        <Text
                                            className={`text-xs font-semibold ${
                                                selected
                                                    ? 'text-white'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {genre.name}
                                        </Text>
                                    </GradientPill>
                                );
                            })}
                        </View>
                    </View>
                )}

                {!!error && <Text className="text-xs font-medium text-red-500">{error}</Text>}

                {/* Actions */}
                <View className="flex-row gap-3">
                    {isEditing && (
                        <TouchableOpacity
                            onPress={resetForm}
                            disabled={isSaving}
                            className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl border border-border bg-white dark:bg-gray-900"
                        >
                            <X size={18} color="#71717a" />
                            <Text className="text-foreground font-bold">Hủy</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl bg-purple-600 ${
                            isSaving ? 'opacity-50' : 'active:bg-purple-700'
                        }`}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : isEditing ? (
                            <Save size={18} color="#ffffff" />
                        ) : (
                            <Plus size={18} color="#ffffff" />
                        )}
                        <Text className="text-white font-bold">
                            {isSaving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm kinh nghiệm'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            <View className="gap-3">
                <Text className="text-sm font-bold text-foreground">Danh sách kinh nghiệm</Text>
                {isLoading ? (
                    <View className="py-8 items-center">
                        <ActivityIndicator size="small" color="#7C3AED" />
                    </View>
                ) : experiences.length === 0 ? (
                    <Text className="text-sm text-muted-foreground py-4 text-center">
                        Chưa có mục kinh nghiệm nào.
                    </Text>
                ) : (
                    experiences.map((exp, index) => (
                        <View
                            key={exp.id || `exp-${index}`}
                            className="flex-row gap-3 p-4 rounded-2xl border border-border bg-white dark:bg-gray-900"
                        >
                            <View className="flex-1 gap-1">
                                <Text className="font-bold text-foreground">
                                    {exp.title || 'Chưa có tiêu đề'}
                                </Text>
                                {(exp.start_date || exp.end_date) && (
                                    <Text className="text-xs text-muted-foreground">
                                        {exp.start_date ? displayMonthYear(exp.start_date) : '—'}
                                        {' - '}
                                        {exp.end_date ? displayMonthYear(exp.end_date) : 'Hiện tại'}
                                    </Text>
                                )}
                                {!!exp.description && (
                                    <Text className="text-sm text-muted-foreground">
                                        {exp.description}
                                    </Text>
                                )}
                                {!!exp.genres?.length && (
                                    <View className="flex-row flex-wrap gap-1 mt-1">
                                        {exp.genres.map((g) => (
                                            <View
                                                key={g.id || g.name}
                                                className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30"
                                            >
                                                <Text className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                                    {g.name}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                            <View className="gap-2">
                                <TouchableOpacity
                                    onPress={() => startEdit(exp)}
                                    className="w-9 h-9 rounded-full border border-border items-center justify-center"
                                >
                                    <Pencil size={16} color="#7C3AED" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setDeleteTarget(exp)}
                                    disabled={deleteExperience.isPending}
                                    className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center"
                                >
                                    <Trash2 size={16} color="#DC2626" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Xác nhận xóa */}
            <AppDialog
                visible={!!deleteTarget}
                tone="danger"
                icon={<Trash2 size={32} color="#EF4444" />}
                title="Xóa kinh nghiệm"
                message={
                    deleteTarget
                        ? `Xóa "${deleteTarget.title || 'mục này'}"? Hành động này không thể hoàn tác.`
                        : ''
                }
                confirmText="Xóa"
                cancelText="Hủy"
                loading={deleteExperience.isPending}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
        </View>
    );
}
