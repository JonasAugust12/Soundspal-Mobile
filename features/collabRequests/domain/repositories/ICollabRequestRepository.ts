import type {
    CollabRequest,
    CollabRequestListResponse,
    CreateCollabRequestPayload,
    ListCollabRequestsParams,
    PublicCollaboratorsResponse,
    UpdateCollabRequestStatusPayload,
} from '../entities/collabRequest.type';

export interface ICollabRequestRepository {
    create(payload: CreateCollabRequestPayload): Promise<CollabRequest>;
    createWithAttachment(
        payload: CreateCollabRequestPayload,
        file: { uri: string; name: string; mimeType: string },
    ): Promise<CollabRequest>;
    list(params?: ListCollabRequestsParams): Promise<CollabRequestListResponse>;
    getById(id: string): Promise<CollabRequest>;
    updateStatus(id: string, payload: UpdateCollabRequestStatusPayload): Promise<CollabRequest>;
    listPublicCollaborators(userId: string): Promise<PublicCollaboratorsResponse>;
}
