import { create } from 'zustand';

interface MessagingState {
    onlineUsers: string[]; // Array of user IDs who are online
    typingUsers: Record<string, string[]>; // conversationId -> array of user IDs typing
    activeConversationId: string | null;

    setOnlineUsers: (users: string[]) => void;
    addOnlineUser: (userId: string) => void;
    removeOnlineUser: (userId: string) => void;

    addTypingUser: (conversationId: string, userId: string) => void;
    removeTypingUser: (conversationId: string, userId: string) => void;

    setActiveConversation: (conversationId: string | null) => void;
}

export const useMessagingStore = create<MessagingState>()((set) => ({
    onlineUsers: [],
    typingUsers: {},
    activeConversationId: null,

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

    setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
}));
