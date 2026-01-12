import { create } from 'zustand';
import type { Conversation, Message } from '@/types/messaging.type';

interface MessagingState {
    // Data
    conversations: Conversation[];
    messagesByConversation: Record<string, Message[]>; // conversationId -> messages
    unreadCounts: Record<string, number>; // conversationId -> unread count

    // Real-time state
    onlineUsers: string[];
    typingUsers: Record<string, string[]>; // conversationId -> array of user IDs typing
    activeConversationId: string | null;

    // Loading states
    isLoadingConversations: boolean;
    loadingMessages: Record<string, boolean>; // conversationId -> loading state

    // Actions - Conversations
    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
    removeConversation: (conversationId: string) => void;
    setLoadingConversations: (loading: boolean) => void;

    // Actions - Messages
    setMessages: (conversationId: string, messages: Message[]) => void;
    addMessage: (conversationId: string, message: Message) => void;
    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
    removeMessage: (conversationId: string, messageId: string) => void;
    setLoadingMessages: (conversationId: string, loading: boolean) => void;
    hasMessages: (conversationId: string) => boolean;

    // Actions - Unread
    setUnreadCount: (conversationId: string, count: number) => void;
    incrementUnread: (conversationId: string) => void;
    clearUnread: (conversationId: string) => void;

    // Actions - Online/Typing
    setOnlineUsers: (users: string[]) => void;
    addOnlineUser: (userId: string) => void;
    removeOnlineUser: (userId: string) => void;
    addTypingUser: (conversationId: string, userId: string) => void;
    removeTypingUser: (conversationId: string, userId: string) => void;

    // Actions - Active conversation
    setActiveConversation: (conversationId: string | null) => void;

    // Selectors
    getMessages: (conversationId: string) => Message[];
    getSortedConversations: () => Conversation[];
}

export const useMessagingStore = create<MessagingState>()((set, get) => ({
    // Initial state
    conversations: [],
    messagesByConversation: {},
    unreadCounts: {},
    onlineUsers: [],
    typingUsers: {},
    activeConversationId: null,
    isLoadingConversations: false,
    loadingMessages: {},

    // Conversations
    setConversations: (conversations) =>
        set({
            conversations,
            unreadCounts: conversations.reduce(
                (acc, conv) => ({ ...acc, [conv.id]: conv.unreadCount || 0 }),
                {}
            ),
        }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
            unreadCounts: { ...state.unreadCounts, [conversation.id]: conversation.unreadCount || 0 },
        })),

    updateConversation: (conversationId, updates) =>
        set((state) => ({
            conversations: state.conversations.map((conv) =>
                conv.id === conversationId ? { ...conv, ...updates } : conv
            ),
        })),

    removeConversation: (conversationId) =>
        set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== conversationId),
            messagesByConversation: Object.fromEntries(
                Object.entries(state.messagesByConversation).filter(([id]) => id !== conversationId)
            ),
        })),

    setLoadingConversations: (loading) => set({ isLoadingConversations: loading }),

    // Messages
    setMessages: (conversationId, messages) =>
        set((state) => ({
            messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: messages,
            },
        })),

    addMessage: (conversationId, message) =>
        set((state) => {
            const currentMessages = state.messagesByConversation[conversationId] || [];
            // Check if message already exists
            if (currentMessages.some((m) => m.id === message.id)) {
                return state;
            }

            // Update last message in conversation
            const updatedConversations = state.conversations.map((conv) =>
                conv.id === conversationId
                    ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
                    : conv
            );

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: [...currentMessages, message],
                },
                conversations: updatedConversations,
            };
        }),

    updateMessage: (conversationId, messageId, updates) =>
        set((state) => {
            const currentMessages = state.messagesByConversation[conversationId] || [];
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: currentMessages.map((msg) =>
                        msg.id === messageId ? { ...msg, ...updates } : msg
                    ),
                },
            };
        }),

    removeMessage: (conversationId, messageId) =>
        set((state) => {
            const currentMessages = state.messagesByConversation[conversationId] || [];
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: currentMessages.map((msg) =>
                        msg.id === messageId ? { ...msg, isDeleted: true, content: '' } : msg
                    ),
                },
            };
        }),

    setLoadingMessages: (conversationId, loading) =>
        set((state) => ({
            loadingMessages: { ...state.loadingMessages, [conversationId]: loading },
        })),

    hasMessages: (conversationId) => {
        const state = get();
        return !!state.messagesByConversation[conversationId];
    },

    // Unread
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

    // Online/Typing
    setOnlineUsers: (users) => set({ onlineUsers: users }),

    addOnlineUser: (userId) =>
        set((state) => ({
            onlineUsers: state.onlineUsers.includes(userId)
                ? state.onlineUsers
                : [...state.onlineUsers, userId],
        })),

    removeOnlineUser: (userId) =>
        set((state) => ({
            onlineUsers: state.onlineUsers.filter((id) => id !== userId),
        })),

    addTypingUser: (conversationId, userId) =>
        set((state) => {
            const currentTyping = state.typingUsers[conversationId] || [];
            if (currentTyping.includes(userId)) return state;
            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: [...currentTyping, userId],
                },
            };
        }),

    removeTypingUser: (conversationId, userId) =>
        set((state) => {
            const currentTyping = state.typingUsers[conversationId] || [];
            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: currentTyping.filter((id) => id !== userId),
                },
            };
        }),

    // Active conversation
    setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

    // Selectors
    getMessages: (conversationId) => {
        const state = get();
        return state.messagesByConversation[conversationId] || [];
    },

    getSortedConversations: () => {
        const state = get();
        return [...state.conversations].sort((a, b) => {
            const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return dateB - dateA;
        });
    },
}));
