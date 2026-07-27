import type {
    Conversation,
    Message,
    SendMessageRequest,
    EditMessageRequest,
    CreateConversationRequest,
    UploadAttachmentResponse,
} from '@/features/messaging/domain/entities/messaging.type';

export interface IMessagingRepository {
    getConversations(): Promise<Conversation[]>;
    getConversationById(conversationId: string): Promise<Conversation>;
    getMessages(conversationId: string): Promise<Message[]>;
    getUnreadCount(conversationId: string): Promise<number>;
    createConversation(body?: CreateConversationRequest): Promise<Conversation>;
    getOrCreateConversation(participantId: string): Promise<Conversation>;
    deleteConversation(conversationId: string): Promise<void>;
    sendMessage(body?: SendMessageRequest): Promise<Message>;
    editMessage(messageId: string, body: EditMessageRequest): Promise<Message>;
    deleteMessage(messageId: string): Promise<void>;
    markMessageAsRead(messageId: string): Promise<void>;
    markConversationAsRead(conversationId: string): Promise<void>;
    uploadAttachment(formData: FormData): Promise<UploadAttachmentResponse>;
}
