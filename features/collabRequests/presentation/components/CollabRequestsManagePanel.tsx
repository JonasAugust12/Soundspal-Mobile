import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Handshake } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import {
    useListCollabRequests,
    useUpdateCollabRequestStatus,
    type CollabFilter,
} from '@/features/collabRequests/presentation/hooks/useCollabRequestApi';
import type {
    CollabRequest,
    CollabRequestStatus,
} from '@/features/collabRequests/domain/entities/collabRequest.type';
import { CollabRequestCard } from './CollabRequestCard';
import { CollabRequestCardSkeleton } from './CollabRequestSkeletons';
import { CollabRequestDetailModal } from './CollabRequestDetailModal';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { showAppDialog } from '@/shared/presentation/ui';

const FILTERS: { value: CollabFilter; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ' },
    { value: 'ACCEPTED', label: 'Đồng ý' },
    { value: 'REJECTED', label: 'Từ chối' },
    { value: 'CANCELLED', label: 'Đã hủy' },
];

const activeChipShadow = Platform.select({
    ios: {
        shadowColor: '#7C3BED',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    android: { elevation: 2 },
});

export function CollabRequestsManagePanel() {
    const currentUserId = useAuthStore((s) => s.user?.id ?? '');
    const { showSuccess, showError } = useToast();
    const [filter, setFilter] = useState<CollabFilter>('ALL');
    const [detail, setDetail] = useState<CollabRequest | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const listParams = useMemo(
        () => ({
            status: filter === 'ALL' ? undefined : filter,
            page: 1,
            page_size: 50,
        }),
        [filter],
    );

    const { data, isLoading, refetch, isRefetching } = useListCollabRequests(listParams);
    const updateStatus = useUpdateCollabRequestStatus();
    const items = data?.collaborations ?? [];

    const handleUpdate = (id: string, status: Exclude<CollabRequestStatus, 'PENDING'>) => {
        const labels: Record<string, string> = {
            ACCEPTED: 'chấp nhận',
            REJECTED: 'từ chối',
            CANCELLED: 'hủy',
        };
        showAppDialog('Xác nhận', `Bạn chắc chắn muốn ${labels[status]} đề nghị này?`, [
            { text: 'Không', style: 'cancel' },
            {
                text: 'Đồng ý',
                style: status === 'CANCELLED' ? 'destructive' : 'default',
                onPress: () => {
                    setBusyId(id);
                    updateStatus.mutate(
                        { id, payload: { status } },
                        {
                            onSuccess: (updated) => {
                                showSuccess('Thành công', 'Đã cập nhật trạng thái.');
                                if (detail?.id === id) setDetail(updated);
                            },
                            onError: (err: unknown) => {
                                const message =
                                    (
                                        err as {
                                            response?: { data?: { message?: string } };
                                        }
                                    )?.response?.data?.message || 'Không thể cập nhật trạng thái.';
                                showError('Lỗi', message);
                            },
                            onSettled: () => setBusyId(null),
                        },
                    );
                },
            },
        ]);
    };

    return (
        <View className="flex-1">
            <View className="px-4 pb-3">
                <FlatList
                    horizontal
                    data={FILTERS}
                    keyExtractor={(f) => f.value}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                    renderItem={({ item: f }) => {
                        const active = filter === f.value;
                        return (
                            <TouchableOpacity
                                onPress={() => setFilter(f.value)}
                                className={`px-4 py-2 rounded-full ${
                                    active ? 'bg-primary' : 'bg-white border border-gray-200'
                                }`}
                                style={active ? activeChipShadow : undefined}
                            >
                                <Text
                                    className={`text-sm font-semibold ${
                                        active ? 'text-white' : 'text-gray-600'
                                    }`}
                                >
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {isLoading ? (
                <CollabRequestCardSkeleton />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => void refetch()}
                            tintColor="#7C3BED"
                            colors={['#7C3BED']}
                        />
                    }
                    contentContainerStyle={{
                        paddingBottom: 32,
                        flexGrow: 1,
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center px-8 py-16 gap-3">
                            <View className="w-16 h-16 rounded-3xl bg-primary/10 items-center justify-center">
                                <Handshake size={32} color="#7C3BED" />
                            </View>
                            <Text className="text-base font-semibold text-gray-800 text-center">
                                Chưa có đề nghị nào
                            </Text>
                            <Text className="text-sm text-gray-500 text-center">
                                Gửi đề nghị từ hồ sơ nghệ sĩ, hoặc chờ người khác gửi tới bạn.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <CollabRequestCard
                            item={item}
                            currentUserId={currentUserId}
                            busy={busyId === item.id}
                            onPress={setDetail}
                            onUpdateStatus={handleUpdate}
                        />
                    )}
                />
            )}

            <CollabRequestDetailModal
                item={detail}
                currentUserId={currentUserId}
                visible={Boolean(detail)}
                onClose={() => setDetail(null)}
            />
        </View>
    );
}
