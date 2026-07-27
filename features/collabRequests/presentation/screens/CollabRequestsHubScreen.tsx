import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, ChevronLeft, Handshake } from 'lucide-react-native';
import { TabScreenWrapper } from '@/shared/presentation/navigation/TabScreenWrapper';
import { CollabRequestsManagePanel } from '@/features/collabRequests/presentation/components/CollabRequestsManagePanel';
import { CollabCalendarPanel } from '@/features/collabRequests/presentation/components/CollabCalendarPanel';
import { colors } from '@/shared/domain/constants/colors';

type HubTab = 'manage' | 'calendar';

const activeTabShadow = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    android: { elevation: 1 },
});

export default function CollabRequestsHubScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ tab?: string }>();
    const [tab, setTab] = useState<HubTab>(params.tab === 'calendar' ? 'calendar' : 'manage');

    useEffect(() => {
        if (params.tab === 'calendar') setTab('calendar');
        else if (params.tab === 'manage') setTab('manage');
    }, [params.tab]);

    const title = useMemo(() => (tab === 'calendar' ? 'Lịch hợp tác' : 'Đề nghị hợp tác'), [tab]);

    return (
        <TabScreenWrapper>
            <View className="flex-1 bg-gray-50">
                <View className="flex-row items-center gap-3 bg-white px-4 py-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                        <ChevronLeft size={24} color={colors.primary01} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-[11px] font-bold uppercase tracking-wide text-primary">
                            Hợp tác
                        </Text>
                        <Text className="text-lg font-bold text-gray-900">{title}</Text>
                    </View>
                    {tab === 'calendar' ? (
                        <CalendarDays size={22} color={colors.primary01} />
                    ) : (
                        <Handshake size={22} color={colors.primary01} />
                    )}
                </View>

                <View className="px-4 py-3">
                    <View className="flex-row gap-2 bg-gray-100 p-1 rounded-2xl w-full">
                        {(
                            [
                                { key: 'manage' as const, label: 'Đề nghị', Icon: Handshake },
                                { key: 'calendar' as const, label: 'Lịch', Icon: CalendarDays },
                            ] as const
                        ).map(({ key, label, Icon }) => {
                            const active = tab === key;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => setTab(key)}
                                    className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-1.5 ${
                                        active ? 'bg-white border border-black/5' : 'bg-transparent'
                                    }`}
                                    style={active ? activeTabShadow : undefined}
                                >
                                    <Icon size={16} color={active ? colors.primary01 : '#6B7280'} />
                                    <Text
                                        className={`font-semibold text-sm ${
                                            active ? 'text-purple-600' : 'text-gray-600'
                                        }`}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {tab === 'manage' ? <CollabRequestsManagePanel /> : <CollabCalendarPanel />}
            </View>
        </TabScreenWrapper>
    );
}
