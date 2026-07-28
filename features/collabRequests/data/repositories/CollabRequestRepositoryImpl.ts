import type { ICollabRequestRepository } from '@/features/collabRequests/domain/repositories/ICollabRequestRepository';
import type {
    CreateCollabRequestPayload,
    ListCollabRequestsParams,
    UpdateCollabRequestStatusPayload,
} from '@/features/collabRequests/domain/entities/collabRequest.type';
import { collabRequestRemoteDataSource } from '../datasources/collabRequestRemoteDataSource';

export const collabRequestRepository: ICollabRequestRepository = {
    create: (payload: CreateCollabRequestPayload) => collabRequestRemoteDataSource.create(payload),

    createWithAttachment: (payload, file) =>
        collabRequestRemoteDataSource.createWithAttachment(payload, file),

    list: (params?: ListCollabRequestsParams) => collabRequestRemoteDataSource.list(params),

    getById: (id: string) => collabRequestRemoteDataSource.getById(id),

    updateStatus: (id: string, payload: UpdateCollabRequestStatusPayload) =>
        collabRequestRemoteDataSource.updateStatus(id, payload),

    listPublicCollaborators: (userId: string) =>
        collabRequestRemoteDataSource.listPublicCollaborators(userId),
};
