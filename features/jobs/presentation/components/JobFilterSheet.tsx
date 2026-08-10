import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useGetAllGenres } from '@/features/profiles/presentation/hooks/useUserApi';
import type { Genre } from '@/features/profiles/domain/entities/user.type';
import type {
    PostTypeFilter,
    LocationType,
    ExperienceLevel,
} from '@/features/jobs/domain/entities/job.type';

export interface JobFilters {
    post_type?: PostTypeFilter;
    location?: string;
    location_type?: LocationType;
    experience_level?: ExperienceLevel;
    budget_min?: number;
    budget_max?: number;
    genres?: string[];
}

// Nhãn khớp `JOB_TYPE_LABELS` trong messaging/domain/utils/messageContent.ts.
const POST_TYPES: { value: PostTypeFilter; label: string }[] = [
    { value: 'opportunity', label: 'Cơ hội biểu diễn' },
    { value: 'collaboration', label: 'Tìm cộng tác' },
    { value: 'job_offer', label: 'Tuyển dụng' },
    { value: 'gig', label: 'Gig / Show' },
    { value: 'availability', label: 'Nhận show' },
];
const LOCATION_TYPES: { value: LocationType; label: string }[] = [
    { value: 'onsite', label: 'Tại chỗ' },
    { value: 'remote', label: 'Từ xa' },
    { value: 'hybrid', label: 'Kết hợp' },
];
const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
    { value: 'any', label: 'Mọi cấp độ' },
    { value: 'beginner', label: 'Mới bắt đầu' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'expert', label: 'Chuyên nghiệp' },
];

export function countActiveFilters(f: JobFilters): number {
    let n = 0;
    if (f.post_type) n++;
    if (f.location_type) n++;
    if (f.experience_level) n++;
    if (f.location?.trim()) n++;
    if (typeof f.budget_min === 'number') n++;
    if (typeof f.budget_max === 'number') n++;
    if (f.genres && f.genres.length > 0) n++;
    return n;
}

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`px-4 py-2 rounded-full border ${
                active
                    ? 'bg-purple-600 border-purple-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
        >
            <Text
                className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

interface JobFilterSheetProps {
    visible: boolean;
    initialFilters: JobFilters;
    onApply: (filters: JobFilters) => void;
    onClose: () => void;
}

export function JobFilterSheet({ visible, initialFilters, onApply, onClose }: JobFilterSheetProps) {
    const { data: allGenresData } = useGetAllGenres();
    const allGenres = allGenresData?.genres || [];
    const [draft, setDraft] = useState<JobFilters>(initialFilters);

    useEffect(() => {
        if (visible) setDraft(initialFilters);
    }, [visible, initialFilters]);

    const set = (patch: Partial<JobFilters>) => setDraft((d) => ({ ...d, ...patch }));
    const toggleGenre = (name: string) =>
        setDraft((d) => {
            const cur = d.genres ?? [];
            return {
                ...d,
                genres: cur.includes(name) ? cur.filter((g) => g !== name) : [...cur, name],
            };
        });
    const parseBudget = (t: string): number | undefined => {
        const n = parseInt(t.replace(/\D/g, ''), 10);
        return Number.isNaN(n) ? undefined : n;
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
                <Pressable
                    onPress={() => {}}
                    className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[88%]"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <Text className="text-xl font-extrabold text-gray-900 dark:text-white">
                            Bộ lọc
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <X size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="px-5"
                        contentContainerStyle={{ paddingVertical: 16, gap: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Post type */}
                        <View className="gap-2.5">
                            <Text className="text-sm font-bold text-foreground">Loại tin</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {POST_TYPES.map((o) => (
                                    <Chip
                                        key={o.value}
                                        label={o.label}
                                        active={draft.post_type === o.value}
                                        onPress={() =>
                                            set({
                                                post_type:
                                                    draft.post_type === o.value
                                                        ? undefined
                                                        : o.value,
                                            })
                                        }
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Location type */}
                        <View className="gap-2.5">
                            <Text className="text-sm font-bold text-foreground">Hình thức</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {LOCATION_TYPES.map((o) => (
                                    <Chip
                                        key={o.value}
                                        label={o.label}
                                        active={draft.location_type === o.value}
                                        onPress={() =>
                                            set({
                                                location_type:
                                                    draft.location_type === o.value
                                                        ? undefined
                                                        : o.value,
                                            })
                                        }
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Experience */}
                        <View className="gap-2.5">
                            <Text className="text-sm font-bold text-foreground">Kinh nghiệm</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {EXPERIENCE_LEVELS.map((o) => (
                                    <Chip
                                        key={o.value}
                                        label={o.label}
                                        active={draft.experience_level === o.value}
                                        onPress={() =>
                                            set({
                                                experience_level:
                                                    draft.experience_level === o.value
                                                        ? undefined
                                                        : o.value,
                                            })
                                        }
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Budget */}
                        <View className="gap-2.5">
                            <Text className="text-sm font-bold text-foreground">
                                Ngân sách (VND)
                            </Text>
                            <View className="flex-row gap-3">
                                <TextInput
                                    value={draft.budget_min != null ? String(draft.budget_min) : ''}
                                    onChangeText={(t) => set({ budget_min: parseBudget(t) })}
                                    placeholder="Tối thiểu"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="number-pad"
                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-foreground border border-gray-200 dark:border-gray-700"
                                />
                                <TextInput
                                    value={draft.budget_max != null ? String(draft.budget_max) : ''}
                                    onChangeText={(t) => set({ budget_max: parseBudget(t) })}
                                    placeholder="Tối đa"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="number-pad"
                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-foreground border border-gray-200 dark:border-gray-700"
                                />
                            </View>
                        </View>

                        {/* Location text */}
                        <View className="gap-2.5">
                            <Text className="text-sm font-bold text-foreground">Địa điểm</Text>
                            <TextInput
                                value={draft.location ?? ''}
                                onChangeText={(t) => set({ location: t })}
                                placeholder="VD: Hồ Chí Minh"
                                placeholderTextColor="#9CA3AF"
                                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-foreground border border-gray-200 dark:border-gray-700"
                            />
                        </View>

                        {/* Genres */}
                        {allGenres.length > 0 && (
                            <View className="gap-2.5">
                                <Text className="text-sm font-bold text-foreground">Thể loại</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {allGenres.map((g: Genre) => (
                                        <Chip
                                            key={g.id}
                                            label={g.name}
                                            active={(draft.genres ?? []).includes(g.name)}
                                            onPress={() => toggleGenre(g.name)}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View className="flex-row gap-3 px-5 pt-3 pb-8 border-t border-gray-100 dark:border-gray-800">
                        <TouchableOpacity
                            onPress={() => setDraft({})}
                            className="px-6 py-3.5 rounded-2xl border border-gray-300 dark:border-gray-600 items-center justify-center"
                            activeOpacity={0.8}
                        >
                            <Text className="font-bold text-gray-700 dark:text-gray-300">
                                Xóa lọc
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onApply(draft);
                                onClose();
                            }}
                            className="flex-1 bg-purple-600 rounded-2xl py-3.5 items-center justify-center"
                            activeOpacity={0.85}
                        >
                            <Text className="text-white font-bold text-base">Áp dụng</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
