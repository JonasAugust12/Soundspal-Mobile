import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { ChatItem } from '@/components/common';
import { useGetConversations } from '@/hooks/useMessagingApi';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/services/socketService';
import type { Conversation } from '@/types/messaging.type';

export default function MessagesScreen() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id;
    const { data: conversations, isLoading, error } = useGetConversations();

    // Ensure socket is connected for real-time updates
    useEffect(() => {
        if (!socketService.isConnected()) {
            socketService.connect();
        }
    }, []);

    const handleConversationPress = (conversationId: string) => {
        router.push({
            pathname: '/(messages)/detailMessage',
            params: { conversationId },
        });
    };

    const getOtherParticipant = (conversation: Conversation) => {
        if (conversation.isGroup) {
            return {
                id: undefined,
                name: conversation.name || 'Group Chat',
                avatarUrl: null,
            };
        }
        const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId);
        return {
            id: otherParticipant?.id,
            name: otherParticipant?.displayName || 'Unknown User',
            avatarUrl: otherParticipant?.avatarUrl,
        };
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 1) {
            return 'now';
        } else if (hours < 1) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        }
    };

    // Sort conversations by latest message
    const sortedConversations = useMemo(() => {
        if (!conversations) return [];
        return [...conversations].sort((a, b) => {
            const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [conversations]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                    <Text className="mt-4 text-foreground">Đang tải tin nhắn...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">Không thể tải tin nhắn</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1">
                {/* Header */}
                <View className="p-4 border-b border-border">
                    <Text className="text-2xl font-bold text-foreground">Tin nhắn</Text>
                </View>

                {/* Conversation List */}
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    <View className="p-3 gap-2">
                        {sortedConversations && sortedConversations.length > 0 ? (
                            sortedConversations.map((conversation) => {
                                const participant = getOtherParticipant(conversation);
                                const unreadCount = conversation.unreadCount || 0;

                                return (
                                    <ChatItem
                                        key={conversation.id}
                                        name={participant.name}
                                        preview={conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                                        avatarSource={
                                            participant.avatarUrl
                                                ? { uri: participant.avatarUrl }
                                                : require('@/assets/images/user-default.jpg')
                                        }
                                        time={
                                            conversation.lastMessage
                                                ? formatTime(conversation.lastMessage.createdAt)
                                                : undefined
                                        }
                                        unread={unreadCount > 0}
                                        unreadCount={unreadCount}
                                        userId={participant.id}
                                        onPress={() => handleConversationPress(conversation.id)}
                                    />
                                );
                            })
                        ) : (
                            <View className="items-center justify-center p-20">
                                <View className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-4">
                                    <MessageCircle size={40} color="#ea580c" />
                                </View>
                                <Text className="text-lg font-semibold text-foreground mb-2">
                                    Chưa có tin nhắn
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center">
                                    Bắt đầu trò chuyện với nghệ sĩ và nhà tổ chức
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
