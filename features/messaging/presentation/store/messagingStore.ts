import { create } from 'zustand';
import type { Conversation, Message } from '@/features/messaging/domain/entities/messaging.type';
import type { JobRefData } from '@/features/messaging/domain/utils/messageContent';

// ─── Normalized State Shape ───────────────────────────────────────────────────
//
//  conversationsById   Record<id, Conversation>   O(1) lookup & update
//  conversationOrder   string[]                   ordered by latest message (most-recent first)
//
//  messagesById        Record<id, Message>         O(1) lookup & update
//  conversationMessages Record<convId, msgId[]>   ordered message IDs per conversation
//
//  onlineUsers         Set<string>                 O(1) has() check
//
// ─────────────────────────────────────────────────────────────────────────────

interface MessagingState {
    // Data — Conversations
    conversationsById: Record<string, Conversation>;
    conversationOrder: string[]; // most-recent first, maintained on addMessage

    // Data — Messages
    messagesById: Record<string, Message>;
    conversationMessages: Record<string, string[]>; // convId → ordered messageIds

    // Data — Unread
    unreadCounts: Record<string, number>; // convId → count

    // Real-time state
    onlineUsers: Set<string>;
    typingUsers: Record<string, string[]>; // convId → userId[]
    activeConversationId: string | null;

    // Pending JOB_REF to prepend to the first message of a job-originated conversation
    pendingJobRefs: Record<string, { jobData: JobRefData; defaultText: string }>;

    // Loading states
    isLoadingConversations: boolean;
    loadingMessages: Record<string, boolean>;

    // ── Actions: Conversations ───────────────────────────────────────────────
    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
    removeConversation: (conversationId: string) => void;
    setLoadingConversations: (loading: boolean) => void;

    // ── Actions: Messages ────────────────────────────────────────────────────
    setMessages: (conversationId: string, messages: Message[]) => void;
    prependMessages: (conversationId: string, messages: Message[]) => void;
    addMessage: (conversationId: string, message: Message) => void;
    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
    removeMessage: (conversationId: string, messageId: string) => void;
    setLoadingMessages: (conversationId: string, loading: boolean) => void;
    hasMessages: (conversationId: string) => boolean;

    // ── Actions: Read receipts ───────────────────────────────────────────────
    markMessageReadBy: (conversationId: string, messageId: string, readerId: string) => void;
    markMessagesReadBy: (conversationId: string, readerId: string) => void;

    // ── Actions: Unread ──────────────────────────────────────────────────────
    setUnreadCount: (conversationId: string, count: number) => void;
    incrementUnread: (conversationId: string) => void;
    clearUnread: (conversationId: string) => void;

    // ── Actions: Online / Typing ─────────────────────────────────────────────
    setOnlineUsers: (users: string[]) => void;
    addOnlineUser: (userId: string) => void;
    removeOnlineUser: (userId: string) => void;
    addTypingUser: (conversationId: string, userId: string) => void;
    removeTypingUser: (conversationId: string, userId: string) => void;

    // ── Actions: Active conversation ─────────────────────────────────────────
    setActiveConversation: (conversationId: string | null) => void;

    // ── Actions: Pending JOB_REF ─────────────────────────────────────────────
    setPendingJobRef: (
        conversationId: string,
        payload: { jobData: JobRefData; defaultText: string },
    ) => void;
    clearPendingJobRef: (conversationId: string) => void;

    // ── Selectors ────────────────────────────────────────────────────────────
    getMessages: (conversationId: string) => Message[];
    getSortedConversations: () => Conversation[];
    getConversation: (conversationId: string) => Conversation | undefined;
    isUserOnline: (userId: string) => boolean;
}

// Helper: move a conversationId to the front of the order array
function bringToFront(order: string[], id: string): string[] {
    if (order[0] === id) return order; // already first, no mutation needed
    const filtered = order.filter((cid) => cid !== id);
    return [id, ...filtered];
}

// Helper: cũ → mới. Không sửa mảng gốc; sort của JS ổn định nên các tin nhắn trùng
// createdAt giữ nguyên thứ tự tương đối.
function sortByCreatedAtAsc(messages: Message[]): Message[] {
    return [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export const useMessagingStore = create<MessagingState>()((set, get) => ({
    // ── Initial state ────────────────────────────────────────────────────────
    conversationsById: {},
    conversationOrder: [],
    messagesById: {},
    conversationMessages: {},
    unreadCounts: {},
    onlineUsers: new Set<string>(),
    typingUsers: {},
    activeConversationId: null,
    pendingJobRefs: {},
    isLoadingConversations: false,
    loadingMessages: {},

    // ── Conversations ────────────────────────────────────────────────────────

    setConversations: (conversations) => {
        const conversationsById: Record<string, Conversation> = {};
        const conversationOrder: string[] = [];
        const unreadCounts: Record<string, number> = {};

        for (const conv of conversations) {
            conversationsById[conv.id] = conv;
            conversationOrder.push(conv.id);
            unreadCounts[conv.id] = conv.unreadCount || 0;
        }

        set({ conversationsById, conversationOrder, unreadCounts });
    },

    addConversation: (conversation) =>
        set((state) => {
            // Upsert: if already exists, just update
            const alreadyExists = !!state.conversationsById[conversation.id];
            return {
                conversationsById: {
                    ...state.conversationsById,
                    [conversation.id]: conversation,
                },
                conversationOrder: alreadyExists
                    ? state.conversationOrder
                    : [conversation.id, ...state.conversationOrder],
                unreadCounts: {
                    ...state.unreadCounts,
                    [conversation.id]: conversation.unreadCount || 0,
                },
            };
        }),

    updateConversation: (conversationId, updates) =>
        set((state) => {
            const existing = state.conversationsById[conversationId];
            if (!existing) return state;
            return {
                conversationsById: {
                    ...state.conversationsById,
                    [conversationId]: { ...existing, ...updates },
                },
            };
        }),

    removeConversation: (conversationId) =>
        set((state) => {
            // Remove messages belonging to this conversation
            const msgIds = state.conversationMessages[conversationId] || [];
            const newMessagesById = { ...state.messagesById };
            for (const id of msgIds) {
                delete newMessagesById[id];
            }
            const newConvMessages = { ...state.conversationMessages };
            delete newConvMessages[conversationId];

            const newById = { ...state.conversationsById };
            delete newById[conversationId];

            return {
                conversationsById: newById,
                conversationOrder: state.conversationOrder.filter((id) => id !== conversationId),
                messagesById: newMessagesById,
                conversationMessages: newConvMessages,
            };
        }),

    setLoadingConversations: (loading) => set({ isLoadingConversations: loading }),

    // ── Messages ─────────────────────────────────────────────────────────────

    setMessages: (conversationId, messages) => {
        set((state) => {
            const newMessagesById = { ...state.messagesById };
            const msgIds: string[] = [];

            // Store luôn giữ thứ tự CŨ → MỚI (addMessage nối vào cuối, prependMessages chèn vào
            // đầu). API `GET /messages/conversation/:id` trả DESC (mới nhất trước) để phân trang
            // bằng cursor `before` → chuẩn hoá tại đây để caller không phải tự nhớ, và để màn chat
            // không hiển thị ngược.
            for (const msg of sortByCreatedAtAsc(messages)) {
                newMessagesById[msg.id] = msg;
                msgIds.push(msg.id);
            }

            return {
                messagesById: newMessagesById,
                conversationMessages: {
                    ...state.conversationMessages,
                    [conversationId]: msgIds,
                },
            };
        });
    },

    // Prepend older messages (pagination: load more history).
    // New messages from API are placed at the FRONT; existing (newer) stay at end.
    // Dedupes automatically — skips any message already in the store.
    prependMessages: (conversationId, messages) => {
        set((state) => {
            const newMessagesById = { ...state.messagesById };
            const newIds: string[] = [];

            for (const msg of messages) {
                if (!newMessagesById[msg.id]) {
                    newMessagesById[msg.id] = msg;
                    newIds.push(msg.id);
                }
            }

            const existing = state.conversationMessages[conversationId] || [];

            return {
                messagesById: newMessagesById,
                conversationMessages: {
                    ...state.conversationMessages,
                    // older messages first, then existing newer messages
                    [conversationId]: [...newIds, ...existing],
                },
            };
        });
    },

    addMessage: (conversationId, message) =>
        set((state) => {
            // Dedupe: ignore if message already exists
            if (state.messagesById[message.id]) return state;

            const currentIds = state.conversationMessages[conversationId] || [];

            // Update last message in conversation + reorder conversation to front
            const existingConv = state.conversationsById[conversationId];
            const updatedConv = existingConv
                ? { ...existingConv, lastMessage: message, updatedAt: message.createdAt }
                : existingConv;

            return {
                messagesById: {
                    ...state.messagesById,
                    [message.id]: message,
                },
                conversationMessages: {
                    ...state.conversationMessages,
                    [conversationId]: [...currentIds, message.id],
                },
                // Bring conversation to top (no runtime sort on every render)
                conversationOrder: bringToFront(state.conversationOrder, conversationId),
                conversationsById: updatedConv
                    ? { ...state.conversationsById, [conversationId]: updatedConv }
                    : state.conversationsById,
            };
        }),

    updateMessage: (conversationId, messageId, updates) =>
        set((state) => {
            const existing = state.messagesById[messageId];
            if (!existing) return state;
            return {
                messagesById: {
                    ...state.messagesById,
                    [messageId]: { ...existing, ...updates },
                },
            };
        }),

    removeMessage: (_conversationId, messageId) =>
        set((state) => {
            const existing = state.messagesById[messageId];
            if (!existing) return state;
            return {
                messagesById: {
                    ...state.messagesById,
                    [messageId]: {
                        ...existing,
                        isDeleted: true,
                        content: 'Tin nhắn đã bị xóa',
                    },
                },
            };
        }),

    setLoadingMessages: (conversationId, loading) =>
        set((state) => ({
            loadingMessages: { ...state.loadingMessages, [conversationId]: loading },
        })),

    hasMessages: (conversationId) => {
        return !!get().conversationMessages[conversationId];
    },

    // ── Read receipts ─────────────────────────────────────────────────────────

    markMessageReadBy: (_conversationId, messageId, readerId) =>
        set((state) => {
            const msg = state.messagesById[messageId];
            // A sender never "reads" their own message.
            if (!msg || msg.senderId === readerId) return state;
            const readBy = msg.readBy || [];
            if (readBy.includes(readerId)) return state;
            return {
                messagesById: {
                    ...state.messagesById,
                    [messageId]: { ...msg, readBy: [...readBy, readerId] },
                },
            };
        }),

    markMessagesReadBy: (conversationId, readerId) =>
        set((state) => {
            const ids = state.conversationMessages[conversationId] || [];
            if (ids.length === 0) return state;

            let changed = false;
            const newById = { ...state.messagesById };
            for (const id of ids) {
                const msg = newById[id];
                if (!msg || msg.senderId === readerId) continue;
                const readBy = msg.readBy || [];
                if (readBy.includes(readerId)) continue;
                newById[id] = { ...msg, readBy: [...readBy, readerId] };
                changed = true;
            }
            if (!changed) return state;
            return { messagesById: newById };
        }),

    // ── Unread ───────────────────────────────────────────────────────────────

    setUnreadCount: (conversationId, count) =>
        set((state) => ({
            unreadCounts: { ...state.unreadCounts, [conversationId]: count },
        })),

    incrementUnread: (conversationId) =>
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
            },
        })),

    clearUnread: (conversationId) =>
        set((state) => ({
            unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
        })),

    // ── Online / Typing ──────────────────────────────────────────────────────

    setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),

    addOnlineUser: (userId) =>
        set((state) => {
            if (state.onlineUsers.has(userId)) return state;
            const next = new Set(state.onlineUsers);
            next.add(userId);
            return { onlineUsers: next };
        }),

    removeOnlineUser: (userId) =>
        set((state) => {
            if (!state.onlineUsers.has(userId)) return state;
            const next = new Set(state.onlineUsers);
            next.delete(userId);
            return { onlineUsers: next };
        }),

    addTypingUser: (conversationId, userId) =>
        set((state) => {
            const current = state.typingUsers[conversationId] || [];
            if (current.includes(userId)) return state;
            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: [...current, userId],
                },
            };
        }),

    removeTypingUser: (conversationId, userId) =>
        set((state) => {
            const current = state.typingUsers[conversationId] || [];
            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: current.filter((id) => id !== userId),
                },
            };
        }),

    // ── Active conversation ───────────────────────────────────────────────────

    setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

    // ── Pending JOB_REF ───────────────────────────────────────────────────────

    setPendingJobRef: (conversationId, payload) =>
        set((state) => ({
            pendingJobRefs: { ...state.pendingJobRefs, [conversationId]: payload },
        })),

    clearPendingJobRef: (conversationId) =>
        set((state) => {
            if (!state.pendingJobRefs[conversationId]) return state;
            const next = { ...state.pendingJobRefs };
            delete next[conversationId];
            return { pendingJobRefs: next };
        }),

    // ── Selectors ─────────────────────────────────────────────────────────────

    getMessages: (conversationId) => {
        const state = get();
        const ids = state.conversationMessages[conversationId];
        if (!ids) return [];
        return ids.map((id) => state.messagesById[id]).filter(Boolean) as Message[];
    },

    getSortedConversations: () => {
        const state = get();
        return state.conversationOrder
            .map((id) => state.conversationsById[id])
            .filter(Boolean) as Conversation[];
    },

    getConversation: (conversationId) => {
        return get().conversationsById[conversationId];
    },

    isUserOnline: (userId) => {
        return get().onlineUsers.has(userId);
    },
}));
