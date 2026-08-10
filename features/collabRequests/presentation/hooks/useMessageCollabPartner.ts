import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useGetOrCreateConversation } from '@/features/messaging/presentation/hooks/useMessagingApi';
import { useMessagingStore } from '@/features/messaging/presentation/store/messagingStore';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { counterpartOf } from '@/features/collabRequests/domain/utils/collabRequestHelpers';
import type { CollabRequest } from '@/features/collabRequests/domain/entities/collabRequest.type';

/**
 * Mở khung chat với đối tác của một đề nghị hợp tác đã ACCEPTED, kèm sẵn COLLAB_REF để
 * tin nhắn đầu tiên hiện ra dưới dạng thẻ hợp tác bên phía nhận.
 *
 * Người nhận LUÔN là bên còn lại (`counterpartOf`) — nếu lấy thẳng `sender` thì người gửi
 * đề nghị sẽ tự nhắn cho chính mình.
 */
export function useMessageCollabPartner() {
    const router = useRouter();
    const currentUserId = useAuthStore((s) => s.user?.id ?? '');
    const setPendingCollabRef = useMessagingStore((s) => s.setPendingCollabRef);
    const { mutate: getOrCreateConversation, isPending } = useGetOrCreateConversation();
    const { showError } = useToast();

    const messagePartner = useCallback(
        (item: CollabRequest) => {
            const partner = counterpartOf(item, currentUserId);
            if (!partner?.id) return;

            getOrCreateConversation(partner.id, {
                onSuccess: (conversation) => {
                    setPendingCollabRef(conversation.id, {
                        collaborationId: item.id,
                        defaultText: `Chào bạn, mình muốn trao đổi thêm về "${item.title}".`,
                    });
                    router.push(
                        `/(messages)/detailMessage?conversationId=${conversation.id}` as `${string}`,
                    );
                },
                onError: () => showError('Lỗi', 'Không thể mở cuộc trò chuyện'),
            });
        },
        [currentUserId, getOrCreateConversation, setPendingCollabRef, router, showError],
    );

    return { messagePartner, isOpening: isPending };
}
