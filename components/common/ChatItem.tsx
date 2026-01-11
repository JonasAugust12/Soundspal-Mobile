import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { OnlineIndicator } from './OnlineIndicator';

export type ChatItemProps = {
    name: string;
    preview: string;
    avatarSource: any;
    time?: string;
    unread?: boolean;
    unreadCount?: number;
    userId?: string;
    onPress?: () => void;
};

export function ChatItem({
    name,
    preview,
    avatarSource,
    time,
    unread,
    unreadCount,
    userId,
    onPress,
}: ChatItemProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center gap-3 py-2.5 active:opacity-80"
        >
            <View className="relative">
                <Image source={avatarSource} className="w-14 h-14 rounded-full" />
                {userId && <OnlineIndicator userId={userId} size={12} position="bottom-right" />}
            </View>

            <View className="flex-1 gap-0.5">
                <View className="flex-row items-start justify-between">
                    <Text className="font-bold text-foreground">{name}</Text>
                    {time && <Text className="text-[10px] text-muted-foreground">{time}</Text>}
                </View>

                <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground flex-1" numberOfLines={1}>
                        {preview}
                    </Text>

                    {unreadCount && unreadCount > 0 ? (
                        <View className="min-w-[20px] h-5 rounded-full bg-primary items-center justify-center px-1.5">
                            <Text className="text-[11px] text-white font-semibold">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    ) : unread ? (
                        <View className="w-2 h-2 rounded-full bg-primary" />
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}
