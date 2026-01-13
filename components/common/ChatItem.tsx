import React from 'react';
import { View, Text, Pressable, Image, Platform, StyleSheet } from 'react-native';
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
    const hasUnread = unread || (unreadCount && unreadCount > 0);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
            className="flex-row items-center gap-3 p-3 rounded-2xl"
        >
            {/* Avatar with Online Indicator */}
            <View className="relative">
                <Image
                    source={avatarSource}
                    className="w-14 h-14 rounded-full"
                    style={styles.avatar}
                />
                {userId && <OnlineIndicator userId={userId} size={14} position="bottom-right" />}
            </View>

            {/* Content */}
            <View className="flex-1 gap-1">
                {/* Top Row: Name + Time */}
                <View className="flex-row items-center justify-between">
                    <Text
                        className={`text-[15px] ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    {time && (
                        <Text className={`text-[11px] ${hasUnread ? 'font-semibold text-purple-600' : 'text-gray-400'}`}>
                            {time}
                        </Text>
                    )}
                </View>

                {/* Bottom Row: Preview + Badge */}
                <View className="flex-row items-center justify-between gap-2">
                    <Text
                        className={`text-[13px] flex-1 ${hasUnread ? 'font-medium text-gray-700' : 'text-gray-500'}`}
                        numberOfLines={1}
                    >
                        {preview}
                    </Text>

                    {/* Unread Badge */}
                    {unreadCount && unreadCount > 0 ? (
                        <View className="min-w-[22px] h-[22px] rounded-full bg-purple-600 items-center justify-center px-1.5">
                            <Text className="text-[11px] text-white font-bold">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    ) : unread ? (
                        <View className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    avatar: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
