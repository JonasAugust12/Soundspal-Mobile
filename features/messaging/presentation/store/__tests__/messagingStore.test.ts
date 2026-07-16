import { useMessagingStore } from '@/features/messaging/presentation/store/messagingStore';
import type { Message } from '@/features/messaging/domain/entities/messaging.type';

const CONV = 'conv-1';

function makeMessage(id: string, createdAt: string): Message {
    return {
        id,
        conversationId: CONV,
        senderId: 'user-1',
        content: `msg ${id}`,
        isEdited: false,
        isDeleted: false,
        createdAt,
        updatedAt: createdAt,
        sender: { id: 'user-1', username: 'u1', displayName: 'U1' },
    };
}

// API trả DESC (mới nhất trước) — xem messages.service.ts: .orderBy('message.createdAt', 'DESC')
const API_DESC: Message[] = [
    makeMessage('m3', '2026-07-16T19:35:00.000Z'),
    makeMessage('m2', '2026-07-16T19:15:00.000Z'),
    makeMessage('m1', '2026-07-15T23:07:00.000Z'),
];

const contentsOf = (conversationId: string) =>
    useMessagingStore
        .getState()
        .getMessages(conversationId)
        .map((m) => m.id);

describe('messagingStore — thứ tự tin nhắn', () => {
    beforeEach(() => {
        useMessagingStore.setState({ messagesById: {}, conversationMessages: {} });
    });

    describe('setMessages', () => {
        // Regression: store lưu nguyên thứ tự DESC của API → màn chat hiện ngược
        // (mới nhất trên đầu, cũ nhất dưới đáy).
        it('chuẩn hoá về CŨ → MỚI dù API trả DESC', () => {
            useMessagingStore.getState().setMessages(CONV, API_DESC);
            expect(contentsOf(CONV)).toEqual(['m1', 'm2', 'm3']);
        });

        it('giữ nguyên CŨ → MỚI khi input đã đúng thứ tự', () => {
            useMessagingStore.getState().setMessages(CONV, [...API_DESC].reverse());
            expect(contentsOf(CONV)).toEqual(['m1', 'm2', 'm3']);
        });

        it('không làm biến đổi mảng gốc của caller', () => {
            const input = [...API_DESC];
            useMessagingStore.getState().setMessages(CONV, input);
            expect(input.map((m) => m.id)).toEqual(['m3', 'm2', 'm1']);
        });

        it('tin nhắn cũ nhất đứng đầu, mới nhất đứng cuối', () => {
            useMessagingStore.getState().setMessages(CONV, API_DESC);
            const messages = useMessagingStore.getState().getMessages(CONV);
            expect(messages[0].createdAt).toBe('2026-07-15T23:07:00.000Z');
            expect(messages[messages.length - 1].createdAt).toBe('2026-07-16T19:35:00.000Z');
        });
    });

    describe('addMessage', () => {
        it('tin nhắn mới được nối vào CUỐI (dưới đáy màn chat)', () => {
            useMessagingStore.getState().setMessages(CONV, API_DESC);
            useMessagingStore
                .getState()
                .addMessage(CONV, makeMessage('m4', '2026-07-16T20:00:00.000Z'));

            expect(contentsOf(CONV)).toEqual(['m1', 'm2', 'm3', 'm4']);
        });

        it('bỏ qua tin nhắn trùng id', () => {
            useMessagingStore.getState().setMessages(CONV, API_DESC);
            useMessagingStore
                .getState()
                .addMessage(CONV, makeMessage('m3', '2026-07-16T19:35:00.000Z'));

            expect(contentsOf(CONV)).toEqual(['m1', 'm2', 'm3']);
        });
    });
});
