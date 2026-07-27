import React from 'react';
import { View, Text } from 'react-native';
import type { CollabRequestStatus } from '@/features/collabRequests/domain/entities/collabRequest.type';
import { getCollabStatusMeta } from '@/features/collabRequests/domain/utils/collabRequestHelpers';

interface Props {
    status: CollabRequestStatus;
    overdue?: boolean;
}

export function CollabRequestStatusBadge({ status, overdue = false }: Props) {
    const meta = getCollabStatusMeta(status, overdue);
    return (
        <View className={`px-2.5 py-1 rounded-full ${meta.bgClass}`}>
            <Text className={`text-[11px] font-bold uppercase tracking-wide ${meta.textClass}`}>
                {meta.label}
            </Text>
        </View>
    );
}
