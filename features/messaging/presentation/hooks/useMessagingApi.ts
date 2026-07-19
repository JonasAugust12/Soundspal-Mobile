import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagingRepository } from '@/features/messaging/data/repositories/MessagingRepositoryImpl';
import type { EditMessageRequest } from '@/features/messaging/domain/entities/messaging.type';

export const messagingKeys = {
    all: ['messaging'] as const,
    conversations: () => [...messagingKeys.all, 'conversations'] as const,
    conversation: (conversationId: string) =>
        [...messagingKeys.all, 'conversation', conversationId] as const,
    messages: (conversationId: string) =>
        [...messagingKeys.all, 'messages', conversationId] as const,
    unreadCount: (conversationId: string) =>
        [...messagingKeys.all, 'unread', conversationId] as const,
};

export const useGetConversations = () => {
    return useQuery({
        queryKey: messagingKeys.conversations(),
        queryFn: () => messagingRepository.getConversations(),
        staleTime: 30000, // 30 seconds
    });
};

export const useGetConversation = (conversationId: string) => {
    return useQuery({
        queryKey: messagingKeys.conversation(conversationId),
        queryFn: () => messagingRepository.getConversationById(conversationId),
        enabled: !!conversationId,
        staleTime: 30000, // 30 seconds
    });
};

export const useGetMessages = (conversationId: string) => {
    return useQuery({
        queryKey: messagingKeys.messages(conversationId),
        queryFn: () => messagingRepository.getMessages(conversationId),
        enabled: !!conversationId,
        staleTime: 10000, // 10 seconds
    });
};

export const useGetUnreadCount = (conversationId: string) => {
    return useQuery({
        queryKey: messagingKeys.unreadCount(conversationId),
        queryFn: () => messagingRepository.getUnreadCount(conversationId),
        enabled: !!conversationId,
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: messagingRepository.sendMessage,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.messages(data.conversationId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversations(),
            });
        },
    });
};

export const useEditMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, body }: { messageId: string; body: EditMessageRequest }) =>
            messagingRepository.editMessage(messageId, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.messages(data.conversationId),
            });
        },
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            messageId,
            conversationId: _conversationId,
        }: {
            messageId: string;
            conversationId: string;
        }) => messagingRepository.deleteMessage(messageId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.messages(variables.conversationId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversations(),
            });
        },
    });
};

export const useMarkMessageAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            messageId,
            conversationId: _conversationId,
        }: {
            messageId: string;
            conversationId: string;
        }) => messagingRepository.markMessageAsRead(messageId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.unreadCount(variables.conversationId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversations(),
            });
        },
    });
};

export const useMarkConversationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: messagingRepository.markConversationAsRead,
        onSuccess: (_, conversationId) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.unreadCount(conversationId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversations(),
            });
        },
    });
};

export const useGetOrCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (participantId: string) =>
            messagingRepository.getOrCreateConversation(participantId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversations(),
            });
        },
    });
};

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: messagingRepository.deleteConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.conversations(),
            });
        },
    });
};
