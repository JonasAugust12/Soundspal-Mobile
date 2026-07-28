import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingRepository } from '@/features/messaging/data/repositories/MessagingRepositoryImpl';

export const messagingKeys = {
    all: ['messaging'] as const,
    conversations: () => [...messagingKeys.all, 'conversations'] as const,
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
