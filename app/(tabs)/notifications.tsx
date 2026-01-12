import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { ChatItem } from '@/components/common';
import { useMessagingStore } from '@/stores/messagingStore';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/services/socketService';
import { apiClient } from '@/lib/apiClient';
import type { Conversation } from '@/types/messaging.type';

export default function MessagesScreen() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id;

    // Read from store
    const {
        conversations,
        unreadCounts,
        isLoadingConversations,
        setConversations,
        setLoadingConversations,
        getSortedConversations,
    } = useMessagingStore();

    // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
            setLoadingConversations(true);
            try {
                const response = await apiClient.get<Conversation[]>('/conversations');
                setConversations(response.data);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
    }, [setConversations, setLoadingConversations]);

    // Ensure socket is connected
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

        if (minutes < 1) return 'now';
        if (hours < 1) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const sortedConversations = getSortedConversations();

    if (isLoadingConversations && conversations.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                    <Text className="mt-4 text-foreground">Đang tải tin nhắn...</Text>
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
                        {sortedConversations.length > 0 ? (
                            sortedConversations.map((conversation) => {
                                const participant = getOtherParticipant(conversation);
                                const unreadCount = unreadCounts[conversation.id] || 0;

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
