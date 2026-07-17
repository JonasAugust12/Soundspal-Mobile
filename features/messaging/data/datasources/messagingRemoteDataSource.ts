import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    Conversation,
    Message,
    SendMessageRequest,
    EditMessageRequest,
    CreateConversationRequest,
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
};
