import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Platform,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import {
    useReanimatedKeyboardAnimation,
    KeyboardController,
    AndroidSoftInputModes,
} from 'react-native-keyboard-controller';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

import {
    MessageBubble,
    MessageInput,
    MessageActionSheet,
    OnlineIndicator,
    TypingIndicator,
} from '@/shared/presentation/ui';
import { useConversationMessages } from '@/features/messaging/presentation/hooks/useConversationMessages';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import type { ChatMessage } from '@/shared/presentation/ui/MessageBubble';
import {
    isStructuredReference,
    isMessageSeenBy,
} from '@/features/messaging/domain/utils/messageContent';

export default function DetailMessageScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ conversationId: string }>();
    const conversationId = params.conversationId;

    // SCREEN_SAFE_AREA_EDGES bỏ cạnh 'bottom' (các màn trong tabs đã có tab bar lo phần đáy).
    // Màn này là stack screen có ô nhập cố định ở đáy → phải tự chừa chỗ cho thanh điều hướng,
    // nếu không ô nhập sẽ bị nav bar đè (app bật edgeToEdgeEnabled).
    const insets = useSafeAreaInsets();

    // Bàn phím che ô nhập — cách xử lý TẤT ĐỊNH:
    // Ép cửa sổ sang chế độ adjustNothing khi ở màn này (cửa sổ KHÔNG tự resize), tránh việc
    // edge-to-edge chỉ resize một phần khiến lúc thì che ô nhập, lúc thì đẩy quá cao / lộ khoảng
    // trắng. Rồi TỰ đẩy nội dung lên bằng "khoảng đệm ảo" cao đúng bằng bàn phím → chính xác trên
    // cả Android lẫn iOS. Khôi phục chế độ mặc định khi rời màn.
    const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
    useEffect(() => {
        KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING);
        return () => KeyboardController.setDefaultMode();
    }, []);
    const keyboardSpacerStyle = useAnimatedStyle(() => ({
        height: Math.abs(keyboardHeight.value),
    }));

    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id;

    const {
        otherUser,
        isOtherUserOnline,
        messages,
        isLoadingMessages,
        isUploading,
        typingUserIds,
        pendingJobRef,
        pendingCollabRef,
        sendMessage,
        editMessage,
        deleteMessage,
        sendAttachment,
        notifyTyping,
        stopTyping,
    } = useConversationMessages(conversationId);

    const [messageText, setMessageText] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Khi bàn phím mở, khoảng đệm ảo đẩy nội dung lên nên tin nhắn mới nhất có thể bị khuất —
    // cuộn xuống đáy để luôn thấy tin cuối ngay trên ô nhập. Đồng thời theo dõi trạng thái bàn
    // phím để RÚT NGẮN padding đáy của ô nhập khi bị đẩy lên (không cần chừa chỗ nav bar nữa).
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true);
            requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({ animated: true }));
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    // Prefill composer with a default message when opening from a job (JOB_REF flow)
    // or from an accepted collaboration request (COLLAB_REF flow).
    useEffect(() => {
        const defaultText = pendingJobRef?.defaultText ?? pendingCollabRef?.defaultText;
        if (defaultText) {
            setMessageText((prev) => (prev.length === 0 ? defaultText : prev));
        }
    }, [pendingJobRef, pendingCollabRef]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !conversationId) return;

        try {
            if (editingMessageId) {
                await editMessage(editingMessageId, messageText.trim());

                Toast.show({ type: 'success', text1: 'Đã chỉnh sửa tin nhắn' });
                setEditingMessageId(null);
                setMessageText('');
                stopTyping();
                return;
            }

            await sendMessage(messageText.trim());
            setMessageText('');
            stopTyping();
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
                const asset = result.assets[0];

                await sendAttachment({
                    uri: asset.uri,
                    name: 'image.jpg',
                    mimeType: 'image/jpeg',
                    caption: messageText.trim() || '',
                });

                setMessageText('');
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            Toast.show({
                type: 'error',
                text1: 'Không thể tải ảnh lên',
                text2: 'Vui lòng thử lại',
            });
        }
    };

    const handleFilePick = async () => {
        if (!conversationId) return;

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled || !result.assets?.[0]) return;
            const asset = result.assets[0];

            // Backend caps attachments at 10 MB
            if (asset.size && asset.size > 10 * 1024 * 1024) {
                Toast.show({
                    type: 'error',
                    text1: 'Tệp quá lớn',
                    text2: 'Vui lòng chọn tệp dưới 10MB',
                });
                return;
            }

            await sendAttachment({
                uri: asset.uri,
                name: asset.name || 'file',
                mimeType: asset.mimeType || 'application/octet-stream',
                caption: messageText.trim() || '',
            });

            setMessageText('');
        } catch (error) {
            console.error('Failed to upload file:', error);
            Toast.show({
                type: 'error',
                text1: 'Không thể tải tệp lên',
                text2: 'Vui lòng thử lại',
            });
        }
    };

    const handleTextChange = (text: string) => {
        setMessageText(text);

        if (editingMessageId) return;

        notifyTyping(text);
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
            await deleteMessage(selectedMessageId);
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
            attachmentType: msg.attachmentType,
            isEdited: msg.isEdited,
            isDeleted: msg.isDeleted,
            onLongPress: () => handleMessageLongPress(msg.id),
        }));
    }, [messages, currentUserId]);

    // Last own message the other participant has read → drives the "Đã xem" row
    const lastSeenOwnMessageId = useMemo(() => {
        if (!otherUser?.id) return null;
        for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (m.senderId === currentUserId && !m.isDeleted && isMessageSeenBy(m, otherUser.id)) {
                return m.id;
            }
        }
        return null;
    }, [messages, otherUser?.id, currentUserId]);

    const selectedMessage = messages.find((m) => m.id === selectedMessageId);
    // Sửa/xoá tin JOB_REF / COLLAB_REF sẽ để lộ payload thô `:::..:::` trong ô nhập → khoá lại.
    // Tệp đính kèm cũng không sửa được.
    const selectedIsStructuredRef = selectedMessage
        ? isStructuredReference(selectedMessage.content)
        : false;
    const isSelectedOwn = selectedMessage?.senderId === currentUserId;
    const canEditSelected =
        isSelectedOwn &&
        !selectedMessage?.isDeleted &&
        !selectedIsStructuredRef &&
        !selectedMessage?.attachmentUrl;
    const canDeleteSelected =
        isSelectedOwn && !selectedMessage?.isDeleted && !selectedIsStructuredRef;

    if (isLoadingMessages && messages.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={SCREEN_SAFE_AREA_EDGES}>
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
            <SafeAreaView className="flex-1 bg-white" edges={SCREEN_SAFE_AREA_EDGES}>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">Không thể tải tin nhắn</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={SCREEN_SAFE_AREA_EDGES}>
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
                            {otherUser?.id && <OnlineIndicator userId={otherUser.id} size={14} />}
                        </TouchableOpacity>

                        {/* User Info */}
                        <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                {otherUser?.displayName || 'Unknown User'}
                            </Text>
                            <View className="flex-row items-center gap-1">
                                {typingUserIds.length > 0 ? (
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
                                    <Text className="text-xs text-gray-400">Ngoại tuyến</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
                    onContentSizeChange={() =>
                        scrollViewRef.current?.scrollToEnd({ animated: true })
                    }
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

                        {/* Seen indicator */}
                        {lastSeenOwnMessageId && otherUser && (
                            <View className="flex-row items-center justify-end gap-1.5 mt-1 pr-1">
                                <Text className="text-[11px] font-medium text-gray-500">
                                    Đã xem
                                </Text>
                                <Image
                                    source={
                                        otherUser.avatarUrl
                                            ? { uri: otherUser.avatarUrl }
                                            : require('@/assets/images/user-default.jpg')
                                    }
                                    className="w-4 h-4 rounded-full"
                                />
                            </View>
                        )}

                        {typingUserIds.length > 0 && <TypingIndicator />}
                        {isUploading && (
                            <View className="items-start p-3">
                                <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center gap-2">
                                    <ActivityIndicator size="small" color="#7C3BED" />
                                    <Text className="text-xs text-gray-500">Đang tải ảnh...</Text>
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
                                <Text className="text-xs font-semibold text-purple-600">
                                    Chỉnh sửa tin nhắn
                                </Text>
                                <Text className="text-xs text-gray-500" numberOfLines={1}>
                                    {messages.find((m) => m.id === editingMessageId)?.content}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleCancelEdit}>
                            <Text className="text-sm text-purple-600 font-bold">Hủy</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Message Input */}
                <View
                    style={[
                        styles.inputContainer,
                        // Bàn phím đóng: chừa chỗ nav bar. Bàn phím mở: khoảng đệm ảo đã đẩy ô nhập
                        // lên sát bàn phím rồi → rút ngắn padding đáy cho gọn.
                        { paddingBottom: isKeyboardVisible ? 8 : Math.max(insets.bottom, 8) },
                    ]}
                    className="bg-white border-t border-gray-100"
                >
                    <MessageInput
                        value={messageText}
                        onChangeText={handleTextChange}
                        onSend={handleSendMessage}
                        onImagePick={handleImagePick}
                        onFilePick={handleFilePick}
                        disabled={isUploading}
                        placeholder={
                            editingMessageId ? 'Chỉnh sửa tin nhắn...' : 'Nhập tin nhắn...'
                        }
                    />
                </View>

                {/* Khoảng đệm ảo: cao bằng bàn phím → đẩy ô nhập + danh sách lên trên bàn phím
                    (cửa sổ đang ở adjustNothing nên không tự co, khoảng đệm này lo toàn bộ). */}
                <Reanimated.View style={keyboardSpacerStyle} />

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
