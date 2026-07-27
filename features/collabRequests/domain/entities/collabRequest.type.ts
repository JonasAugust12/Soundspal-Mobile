export type CollabRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface CollabRequestParty {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string | null;
}

export interface CollabRequest {
    id: string;
    sender: CollabRequestParty;
    receiver: CollabRequestParty;
    title: string;
    description: string;
    /** Response format: yyyy-MM-dd */
    start_date: string;
    start_time?: string | null;
    /** Response format: yyyy-MM-dd */
    end_date: string;
    end_time?: string | null;
    attachment_url?: string | null;
    is_public: boolean;
    status: CollabRequestStatus;
    created_at: string;
    updated_at: string;
}

export interface CollabRequestListResponse {
    collaborations: CollabRequest[];
    pagination: {
        current_page: number;
        page_size: number;
        total_pages: number;
        total_items: number;
    };
}

export interface CreateCollabRequestPayload {
    receiver_id: string;
    title: string;
    description: string;
    /** Request format: dd-MM-yyyy */
    start_date: string;
    start_time?: string | null;
    /** Request format: dd-MM-yyyy */
    end_date: string;
    end_time?: string | null;
    is_public?: boolean;
    attachment_url?: string | null;
}

export interface UpdateCollabRequestStatusPayload {
    status: Exclude<CollabRequestStatus, 'PENDING'>;
}

export interface ListCollabRequestsParams {
    status?: CollabRequestStatus;
    page?: number;
    page_size?: number;
}

export interface PublicCollaborator {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string | null;
    collaboration_id: string;
    title: string;
    start_date: string;
    end_date: string;
    start_time?: string | null;
    end_time?: string | null;
}

export interface PublicCollaboratorsResponse {
    collaborators: PublicCollaborator[];
}
