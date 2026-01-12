import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Image, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Phone, Video } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import {
    MessageBubble,
    MessageInput,
    MessageActionSheet,
    OnlineIndicator,
    TypingIndicator,
} from '@/components/common';
import { useMessagingStore } from '@/stores/messagingStore';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/services/socketService';
import { apiClient } from '@/lib/apiClient';
import type { ChatMessage } from '@/components/common/MessageBubble';
import type { Message, Conversation } from '@/types/messaging.type';

export default function DetailMessageScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ conversationId: string }>();
    const conversationId = params.conversationId;

    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id;

    // Read from store
    const {
        onlineUsers,
        typingUsers,
        messagesByConversation,
        loadingMessages,
        conversations,
        setActiveConversation,
        setMessages,
        addMessage,
        updateMessage,
        removeMessage,
        setLoadingMessages,
        hasMessages,
        clearUnread,
    } = useMessagingStore();

    const messages = messagesByConversation[conversationId || ''] || [];
    const isLoadingMessages = loadingMessages[conversationId || ''] || false;
    const allTypingUsers = typingUsers[conversationId || ''] || [];
    const filteredTypingUsers = allTypingUsers.filter((userId) => userId !== currentUserId);

    const [messageText, setMessageText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch conversation details
    useEffect(() => {
        if (!conversationId) return;

        const fetchConversation = async () => {
            try {
                const response = await apiClient.get<Conversation>(`/conversations/${conversationId}`);
                setConversation(response.data);
            } catch (error) {
                console.error('Failed to fetch conversation:', error);
            }
        };

        fetchConversation();
    }, [conversationId]);

    // Fetch messages if not in cache
    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            if (hasMessages(conversationId)) {
                console.log('📦 Using cached messages for:', conversationId);
                return;
            }

            console.log('📡 Fetching messages for:', conversationId);
            setLoadingMessages(conversationId, true);

            try {
                const response = await apiClient.get<Message[]>(`/messages/conversation/${conversationId}`);
                setMessages(conversationId, response.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setLoadingMessages(conversationId, false);
            }
        };

        fetchMessages();
    }, [conversationId, hasMessages, setMessages, setLoadingMessages]);

    // Initialize socket and clear unread
    useEffect(() => {
        if (conversationId) {
            setActiveConversation(conversationId);
            socketService.joinConversation(conversationId);
            clearUnread(conversationId);

            apiClient.post(`/messages/conversation/${conversationId}/read`).catch(console.error);
        }

        return () => {
            if (conversationId) {
                socketService.leaveConversation(conversationId);
                socketService.stopTyping(conversationId);
            }
            setActiveConversation(null);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [conversationId, setActiveConversation, clearUnread]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !conversationId) return;

        try {
            if (editingMessageId) {
                const response = await apiClient.put<Message>(`/messages/${editingMessageId}`, {
                    content: messageText.trim(),
                });

                updateMessage(conversationId, editingMessageId, {
                    content: response.data.content,
                    isEdited: true,
                });

                Toast.show({ type: 'success', text1: 'Đã chỉnh sửa tin nhắn' });
                setEditingMessageId(null);
                setMessageText('');
                socketService.stopTyping(conversationId);
                return;
            }

            const response = await apiClient.post<Message>('/messages', {
                conversationId,
                content: messageText.trim(),
            });

            addMessage(conversationId, response.data);
            setMessageText('');
            socketService.stopTyping(conversationId);
        } catch (error) {
            console.error('Failed to send message:', error);
            Toast.show({
                type: 'error',
                text1: editingMessageId ? 'Không thể chỉnh sửa' : 'Không thể gửi tin nhắn',
                text2: 'Vui lòng thử lại',
            });
        }
    };

    const handleImagePick = async () => {
        if (!conversationId) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploading(true);
                const asset = result.assets[0];

                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri,
                    type: 'image/jpeg',
                    name: 'image.jpg',
                } as any);
                formData.append('folder', 'messages');

                const uploadResponse = await apiClient.post<{ url: string }>('/storage/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const messageResponse = await apiClient.post<Message>('/messages', {
                    conversationId,
                    content: messageText.trim() || '',
                    attachmentUrl: uploadResponse.data.url,
                    attachmentType: 'image',
                });

                addMessage(conversationId, messageResponse.data);
                setMessageText('');
                setIsUploading(false);
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            setIsUploading(false);
            Toast.show({
                type: 'error',
                text1: 'Không thể tải ảnh lên',
                text2: 'Vui lòng thử lại',
            });
        }
    };

    const handleTextChange = (text: string) => {
        setMessageText(text);

        if (editingMessageId || !conversationId) return;

        if (text.length > 0) {
            socketService.startTyping(conversationId);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socketService.stopTyping(conversationId);
            }, 3000);
        } else {
            socketService.stopTyping(conversationId);
        }
    };

    const handleMessageLongPress = (messageId: string) => {
        setSelectedMessageId(messageId);
        setShowActionSheet(true);
    };

    const handleEditMessage = () => {
        const message = messages.find((m) => m.id === selectedMessageId);
        if (message && !message.isDeleted) {
            setEditingMessageId(selectedMessageId);
            setMessageText(message.content);
        }
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessageId || !conversationId) return;

        try {
            await apiClient.delete(`/messages/${selectedMessageId}`);
            removeMessage(conversationId, selectedMessageId);
            Toast.show({ type: 'success', text1: 'Đã xóa tin nhắn' });
        } catch (error) {
            console.error('Failed to delete message:', error);
            Toast.show({
                type: 'error',
                text1: 'Không thể xóa tin nhắn',
                text2: 'Vui lòng thử lại',
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setMessageText('');
    };

    const handleCopyMessage = async () => {
        const message = messages.find((m) => m.id === selectedMessageId);
        if (message && !message.isDeleted) {
            await Clipboard.setStringAsync(message.content);
            Toast.show({ type: 'success', text1: 'Đã sao chép tin nhắn' });
        }
    };

    const goBack = () => {
        router.back();
    };

    // Get other user from conversation
    const otherUser = useMemo(() => {
        if (!conversation?.participants) return null;
        return conversation.participants.find((p) => p.id !== currentUserId) || null;
    }, [conversation, currentUserId]);

    const isOtherUserOnline = otherUser?.id ? onlineUsers.includes(otherUser.id) : false;

    // Transform messages for display
    const chatMessages: ChatMessage[] = useMemo(() => {
        return messages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            side: msg.senderId === currentUserId ? 'right' : 'left',
            avatarSource: msg.sender?.avatarUrl
                ? { uri: msg.sender.avatarUrl }
                : require('@/assets/images/user-default.jpg'),
            attachmentUrl: msg.attachmentUrl,
            isEdited: msg.isEdited,
            isDeleted: msg.isDeleted,
            onLongPress: () => handleMessageLongPress(msg.id),
        }));
    }, [messages, currentUserId]);

    const selectedMessage = messages.find((m) => m.id === selectedMessageId);
    const canEditSelected = selectedMessage?.senderId === currentUserId && !selectedMessage?.isDeleted;
    const canDeleteSelected = selectedMessage?.senderId === currentUserId && !selectedMessage?.isDeleted;

    if (isLoadingMessages && messages.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-4">
                        <ActivityIndicator size="large" color="#7C3BED" />
                    </View>
                    <Text className="text-gray-600 font-medium">Đang tải tin nhắn...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!conversationId) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">Không thể tải tin nhắn</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View className="flex-1">
                    {/* Premium Header */}
                    <View style={styles.header} className="bg-white px-4 py-3">
                        <View className="flex-row items-center">
                            {/* Back Button */}
                            <TouchableOpacity
                                onPress={goBack}
                                className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3"
                            >
                                <ChevronLeft size={22} color="#374151" />
                            </TouchableOpacity>

                            {/* Avatar with Online Indicator */}
                            <TouchableOpacity className="relative mr-3">
                                <Image
                                    source={
                                        otherUser?.avatarUrl
                                            ? { uri: otherUser.avatarUrl }
                                            : require('@/assets/images/user-default.jpg')
                                    }
                                    className="w-11 h-11 rounded-full"
                                />
                                {isOtherUserOnline && (
                                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                                )}
                            </TouchableOpacity>

                            {/* User Info */}
                            <View className="flex-1">
                                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                    {otherUser?.displayName || 'Unknown User'}
                                </Text>
                                <View className="flex-row items-center gap-1">
                                    {filteredTypingUsers.length > 0 ? (
                                        <Text className="text-xs font-medium text-purple-600">
                                            Đang nhập...
                                        </Text>
                                    ) : isOtherUserOnline ? (
                                        <>
                                            <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <Text className="text-xs text-gray-500">
                                                Đang hoạt động
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-xs text-gray-400">
                                            Ngoại tuyến
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row gap-1">
                                <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                                    <Phone size={18} color="#7C3BED" />
                                </TouchableOpacity>
                                <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                                    <Video size={18} color="#7C3BED" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1"
                        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Date Separator */}
                        {chatMessages.length > 0 && (
                            <View className="items-center mb-4">
                                <View className="bg-gray-200 px-3 py-1 rounded-full">
                                    <Text className="text-xs text-gray-500 font-medium">Hôm nay</Text>
                                </View>
                            </View>
                        )}

                        <View className="gap-2">
                            {chatMessages.map((chat) => (
                                <MessageBubble key={chat.id} {...chat} />
                            ))}
                            {filteredTypingUsers.length > 0 && <TypingIndicator />}
                            {isUploading && (
                                <View className="items-start p-3">
                                    <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center gap-2">
                                        <ActivityIndicator size="small" color="#7C3BED" />
                                        <Text className="text-xs text-gray-500">
                                            Đang tải ảnh...
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Editing indicator */}
                    {editingMessageId && (
                        <View className="flex-row px-4 py-3 bg-purple-50 items-center justify-between border-t border-purple-100">
                            <View className="flex-row items-center gap-2">
                                <View className="w-1 h-8 bg-purple-500 rounded-full" />
                                <View>
                                    <Text className="text-xs font-semibold text-purple-600">Chỉnh sửa tin nhắn</Text>
                                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                                        {messages.find(m => m.id === editingMessageId)?.content}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleCancelEdit}>
                                <Text className="text-sm text-purple-600 font-bold">Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Message Input */}
                    <View style={styles.inputContainer} className="bg-white border-t border-gray-100">
                        <MessageInput
                            value={messageText}
                            onChangeText={handleTextChange}
                            onSend={handleSendMessage}
                            onImagePick={handleImagePick}
                            disabled={isUploading}
                            placeholder={editingMessageId ? 'Chỉnh sửa tin nhắn...' : 'Nhập tin nhắn...'}
                        />
                    </View>

                    {/* Action Sheet */}
                    <MessageActionSheet
                        visible={showActionSheet}
                        onClose={() => setShowActionSheet(false)}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        onCopy={handleCopyMessage}
                        canEdit={canEditSelected ?? false}
                        canDelete={canDeleteSelected ?? false}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    inputContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});
