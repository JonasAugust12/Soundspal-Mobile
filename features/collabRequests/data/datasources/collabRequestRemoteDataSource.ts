import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import {
    postMultipartWithFetch,
    unwrapUploadPayload,
} from '@/shared/infrastructure/api/multipartUpload';
import type {
    CollabRequest,
    CollabRequestListResponse,
    CreateCollabRequestPayload,
    ListCollabRequestsParams,
    PublicCollaboratorsResponse,
    UpdateCollabRequestStatusPayload,
} from '@/features/collabRequests/domain/entities/collabRequest.type';

function buildListQuery(params: ListCollabRequestsParams = {}) {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        page_size: String(params.page_size ?? 50),
    });
    if (params.status) searchParams.append('status', params.status);
    return searchParams.toString();
}

export const collabRequestRemoteDataSource = {
    create: (payload: CreateCollabRequestPayload) =>
        createApiCall<CollabRequest, CreateCollabRequestPayload>(
            'POST',
            '/collaborations',
        )(payload),

    createWithAttachment: async (
        payload: CreateCollabRequestPayload,
        file: { uri: string; name: string; mimeType: string },
    ) => {
        const form = new FormData();
        form.append('receiver_id', payload.receiver_id);
        form.append('title', payload.title);
        form.append('description', payload.description);
        form.append('start_date', payload.start_date);
        form.append('end_date', payload.end_date);
        if (payload.start_time) form.append('start_time', payload.start_time);
        if (payload.end_time) form.append('end_time', payload.end_time);
        form.append('is_public', String(Boolean(payload.is_public)));
        form.append('attachment', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
        } as unknown as Blob);

        const raw = await postMultipartWithFetch<unknown>('/collaborations', form);
        return unwrapUploadPayload<CollabRequest>(raw);
    },

    list: (params?: ListCollabRequestsParams) =>
        createApiCall<CollabRequestListResponse>(
            'GET',
            `/collaborations?${buildListQuery(params)}`,
        )(),

    getById: (id: string) => createApiCall<CollabRequest>('GET', `/collaborations/${id}`)(),

    updateStatus: (id: string, payload: UpdateCollabRequestStatusPayload) =>
        createApiCall<CollabRequest, UpdateCollabRequestStatusPayload>(
            'PATCH',
            `/collaborations/${id}/status`,
        )(payload),

    listPublicCollaborators: (userId: string) =>
        createApiCall<PublicCollaboratorsResponse>(
            'GET',
            `/users/${userId}/public-collaborators`,
        )(),
};
