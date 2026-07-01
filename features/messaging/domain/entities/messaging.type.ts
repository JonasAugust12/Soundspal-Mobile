export interface Conversation {
    id: string;
    name: string;
    isGroup: boolean;
    participants: ConversationParticipant[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationParticipant {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachmentUrl?: string | null;
    attachmentType?: 'image' | 'video' | 'file' | null;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    sender: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}

export interface SendMessageRequest {
    conversationId: string;
    content: string;
    attachmentUrl?: string;
    attachmentType?: 'image' | 'video' | 'file';
}

export interface EditMessageRequest {
    content: string;
}

export interface CreateConversationRequest {
    name: string;
    isGroup: boolean;
    participantIds: string[];
}

export interface UploadFileResponse {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}
