import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { messagingRepository } from '@/features/messaging/data/repositories/MessagingRepositoryImpl';
import type { Conversation } from '@/features/messaging/domain/entities/messaging.type';
import {
    buildCollabReference,
    buildJobReference,
    getAttachmentTypeFromMimeType,
} from '@/features/messaging/domain/utils/messageContent';
import { useMessagingStore } from '@/features/messaging/presentation/store/messagingStore';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { socketService } from '@/shared/infrastructure/socket/socketService';

/**
 * Toàn bộ truy cập dữ liệu + realtime của MỘT hội thoại.
 *
 * Vì sao không dùng các hook React Query trong `useMessagingApi.ts`: màn chat lấy nguồn sự
 * thật từ `messagingStore` (Zustand) để socket đẩy tin nhắn/typing/online vào thẳng store.
 * Nếu vừa dùng React Query vừa dùng store sẽ có HAI cache tranh nhau. Hook này giữ mô hình
 * store + socket, đồng thời là nơi duy nhất chạm tới repository — màn hình chỉ còn lo UI.
 */

const TYPING_TIMEOUT_MS = 3000;

export interface AttachmentDraft {
    uri: string;
    name: string;
    mimeType: string;
    /** Nội dung người dùng đang gõ, gửi kèm tệp (có thể rỗng). */
    caption: string;
}

export function useConversationMessages(conversationId: string | undefined) {
    const { user: currentUser } = useAuthStore();
    const currentUserId = currentUser?.id;

    const {
        typingUsers,
        loadingMessages,
        setActiveConversation,
        setMessages,
        addMessage,
        updateMessage,
        removeMessage,
        setLoadingMessages,
        hasMessages,
        clearUnread,
        getMessages,
        isUserOnline,
        pendingJobRefs,
        clearPendingJobRef,
        pendingCollabRefs,
        clearPendingCollabRef,
    } = useMessagingStore();

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const pendingJobRef = pendingJobRefs[conversationId || ''];
    const pendingCollabRef = pendingCollabRefs[conversationId || ''];
    const messages = getMessages(conversationId || '');
    const isLoadingMessages = loadingMessages[conversationId || ''] || false;
    const allTypingUsers = typingUsers[conversationId || ''] || [];
    const typingUserIds = allTypingUsers.filter((userId) => userId !== currentUserId);

    // ── Nạp dữ liệu ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (!conversationId) return;

        const fetchConversation = async () => {
            try {
                const data = await messagingRepository.getConversationById(conversationId);
                setConversation(data);
            } catch (error) {
                console.error('Failed to fetch conversation:', error);
            }
        };

        fetchConversation();
    }, [conversationId]);

    /**
     * Hiển thị cache ngay cho mượt, nhưng LUÔN gọi lại API.
     *
     * Không được tin vào cache: socket bị ngắt khi app xuống nền (để backend coi là
     * offline mà gửi push — xem SocketProvider), nên mọi tin nhắn đến trong lúc đó
     * KHÔNG về qua socket. Nếu chỉ đọc cache thì mở chat từ thông báo sẽ không thấy
     * chính tin nhắn vừa được báo.
     */
    const fetchMessages = useCallback(async () => {
        if (!conversationId) return;

        const hasCache = hasMessages(conversationId);
        if (!hasCache) setLoadingMessages(conversationId, true);

        try {
            const data = await messagingRepository.getMessages(conversationId);
            setMessages(conversationId, data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            if (!hasCache) setLoadingMessages(conversationId, false);
        }
    }, [conversationId, hasMessages, setMessages, setLoadingMessages]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Đang mở sẵn màn chat rồi app xuống nền → lúc quay lại cũng phải fetch lại,
    // vì socket đã ngắt nên không nhận được tin nhắn đến trong lúc đó.
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') fetchMessages();
        });

        return () => subscription.remove();
    }, [fetchMessages]);

    // ── Vòng đời hội thoại (socket room + đánh dấu đã đọc) ────────────────────

    useEffect(() => {
        if (conversationId) {
            setActiveConversation(conversationId);
            socketService.joinConversation(conversationId);
            clearUnread(conversationId);

            messagingRepository.markConversationAsRead(conversationId).catch(console.error);
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

    // ── Hành động (ném lỗi ra ngoài để màn hình tự hiển thị Toast) ────────────

    const sendMessage = useCallback(
        async (text: string) => {
            if (!conversationId) return;

            // Tin đầu tiên của cuộc trò chuyện mở từ job / đề nghị hợp tác được bọc thành
            // JOB_REF / COLLAB_REF để phía nhận thấy thẻ thông tin (khớp web). Chỉ có tối đa
            // một loại pending cho mỗi hội thoại; job ref được ưu tiên nếu cả hai cùng tồn tại.
            const content = pendingJobRef
                ? buildJobReference(pendingJobRef.jobData, text)
                : pendingCollabRef
                  ? buildCollabReference(pendingCollabRef.collaborationId, text)
                  : text;

            const sent = await messagingRepository.sendMessage({ conversationId, content });

            addMessage(conversationId, sent);
            if (pendingJobRef) clearPendingJobRef(conversationId);
            else if (pendingCollabRef) clearPendingCollabRef(conversationId);
        },
        [
            conversationId,
            pendingJobRef,
            pendingCollabRef,
            addMessage,
            clearPendingJobRef,
            clearPendingCollabRef,
        ],
    );

    const editMessage = useCallback(
        async (messageId: string, content: string) => {
            if (!conversationId) return;

            const updated = await messagingRepository.editMessage(messageId, { content });

            updateMessage(conversationId, messageId, {
                content: updated.content,
                isEdited: true,
            });
        },
        [conversationId, updateMessage],
    );

    const deleteMessage = useCallback(
        async (messageId: string) => {
            if (!conversationId) return;

            await messagingRepository.deleteMessage(messageId);
            removeMessage(conversationId, messageId);
        },
        [conversationId, removeMessage],
    );

    const sendAttachment = useCallback(
        async ({ uri, name, mimeType, caption }: AttachmentDraft) => {
            if (!conversationId) return;

            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', {
                    uri,
                    type: mimeType,
                    name,
                } as unknown as Blob);
                formData.append('folder', 'messages');

                const { url } = await messagingRepository.uploadAttachment(formData);

                const sent = await messagingRepository.sendMessage({
                    conversationId,
                    content: caption,
                    attachmentUrl: url,
                    attachmentType: getAttachmentTypeFromMimeType(mimeType),
                });

                addMessage(conversationId, sent);
            } finally {
                setIsUploading(false);
            }
        },
        [conversationId, addMessage],
    );

    // ── Typing ───────────────────────────────────────────────────────────────

    const stopTyping = useCallback(() => {
        if (!conversationId) return;
        socketService.stopTyping(conversationId);
    }, [conversationId]);

    const notifyTyping = useCallback(
        (text: string) => {
            if (!conversationId) return;

            if (text.length > 0) {
                socketService.startTyping(conversationId);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                typingTimeoutRef.current = setTimeout(() => {
                    socketService.stopTyping(conversationId);
                }, TYPING_TIMEOUT_MS);
            } else {
                socketService.stopTyping(conversationId);
            }
        },
        [conversationId],
    );

    // ── Người đối diện ───────────────────────────────────────────────────────

    const otherUser = useMemo(() => {
        if (!conversation?.participants) return null;
        return conversation.participants.find((p) => p.id !== currentUserId) || null;
    }, [conversation, currentUserId]);

    const isOtherUserOnline = otherUser?.id ? isUserOnline(otherUser.id) : false;

    return {
        // Dữ liệu
        conversation,
        otherUser,
        isOtherUserOnline,
        messages,
        isLoadingMessages,
        isUploading,
        typingUserIds,
        pendingJobRef,
        pendingCollabRef,
        // Hành động
        sendMessage,
        editMessage,
        deleteMessage,
        sendAttachment,
        notifyTyping,
        stopTyping,
    };
}
