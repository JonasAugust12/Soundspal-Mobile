import { apiClient, createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    Conversation,
    Message,
    SendMessageRequest,
    EditMessageRequest,
    CreateConversationRequest,
    UploadAttachmentResponse,
} from '@/features/messaging/domain/entities/messaging.type';

export const messagingRemoteDataSource = {
    getConversations: () => {
        return createApiCall<Conversation[]>('GET', '/conversations')();
    },

    getConversationById: (conversationId: string) => {
        return createApiCall<Conversation>('GET', `/conversations/${conversationId}`)();
    },

    getMessages: (conversationId: string) => {
        return createApiCall<Message[]>('GET', `/messages/conversation/${conversationId}`)();
    },

    getUnreadCount: (conversationId: string) => {
        return createApiCall<number>(
            'GET',
            `/messages/conversation/${conversationId}/unread-count`,
        )();
    },

    createConversation: createApiCall<Conversation, CreateConversationRequest>(
        'POST',
        '/conversations',
    ),

    getOrCreateConversation: (participantId: string) => {
        return createApiCall<Conversation, CreateConversationRequest>(
            'POST',
            '/conversations',
        )({
            name: 'TL-MESS',
            isGroup: false,
            participantIds: [participantId],
        });
    },

    deleteConversation: (conversationId: string) => {
        return createApiCall<void>('DELETE', `/conversations/${conversationId}`)();
    },

    sendMessage: createApiCall<Message, SendMessageRequest>('POST', '/messages'),

    editMessage: (messageId: string, body: EditMessageRequest) => {
        return createApiCall<Message, EditMessageRequest>('PUT', `/messages/${messageId}`)(body);
    },

    deleteMessage: (messageId: string) => {
        return createApiCall<void>('DELETE', `/messages/${messageId}`)();
    },

    markMessageAsRead: (messageId: string) => {
        return createApiCall<void>('POST', `/messages/${messageId}/read`)();
    },

    markConversationAsRead: (conversationId: string) => {
        return createApiCall<void>('POST', `/messages/conversation/${conversationId}/read`)();
    },

    // Upload ảnh/tệp đính kèm chat qua /storage/upload rồi lấy URL để gắn vào tin nhắn.
    // Dùng apiClient trực tiếp (không phải createApiCall) để giữ nguyên hành vi cũ của màn chat.
    uploadAttachment: async (formData: FormData): Promise<UploadAttachmentResponse> => {
        const response = await apiClient.post<UploadAttachmentResponse>(
            '/storage/upload',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return response.data;
    },
};
