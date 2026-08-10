import React from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    ScrollView,
    Image,
    Linking,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { ExternalLink, MessageCircle, Paperclip, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { CollabRequest } from '@/features/collabRequests/domain/entities/collabRequest.type';
import {
    canCancelCollab,
    canMessageCollabPartner,
    counterpartOf,
    formatCollabDate,
    isCollabOverdue,
} from '@/features/collabRequests/domain/utils/collabRequestHelpers';
import { useMessageCollabPartner } from '@/features/collabRequests/presentation/hooks/useMessageCollabPartner';
import { CollabRequestStatusBadge } from './CollabRequestStatusBadge';
import { colors } from '@/shared/domain/constants/colors';

interface Props {
    item: CollabRequest | null;
    currentUserId: string;
    visible: boolean;
    onClose: () => void;
    onCancel?: (item: CollabRequest) => void;
    cancelling?: boolean;
}

export function CollabRequestDetailModal({
    item,
    currentUserId,
    visible,
    onClose,
    onCancel,
    cancelling = false,
}: Props) {
    const router = useRouter();
    const { messagePartner, isOpening } = useMessageCollabPartner();
    if (!item) return null;

    const partner = counterpartOf(item, currentUserId);
    const name = partner.display_name || partner.username;
    const overdue = isCollabOverdue(item);
    const showCancel = Boolean(onCancel) && canCancelCollab(item);
    const showMessage = canMessageCollabPartner(item);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
                <Pressable
                    className="bg-white rounded-t-3xl max-h-[85%] overflow-hidden"
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 rounded-full bg-gray-300" />
                    </View>

                    <View className="px-5 pb-3 flex-row items-start justify-between gap-3">
                        <View className="flex-row items-center gap-3 flex-1">
                            <Image
                                source={
                                    partner.avatar_url
                                        ? { uri: partner.avatar_url }
                                        : require('@/assets/images/user_profile.png')
                                }
                                className="w-12 h-12 rounded-full bg-gray-100"
                            />
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900" numberOfLines={2}>
                                    {item.title}
                                </Text>
                                <Text className="text-sm text-gray-500" numberOfLines={1}>
                                    Với {name}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <X size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="px-5"
                        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
                    >
                        <CollabRequestStatusBadge status={item.status} overdue={overdue} />
                        <Text className="text-sm text-gray-800 leading-5">{item.description}</Text>
                        <View className="self-start px-3 py-1.5 rounded-full bg-gray-100">
                            <Text className="text-xs font-medium text-gray-600">
                                {formatCollabDate(item.start_date)}
                                {item.start_time ? ` ${item.start_time}` : ''}
                                {' — '}
                                {formatCollabDate(item.end_date)}
                                {item.end_time ? ` ${item.end_time}` : ''}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-500">
                            {item.is_public ? 'Công khai trên hồ sơ' : 'Riêng tư'}
                        </Text>
                        {item.attachment_url ? (
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                onPress={() => void Linking.openURL(item.attachment_url!)}
                            >
                                <Paperclip size={16} color={colors.primary01} />
                                <Text className="text-sm font-medium text-primary">Tài liệu</Text>
                                <ExternalLink size={14} color={colors.primary01} />
                            </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                            onPress={() => {
                                onClose();
                                router.push({
                                    pathname: '/(profiles)/artistProfile',
                                    params: { username: partner.username },
                                });
                            }}
                        >
                            <Text className="text-sm font-semibold text-primary">
                                Xem hồ sơ {name}
                            </Text>
                        </TouchableOpacity>

                        {showMessage ? (
                            <TouchableOpacity
                                disabled={isOpening}
                                onPress={() => {
                                    onClose();
                                    messagePartner(item);
                                }}
                                className="mt-2 py-3.5 rounded-full bg-primary flex-row items-center justify-center gap-2 active:opacity-80"
                            >
                                {isOpening ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MessageCircle size={18} color="#fff" />
                                        <Text className="text-white font-semibold">
                                            Nhắn đối tác
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : null}

                        {showCancel ? (
                            <TouchableOpacity
                                disabled={cancelling}
                                onPress={() => onCancel?.(item)}
                                className="mt-2 py-3.5 rounded-full bg-rose-600 items-center active:opacity-80"
                            >
                                {cancelling ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white font-semibold">Hủy hợp tác</Text>
                                )}
                            </TouchableOpacity>
                        ) : null}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
