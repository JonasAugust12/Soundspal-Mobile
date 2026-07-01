import type { IMessagingRepository } from '@/features/messaging/domain/repositories/IMessagingRepository';
import { messagingRemoteDataSource } from '@/features/messaging/data/datasources/messagingRemoteDataSource';

export class MessagingRepositoryImpl implements IMessagingRepository {
    getConversations = messagingRemoteDataSource.getConversations;
    getConversationById = messagingRemoteDataSource.getConversationById;
    getMessages = messagingRemoteDataSource.getMessages;
    getUnreadCount = messagingRemoteDataSource.getUnreadCount;
    createConversation = messagingRemoteDataSource.createConversation;
    getOrCreateConversation = messagingRemoteDataSource.getOrCreateConversation;
    deleteConversation = messagingRemoteDataSource.deleteConversation;
    sendMessage = messagingRemoteDataSource.sendMessage;
    editMessage = messagingRemoteDataSource.editMessage;
    deleteMessage = messagingRemoteDataSource.deleteMessage;
    markMessageAsRead = messagingRemoteDataSource.markMessageAsRead;
    markConversationAsRead = messagingRemoteDataSource.markConversationAsRead;
}

export const messagingRepository = new MessagingRepositoryImpl();
