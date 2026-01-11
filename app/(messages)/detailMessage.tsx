import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
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
import {
    useGetConversation,
    useGetMessages,
    useSendMessage,
    useEditMessage,
    useDeleteMessage,
    useMarkMessageAsRead,
    useMarkConversationAsRead,
} from '@/hooks/useMessagingApi';
import { useUploadFile } from '@/hooks/useStorageApi';
import { useMessagingStore } from '@/stores/messagingStore';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/services/socketService';
import type { ChatMessage } from '@/components/common/MessageBubble';

export default function DetailMessageScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ conversationId: string }>();
    const conversationId = params.conversationId;

    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id;

    const { onlineUsers, typingUsers, setActiveConversation } = useMessagingStore();
    const allTypingUsers = typingUsers[conversationId || ''] || [];
    const filteredTypingUsers = allTypingUsers.filter((userId) => userId !== currentUserId);

    const [messageText, setMessageText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Queries & Mutations
    const { data: conversation } = useGetConversation(conversationId || '');
    const { data: messages, isLoading, error } = useGetMessages(conversationId || '');
    const sendMessage = useSendMessage();
    const editMessage = useEditMessage();
    const deleteMessage = useDeleteMessage();
    const markAsRead = useMarkMessageAsRead();
    const markConversationAsRead = useMarkConversationAsRead();
    const uploadFile = useUploadFile();

    // Initialize socket and mark as read
    useEffect(() => {
        if (conversationId) {
            setActiveConversation(conversationId);
            socketService.joinConversation(conversationId);
            markConversationAsRead.mutate(conversationId);
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
    }, [conversationId]);

    // Mark latest message as read
    useEffect(() => {
        if (conversationId && messages && messages.length > 0) {
            const latestMessage = messages[0];
            if (latestMessage.senderId !== currentUserId) {
                markAsRead.mutate({ messageId: latestMessage.id, conversationId });
            }
        }
    }, [messages, conversationId, currentUserId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messages && messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !conversationId) return;

        try {
            if (editingMessageId) {
                await editMessage.mutateAsync({
                    messageId: editingMessageId,
                    body: { content: messageText.trim() },
                });

                Toast.show({
                    type: 'success',
                    text1: 'Đã chỉnh sửa tin nhắn',
                });

                setEditingMessageId(null);
                setMessageText('');
                socketService.stopTyping(conversationId);
                return;
            }

            await sendMessage.mutateAsync({
                conversationId,
                content: messageText.trim(),
            });

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

                const uploadResult = await uploadFile.mutateAsync(formData);

                await sendMessage.mutateAsync({
                    conversationId,
                    content: messageText.trim() || '',
                    attachmentUrl: uploadResult.url,
                    attachmentType: 'image',
                });

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
        const message = messages?.find((m) => m.id === selectedMessageId);
        if (message && !message.isDeleted) {
            setEditingMessageId(selectedMessageId);
            setMessageText(message.content);
        }
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessageId || !conversationId) return;

        try {
            await deleteMessage.mutateAsync({ messageId: selectedMessageId, conversationId });

            Toast.show({
                type: 'success',
                text1: 'Đã xóa tin nhắn',
            });
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
        const message = messages?.find((m) => m.id === selectedMessageId);
        if (message && !message.isDeleted) {
            await Clipboard.setStringAsync(message.content);
            Toast.show({
                type: 'success',
                text1: 'Đã sao chép tin nhắn',
            });
        }
    };

    const goBack = () => {
        router.back();
    };

    // Get other user info from conversation participants
    const otherUser = useMemo(() => {
        if (!conversation?.participants) return null;

        // Find the participant who is not the current user
        const otherParticipant = conversation.participants.find(
            (participant) => participant.id !== currentUserId
        );

        return otherParticipant || null;
    }, [conversation, currentUserId]);

    const isOtherUserOnline = otherUser?.id ? onlineUsers.includes(otherUser.id) : false;

    // Transform messages
    const chatMessages: ChatMessage[] = useMemo(() => {
        if (!messages) return [];
        return [...messages].reverse().map((msg) => ({
            id: msg.id,
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            side: msg.senderId === currentUserId ? 'right' : 'left',
            avatarSource: msg.sender.avatarUrl
                ? { uri: msg.sender.avatarUrl }
                : require('@/assets/images/user-default.jpg'),
            attachmentUrl: msg.attachmentUrl,
            isEdited: msg.isEdited,
            isDeleted: msg.isDeleted,
            onLongPress: () => handleMessageLongPress(msg.id),
        }));
    }, [messages, currentUserId]);

    const selectedMessage = messages?.find((m) => m.id === selectedMessageId);
    const canEditSelected = selectedMessage?.senderId === currentUserId && !selectedMessage?.isDeleted;
    const canDeleteSelected = selectedMessage?.senderId === currentUserId && !selectedMessage?.isDeleted;

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

    if (error || !conversationId) {
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
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View className="flex-1">
                    {/* Header */}
                    <View className="flex-row items-center justify-center p-3">
                        <Pressable onPress={goBack} className="p-2">
                            <ChevronLeft size={20} color="#09090b" />
                        </Pressable>

                        <View className="relative">
                            <Image
                                source={
                                    otherUser?.avatarUrl
                                        ? { uri: otherUser.avatarUrl }
                                        : require('@/assets/images/user-default.jpg')
                                }
                                className="w-12 h-12 rounded-full"
                            />
                            {otherUser?.id && (
                                <OnlineIndicator userId={otherUser.id} size={14} position="bottom-right" />
                            )}
                        </View>

                        <View className="justify-center ml-2 flex-1">
                            <Text className="text-base font-semibold text-foreground">
                                {otherUser?.displayName || 'Unknown User'}
                            </Text>
                            {isOtherUserOnline && (
                                <Text
                                    className={`text-sm ${filteredTypingUsers.length > 0
                                        ? 'text-primary font-medium'
                                        : 'text-muted-foreground'
                                        }`}
                                >
                                    {filteredTypingUsers.length > 0 ? 'Đang nhập...' : 'Đang hoạt động'}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Separator */}
                    <View className="h-px bg-border mb-2" />

                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 24 }}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        <View className="gap-3 p-3">
                            {chatMessages.map((chat) => (
                                <MessageBubble key={chat.id} {...chat} />
                            ))}
                            {filteredTypingUsers.length > 0 && <TypingIndicator />}
                            {isUploading && (
                                <View className="items-center p-3">
                                    <ActivityIndicator size="small" color="#7C3BED" />
                                    <Text className="text-xs text-foreground mt-2">
                                        Đang tải ảnh lên...
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Editing indicator */}
                    {editingMessageId && (
                        <View className="flex-row px-4 py-2 bg-secondary items-center justify-between">
                            <Text className="text-sm text-foreground">
                                Đang chỉnh sửa tin nhắn...
                            </Text>
                            <Pressable onPress={handleCancelEdit}>
                                <Text className="text-sm text-primary font-semibold">Hủy</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Message Input */}
                    <MessageInput
                        value={messageText}
                        onChangeText={handleTextChange}
                        onSend={handleSendMessage}
                        onImagePick={handleImagePick}
                        disabled={isUploading}
                        placeholder={editingMessageId ? 'Edit message' : 'Send Message'}
                    />

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
