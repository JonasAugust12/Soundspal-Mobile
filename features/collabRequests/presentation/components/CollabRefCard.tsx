import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarRange, Handshake } from 'lucide-react-native';
import { useCollabRequestDetail } from '@/features/collabRequests/presentation/hooks/useCollabRequestApi';
import { formatCollabDate } from '@/features/collabRequests/domain/utils/collabRequestHelpers';
import { CollabRequestStatusBadge } from './CollabRequestStatusBadge';
import { colors } from '@/shared/domain/constants/colors';

const CARD_MAX_WIDTH = 300;

function CardShell({ children }: { children: React.ReactNode }) {
    return (
        <View
            className="rounded-2xl border border-primary/30 bg-background p-3 gap-2"
            style={{ maxWidth: CARD_MAX_WIDTH }}
        >
            <View className="flex-row items-center gap-1.5">
                <Handshake size={12} color={colors.primary01} />
                <Text className="text-[11px] font-bold text-primary uppercase tracking-wide">
                    Đề nghị hợp tác
                </Text>
            </View>
            {children}
        </View>
    );
}

/**
 * Thẻ hợp tác trong khung chat. Khác JOB_REF (nhúng sẵn snapshot), COLLAB_REF chỉ mang `id`
 * nên nội dung phải lấy từ `GET /collaborations/{id}` — API này chỉ cho sender/receiver xem,
 * người ngoài sẽ nhận 403 và thấy thẻ "không khả dụng" (phần chữ vẫn hiện bình thường).
 */
export function CollabRefCard({ collaborationId }: { collaborationId: string }) {
    const router = useRouter();
    const { data: collab, isLoading, isError } = useCollabRequestDetail(collaborationId);

    if (isLoading) {
        return (
            <CardShell>
                <View className="py-3 items-center">
                    <ActivityIndicator size="small" color={colors.primary01} />
                </View>
            </CardShell>
        );
    }

    if (isError || !collab) {
        return (
            <CardShell>
                <Text className="text-sm text-muted-foreground italic">
                    Không xem được đề nghị hợp tác này.
                </Text>
            </CardShell>
        );
    }

    const senderName = collab.sender.display_name || collab.sender.username;
    const receiverName = collab.receiver.display_name || collab.receiver.username;

    return (
        <CardShell>
            <Text className="text-base font-bold text-foreground" numberOfLines={2}>
                {collab.title}
            </Text>
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                {senderName} → {receiverName}
            </Text>
            {!!collab.description && (
                <Text className="text-sm text-foreground/80" numberOfLines={2}>
                    {collab.description}
                </Text>
            )}

            <View className="flex-row items-center gap-1.5">
                <CalendarRange size={12} color="#6b7280" />
                <Text className="text-[11px] text-muted-foreground font-medium flex-1">
                    {formatCollabDate(collab.start_date)}
                    {collab.start_time ? ` ${collab.start_time}` : ''}
                    {' → '}
                    {formatCollabDate(collab.end_date)}
                    {collab.end_time ? ` ${collab.end_time}` : ''}
                </Text>
            </View>

            <View className="flex-row items-center justify-between gap-2">
                <CollabRequestStatusBadge status={collab.status} />
                <Text
                    className="text-[11px] font-semibold text-primary"
                    onPress={() => router.push('/(profiles)/collab-requests')}
                >
                    Xem yêu cầu
                </Text>
            </View>
        </CardShell>
    );
}
