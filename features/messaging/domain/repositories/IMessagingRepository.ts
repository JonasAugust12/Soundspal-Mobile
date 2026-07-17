import type { messagingRemoteDataSource } from '@/features/messaging/data/datasources/messagingRemoteDataSource';

export interface IMessagingRepository {
    getConversations(
        ...args: Parameters<typeof messagingRemoteDataSource.getConversations>
    ): ReturnType<typeof messagingRemoteDataSource.getConversations>;
    getConversationById(
        ...args: Parameters<typeof messagingRemoteDataSource.getConversationById>
    ): ReturnType<typeof messagingRemoteDataSource.getConversationById>;
    getMessages(
        ...args: Parameters<typeof messagingRemoteDataSource.getMessages>
    ): ReturnType<typeof messagingRemoteDataSource.getMessages>;
    getUnreadCount(
        ...args: Parameters<typeof messagingRemoteDataSource.getUnreadCount>
    ): ReturnType<typeof messagingRemoteDataSource.getUnreadCount>;
    createConversation(
        ...args: Parameters<typeof messagingRemoteDataSource.createConversation>
    ): ReturnType<typeof messagingRemoteDataSource.createConversation>;
    getOrCreateConversation(
        ...args: Parameters<typeof messagingRemoteDataSource.getOrCreateConversation>
    ): ReturnType<typeof messagingRemoteDataSource.getOrCreateConversation>;
    deleteConversation(
        ...args: Parameters<typeof messagingRemoteDataSource.deleteConversation>
    ): ReturnType<typeof messagingRemoteDataSource.deleteConversation>;
    sendMessage(
        ...args: Parameters<typeof messagingRemoteDataSource.sendMessage>
    ): ReturnType<typeof messagingRemoteDataSource.sendMessage>;
    editMessage(
        ...args: Parameters<typeof messagingRemoteDataSource.editMessage>
    ): ReturnType<typeof messagingRemoteDataSource.editMessage>;
    deleteMessage(
        ...args: Parameters<typeof messagingRemoteDataSource.deleteMessage>
    ): ReturnType<typeof messagingRemoteDataSource.deleteMessage>;
    markMessageAsRead(
        ...args: Parameters<typeof messagingRemoteDataSource.markMessageAsRead>
    ): ReturnType<typeof messagingRemoteDataSource.markMessageAsRead>;
    markConversationAsRead(
        ...args: Parameters<typeof messagingRemoteDataSource.markConversationAsRead>
    ): ReturnType<typeof messagingRemoteDataSource.markConversationAsRead>;
}
