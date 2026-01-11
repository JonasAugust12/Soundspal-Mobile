import React from 'react';
import { View } from 'react-native';
import { useMessagingStore } from '@/stores/messagingStore';

interface OnlineIndicatorProps {
    userId: string;
    size?: number;
    position?: 'top-right' | 'bottom-right';
}

export function OnlineIndicator({ userId, size = 12, position = 'bottom-right' }: OnlineIndicatorProps) {
    const { onlineUsers } = useMessagingStore();
    const isOnline = onlineUsers.includes(userId);

    if (!isOnline) return null;

    const positionClasses = position === 'bottom-right' ? 'bottom-0 right-0' : 'top-0 right-0';

    return (
        <View className={`absolute ${positionClasses} rounded-full bg-white p-0.5`}>
            <View
                className="rounded-full bg-green-500"
                style={{ width: size, height: size }}
            />
        </View>
    );
}
