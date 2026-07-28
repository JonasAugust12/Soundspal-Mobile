import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { ArrowUpRight, CalendarDays, CalendarRange, Sparkles, Users } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import {
    useAcceptedCollabRequests,
    useUpdateCollabRequestStatus,
} from '@/features/collabRequests/presentation/hooks/useCollabRequestApi';
import type { CollabRequest } from '@/features/collabRequests/domain/entities/collabRequest.type';
import {
    counterpartOf,
    formatCollabDate,
    isOngoing,
    isUpcoming,
    paletteForId,
    todayIsoLocal,
} from '@/features/collabRequests/domain/utils/collabRequestHelpers';
import { CollabCalendarSkeleton } from './CollabRequestSkeletons';
import { CollabRequestDetailModal } from './CollabRequestDetailModal';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { showAppDialog } from '@/shared/presentation/ui';
import { colors } from '@/shared/domain/constants/colors';

LocaleConfig.locales.vi = {
    monthNames: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ],
    monthNamesShort: [
        'Th1',
        'Th2',
        'Th3',
        'Th4',
        'Th5',
        'Th6',
        'Th7',
        'Th8',
        'Th9',
        'Th10',
        'Th11',
        'Th12',
    ],
    dayNames: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    today: 'Hôm nay',
};
LocaleConfig.defaultLocale = 'vi';

function eachDateInRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const cur = new Date(`${start}T00:00:00`);
    const last = new Date(`${end}T00:00:00`);
    if (Number.isNaN(cur.getTime()) || Number.isNaN(last.getTime())) return dates;
    while (cur <= last) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}

export function CollabCalendarPanel() {
    const currentUserId = useAuthStore((s) => s.user?.id ?? '');
    const { showSuccess, showError } = useToast();
    const { data, isLoading, refetch, isRefetching } = useAcceptedCollabRequests();
    const updateStatus = useUpdateCollabRequestStatus();
    const [selectedDate, setSelectedDate] = useState(todayIsoLocal());
    const [detail, setDetail] = useState<CollabRequest | null>(null);

    const items = data?.collaborations ?? [];
    const today = todayIsoLocal();

    const stats = useMemo(() => {
        const ongoing = items.filter((i) => isOngoing(i, today)).length;
        const upcoming = items.filter((i) => isUpcoming(i, today)).length;
        const partners = new Set(
            items.map((i) => counterpartOf(i, currentUserId).id).filter(Boolean),
        ).size;
        return { total: items.length, ongoing, upcoming, partners };
    }, [items, today, currentUserId]);

    const markedDates = useMemo(() => {
        const marks: Record<
            string,
            {
                marked?: boolean;
                dots?: { key: string; color: string }[];
                selected?: boolean;
                selectedColor?: string;
            }
        > = {};

        items.forEach((item) => {
            const palette = paletteForId(item.id);
            eachDateInRange(item.start_date, item.end_date).forEach((day) => {
                const prev = marks[day] ?? { dots: [] };
                const dots = [...(prev.dots ?? [])];
                if (dots.length < 3) {
                    dots.push({ key: item.id, color: palette.border });
                }
                marks[day] = { ...prev, marked: true, dots };
            });
        });

        marks[selectedDate] = {
            ...(marks[selectedDate] ?? {}),
            selected: true,
            selectedColor: colors.primary01,
        };

        if (marks[today] && selectedDate !== today) {
            marks[today] = {
                ...marks[today],
                marked: true,
            };
        }

        return marks;
    }, [items, selectedDate, today]);

    const dayItems = useMemo(
        () => items.filter((i) => i.start_date <= selectedDate && i.end_date >= selectedDate),
        [items, selectedDate],
    );

    const upcomingList = useMemo(
        () =>
            [...items]
                .filter((i) => i.end_date >= today)
                .sort((a, b) => a.start_date.localeCompare(b.start_date))
                .slice(0, 6),
        [items, today],
    );

    const handleCancel = (item: CollabRequest) => {
        showAppDialog('Hủy hợp tác', 'Bạn chắc chắn muốn hủy hợp tác đã chấp nhận?', [
            { text: 'Không', style: 'cancel' },
            {
                text: 'Hủy hợp tác',
                style: 'destructive',
                onPress: () => {
                    updateStatus.mutate(
                        { id: item.id, payload: { status: 'CANCELLED' } },
                        {
                            onSuccess: () => {
                                showSuccess('Thành công', 'Đã hủy hợp tác.');
                                setDetail(null);
                            },
                            onError: (err: unknown) => {
                                const message =
                                    (err as { response?: { data?: { message?: string } } })
                                        ?.response?.data?.message || 'Không thể hủy hợp tác.';
                                showError('Lỗi', message);
                            },
                        },
                    );
                },
            },
        ]);
    };

    if (isLoading) {
        return <CollabCalendarSkeleton />;
    }

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={() => void refetch()}
                    tintColor="#7C3BED"
                    colors={['#7C3BED']}
                />
            }
        >
            <View className="px-4 gap-4">
                <View className="flex-row flex-wrap gap-2">
                    <StatCard
                        icon={<CalendarRange size={16} color="#7C3BED" />}
                        label="Tổng"
                        value={stats.total}
                        tint="bg-violet-50"
                    />
                    <StatCard
                        icon={<Sparkles size={16} color="#059669" />}
                        label="Đang diễn ra"
                        value={stats.ongoing}
                        tint="bg-emerald-50"
                    />
                    <StatCard
                        icon={<ArrowUpRight size={16} color="#D97706" />}
                        label="Sắp tới"
                        value={stats.upcoming}
                        tint="bg-amber-50"
                    />
                    <StatCard
                        icon={<Users size={16} color="#0284C7" />}
                        label="Đối tác"
                        value={stats.partners}
                        tint="bg-sky-50"
                    />
                </View>

                {items.length === 0 ? (
                    <View className="items-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-6 py-14 gap-3">
                        <View className="w-16 h-16 rounded-3xl bg-primary/15 items-center justify-center">
                            <CalendarDays size={32} color="#7C3BED" />
                        </View>
                        <Text className="text-base font-bold text-gray-900 text-center">
                            Chưa có hợp tác trên lịch
                        </Text>
                        <Text className="text-sm text-gray-500 text-center">
                            Khi đề nghị được chấp nhận, lịch trình sẽ hiện tại đây.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
                            <RNCalendar
                                current={selectedDate}
                                onDayPress={(day) => setSelectedDate(day.dateString)}
                                markedDates={markedDates}
                                markingType="multi-dot"
                                theme={{
                                    todayTextColor: colors.primary01,
                                    arrowColor: colors.primary01,
                                    selectedDayBackgroundColor: colors.primary01,
                                    selectedDayTextColor: '#ffffff',
                                    monthTextColor: '#111827',
                                    textMonthFontWeight: '700',
                                    textDayFontWeight: '500',
                                    textDayHeaderFontWeight: '600',
                                    textSectionTitleColor: '#6B7280',
                                }}
                            />
                        </View>

                        <View className="rounded-2xl bg-white border border-gray-100 p-4 gap-3">
                            <Text className="text-sm font-bold text-gray-900">
                                Ngày {formatCollabDate(selectedDate)}
                            </Text>
                            {dayItems.length === 0 ? (
                                <Text className="text-sm text-gray-500">
                                    Không có hợp tác trong ngày này.
                                </Text>
                            ) : (
                                dayItems.map((item) => {
                                    const p = counterpartOf(item, currentUserId);
                                    const name = p.display_name || p.username;
                                    const palette = paletteForId(item.id);
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => setDetail(item)}
                                            className="flex-row items-start gap-3 rounded-xl border border-gray-100 p-3"
                                            style={{ backgroundColor: palette.bg }}
                                        >
                                            <View
                                                className="w-1 self-stretch rounded-full"
                                                style={{ backgroundColor: palette.border }}
                                            />
                                            <Image
                                                source={
                                                    p.avatar_url
                                                        ? { uri: p.avatar_url }
                                                        : require('@/assets/images/user_profile.png')
                                                }
                                                className="w-9 h-9 rounded-full bg-white"
                                            />
                                            <View className="flex-1">
                                                <Text
                                                    className="text-sm font-bold text-gray-900"
                                                    numberOfLines={1}
                                                >
                                                    {item.title}
                                                </Text>
                                                <Text
                                                    className="text-xs text-gray-600"
                                                    numberOfLines={1}
                                                >
                                                    {name}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>

                        <View className="rounded-2xl bg-white border border-gray-100 p-4 gap-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-bold text-gray-900">Sắp diễn ra</Text>
                                <View className="px-2 py-0.5 rounded-full bg-primary/15">
                                    <Text className="text-[11px] font-bold text-primary">
                                        {upcomingList.length}
                                    </Text>
                                </View>
                            </View>
                            {upcomingList.length === 0 ? (
                                <Text className="text-sm text-gray-500">
                                    Không có lịch sắp tới.
                                </Text>
                            ) : (
                                upcomingList.map((item) => {
                                    const p = counterpartOf(item, currentUserId);
                                    const name = p.display_name || p.username;
                                    const palette = paletteForId(item.id);
                                    const ongoing = isOngoing(item, today);
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => setDetail(item)}
                                            className="flex-row items-start gap-3 rounded-xl border border-gray-100 p-3"
                                            style={{ backgroundColor: palette.bg }}
                                        >
                                            <View
                                                className="w-1 self-stretch rounded-full"
                                                style={{ backgroundColor: palette.border }}
                                            />
                                            <Image
                                                source={
                                                    p.avatar_url
                                                        ? { uri: p.avatar_url }
                                                        : require('@/assets/images/user_profile.png')
                                                }
                                                className="w-9 h-9 rounded-full bg-white"
                                            />
                                            <View className="flex-1">
                                                <Text
                                                    className="text-sm font-bold text-gray-900"
                                                    numberOfLines={1}
                                                >
                                                    {item.title}
                                                </Text>
                                                <Text
                                                    className="text-xs text-gray-600"
                                                    numberOfLines={1}
                                                >
                                                    {name}
                                                </Text>
                                                <Text className="text-[11px] text-gray-500 mt-1">
                                                    {formatCollabDate(item.start_date)}
                                                    {' → '}
                                                    {formatCollabDate(item.end_date)}
                                                </Text>
                                                {ongoing ? (
                                                    <View className="self-start mt-1.5 px-2 py-0.5 rounded-full bg-emerald-100">
                                                        <Text className="text-[10px] font-bold text-emerald-700 uppercase">
                                                            Đang diễn ra
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    </>
                )}
            </View>

            <CollabRequestDetailModal
                item={detail}
                currentUserId={currentUserId}
                visible={Boolean(detail)}
                onClose={() => setDetail(null)}
                onCancel={handleCancel}
                cancelling={updateStatus.isPending}
            />
        </ScrollView>
    );
}

function StatCard({
    icon,
    label,
    value,
    tint,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    tint: string;
}) {
    return (
        <View
            className={`min-w-[47%] flex-1 rounded-2xl border border-gray-100 bg-white p-3.5 ${tint}`}
        >
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    {label}
                </Text>
                <View className="w-8 h-8 rounded-xl bg-white/80 items-center justify-center">
                    {icon}
                </View>
            </View>
            <Text className="text-2xl font-black text-gray-900">{value}</Text>
        </View>
    );
}
