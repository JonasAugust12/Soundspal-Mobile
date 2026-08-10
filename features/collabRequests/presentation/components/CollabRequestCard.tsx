import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CalendarRange, MessageCircle } from 'lucide-react-native';
import type {
    CollabRequest,
    CollabRequestStatus,
} from '@/features/collabRequests/domain/entities/collabRequest.type';
import {
    canCancelCollab,
    canMessageCollabPartner,
    canRespondToCollab,
    counterpartOf,
    formatCollabDate,
    getCollabStatusMeta,
    isCollabOverdue,
    isSentByMe,
} from '@/features/collabRequests/domain/utils/collabRequestHelpers';
import { useMessageCollabPartner } from '@/features/collabRequests/presentation/hooks/useMessageCollabPartner';
import { CollabRequestStatusBadge } from './CollabRequestStatusBadge';
import { colors } from '@/shared/domain/constants/colors';

interface Props {
    item: CollabRequest;
    currentUserId: string;
    busy?: boolean;
    onPress: (item: CollabRequest) => void;
    onUpdateStatus: (id: string, status: Exclude<CollabRequestStatus, 'PENDING'>) => void;
}

export function CollabRequestCard({
    item,
    currentUserId,
    busy = false,
    onPress,
    onUpdateStatus,
}: Props) {
    const { messagePartner, isOpening } = useMessageCollabPartner();

    const counterpart = counterpartOf(item, currentUserId);
    const sent = isSentByMe(item, currentUserId);
    const overdue = isCollabOverdue(item);
    const meta = getCollabStatusMeta(item.status, overdue);
    const name = counterpart.display_name || counterpart.username;
    const avatar = counterpart.avatar_url;
    const showRespond = canRespondToCollab(item, currentUserId);
    const showCancel = canCancelCollab(item);
    const showMessage = canMessageCollabPartner(item);

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress(item)}
            className="mx-4 mb-3 rounded-2xl bg-white border border-gray-100 overflow-hidden"
        >
            <View className="flex-row">
                <View style={{ width: 4, backgroundColor: meta.accent }} />
                <View className="flex-1 p-4 gap-3">
                    <View className="flex-row items-start gap-3">
                        <Image
                            source={
                                avatar
                                    ? { uri: avatar }
                                    : require('@/assets/images/user_profile.png')
                            }
                            className="w-12 h-12 rounded-full bg-gray-100"
                        />
                        <View className="flex-1 min-w-0 gap-1">
                            <Text className="text-base font-bold text-gray-900" numberOfLines={2}>
                                {item.title}
                            </Text>
                            <Text className="text-sm text-gray-500" numberOfLines={1}>
                                {name}
                            </Text>
                            <View className="flex-row items-center gap-1.5 mt-0.5">
                                <CalendarRange size={14} color={colors.primary01} />
                                <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                                    {formatCollabDate(item.start_date)}
                                    {item.start_time ? ` ${item.start_time}` : ''}
                                    {' → '}
                                    {formatCollabDate(item.end_date)}
                                    {item.end_time ? ` ${item.end_time}` : ''}
                                </Text>
                            </View>
                            <View className="flex-row flex-wrap items-center gap-2 mt-1">
                                <View className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                                    <Text className="text-[11px] font-medium text-gray-600">
                                        {sent ? 'Bạn gửi' : 'Gửi cho bạn'}
                                    </Text>
                                </View>
                                <CollabRequestStatusBadge status={item.status} overdue={overdue} />
                            </View>
                        </View>
                    </View>

                    {(showRespond || showCancel || showMessage) && (
                        <View className="flex-row flex-wrap gap-2 pt-1">
                            {showMessage ? (
                                <TouchableOpacity
                                    disabled={isOpening}
                                    onPress={() => messagePartner(item)}
                                    className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-primary active:opacity-80"
                                >
                                    {isOpening ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MessageCircle size={14} color="#fff" />
                                            <Text className="text-white text-sm font-semibold">
                                                Nhắn đối tác
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : null}
                            {showRespond ? (
                                <>
                                    <TouchableOpacity
                                        disabled={busy}
                                        onPress={() => onUpdateStatus(item.id, 'ACCEPTED')}
                                        className="px-4 py-2 rounded-full bg-emerald-600 active:opacity-80"
                                    >
                                        {busy ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text className="text-white text-sm font-semibold">
                                                Chấp nhận
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        disabled={busy}
                                        onPress={() => onUpdateStatus(item.id, 'REJECTED')}
                                        className="px-4 py-2 rounded-full border border-rose-300 active:opacity-80"
                                    >
                                        <Text className="text-rose-700 text-sm font-semibold">
                                            Từ chối
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : null}
                            {showCancel ? (
                                <TouchableOpacity
                                    disabled={busy}
                                    onPress={() => onUpdateStatus(item.id, 'CANCELLED')}
                                    className="px-4 py-2 rounded-full bg-gray-100 active:opacity-80"
                                >
                                    <Text className="text-gray-600 text-sm font-semibold">Hủy</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
