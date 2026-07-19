import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useMessagingStore } from '@/features/messaging/presentation/store/messagingStore';
import type { Message } from '@/features/messaging/domain/entities/messaging.type';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private hasReachedMaxAttempts = false;
    private isConnecting = false;
    private hasAttemptedTokenRefresh = false;
    private queryClient: unknown = null;

    setQueryClient(client: unknown) {
        this.queryClient = client;
    }

    connect() {
        // Prevent multiple simultaneous connection attempts
        if (this.isConnecting) {
            console.warn('🔌 Connection already in progress...');
            return this.socket;
        }

        // Don't retry if already failed max times
        if (this.hasReachedMaxAttempts) {
            console.warn('⚠️ Socket connection disabled after max retry attempts');
            return null;
        }

        if (this.socket?.connected) {
            console.warn('✅ Socket already connected');
            return this.socket;
        }

        const { user, accessToken } = useAuthStore.getState();

        if (!user || !accessToken) {
            console.warn('⚠️ Cannot connect to socket: user not authenticated');
            return null;
        }

        this.isConnecting = true;

        this.socket = io(`${process.env.EXPO_PUBLIC_SOCKET_URL}`, {
            path: process.env.EXPO_PUBLIC_SOCKET_PATH,
            auth: {
                token: accessToken,
            },
            query: {
                token: accessToken,
            },
            extraHeaders: {
                Authorization: `Bearer ${accessToken}`,
                'x-user-id': user.id,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
        });

        this.setupListeners();
        this.isConnecting = false;
        return this.socket;
    }

    private setupListeners() {
        if (!this.socket) return;

        // Remove all existing listeners to prevent duplicates
        this.socket.removeAllListeners();

        // Connection events
        this.socket.on('connect', () => {
            console.warn('✅ Connected to messaging service');
            console.warn('🆔 Socket ID:', this.socket?.id);
            this.reconnectAttempts = 0;
            this.hasReachedMaxAttempts = false;
            this.hasAttemptedTokenRefresh = false;
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('⚠️ Disconnected from messaging service');
            console.warn('Reason:', reason);

            if (reason === 'io server disconnect' && !this.hasAttemptedTokenRefresh) {
                console.error('❌ Server forced disconnect - possible auth issue');
                this.handleDisconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            this.handleConnectionError();
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error event:', error);
        });

        // Message events
        this.socket.on('message:new', (message: Message) => {
            console.warn('📨 New message received:', {
                id: message.id,
                conversationId: message.conversationId,
                senderId: message.senderId,
            });

            const store = useMessagingStore.getState();

            store.addMessage(message.conversationId, message);

            if (store.activeConversationId !== message.conversationId) {
                store.incrementUnread(message.conversationId);
            }
        });

        this.socket.on('message:edited', (message: Message) => {
            console.warn('✏️ Message edited:', message.id);
            useMessagingStore.getState().updateMessage(message.conversationId, message.id, {
                content: message.content,
                isEdited: true,
            });
        });

        this.socket.on(
            'message:deleted',
            ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
                console.warn('🗑️ Message deleted:', messageId);
                useMessagingStore.getState().removeMessage(conversationId, messageId);
            },
        );

        // Typing events
        this.socket.on(
            'typing:start',
            ({ conversationId, userId }: { conversationId: string; userId: string }) => {
                const currentUserId = useAuthStore.getState().user?.id;
                if (userId !== currentUserId) {
                    console.warn('⌨️ User typing:', userId);
                    useMessagingStore.getState().addTypingUser(conversationId, userId);
                }
            },
        );

        this.socket.on(
            'typing:stop',
            ({ conversationId, userId }: { conversationId: string; userId: string }) => {
                const currentUserId = useAuthStore.getState().user?.id;
                if (userId !== currentUserId) {
                    console.warn('⏸️ User stopped typing:', userId);
                    useMessagingStore.getState().removeTypingUser(conversationId, userId);
                }
            },
        );

        // Read receipt events
        // Bulk: emitted when someone marks a whole conversation read
        // (POST /messages/conversation/:id/read) → { conversationId, readerId, count }
        this.socket.on(
            'messages:read',
            ({ conversationId, readerId }: { conversationId: string; readerId: string }) => {
                if (!conversationId || !readerId) return;
                console.warn('👁️ Conversation read by:', readerId);
                useMessagingStore.getState().markMessagesReadBy(conversationId, readerId);
            },
        );

        // Single message read. Gateway emits { messageId, userId }; REST emits
        // { messageId, readerId, conversationId }. Normalize both shapes.
        this.socket.on(
            'message:read',
            (payload: {
                messageId: string;
                userId?: string;
                readerId?: string;
                conversationId?: string;
            }) => {
                const store = useMessagingStore.getState();
                const readerId = payload.readerId ?? payload.userId;
                if (!payload.messageId || !readerId) return;
                const conversationId =
                    payload.conversationId ?? store.messagesById[payload.messageId]?.conversationId;
                if (!conversationId) return;
                console.warn('👁️ Message read by:', readerId);
                store.markMessageReadBy(conversationId, payload.messageId, readerId);
            },
        );

        // Online status events
        this.socket.on('user:online', ({ userId }: { userId: string }) => {
            console.warn('🟢 User online:', userId);
            useMessagingStore.getState().addOnlineUser(userId);
        });

        this.socket.on('user:offline', ({ userId }: { userId: string }) => {
            console.warn('⚫ User offline:', userId);
            useMessagingStore.getState().removeOnlineUser(userId);
        });

        // Initial presence snapshot (list of currently-online user ids).
        // NOTE: the current DATN backend does not emit this yet — it only sends
        // per-user user:online/user:offline. Wired here so presence bootstraps
        // correctly as soon as the backend starts emitting a snapshot on connect.
        this.socket.on('users:online', (payload: string[] | { userIds?: string[] }) => {
            const ids = Array.isArray(payload) ? payload : (payload?.userIds ?? []);
            if (!Array.isArray(ids)) return;
            console.warn('🟢 Online snapshot:', ids.length, 'users');
            useMessagingStore.getState().setOnlineUsers(ids);
        });
    }

    private handleDisconnect() {
        setTimeout(() => {
            this.disconnect();
            this.connect();
        }, 1000);
    }

    private handleConnectionError() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
            console.warn(`🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);

            this.isConnecting = false;
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.hasReachedMaxAttempts = true;
            this.isConnecting = false;
        }
    }

    // Helper methods for emitting events
    joinConversation(conversationId: string) {
        if (!this.socket?.connected) {
            console.warn('⚠️ Cannot join conversation - socket not connected');
            return;
        }
        console.warn('📥 Joining conversation:', conversationId);
        this.socket.emit('conversation:join', { conversationId });
    }

    leaveConversation(conversationId: string) {
        if (!this.socket?.connected) return;
        console.warn('📤 Leaving conversation:', conversationId);
        this.socket.emit('conversation:leave', { conversationId });
    }

    startTyping(conversationId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing:start', { conversationId });
    }

    stopTyping(conversationId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing:stop', { conversationId });
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.reconnectAttempts = 0;
        this.hasReachedMaxAttempts = false;
        this.isConnecting = false;
        this.hasAttemptedTokenRefresh = false;
    }

    resetReconnectAttempts() {
        this.reconnectAttempts = 0;
        this.hasReachedMaxAttempts = false;
        this.hasAttemptedTokenRefresh = false;
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export const socketService = new SocketService();
