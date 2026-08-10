import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collabRequestRepository } from '@/features/collabRequests/data/repositories/CollabRequestRepositoryImpl';
import type {
    CollabRequestStatus,
    CreateCollabRequestPayload,
    ListCollabRequestsParams,
    UpdateCollabRequestStatusPayload,
} from '@/features/collabRequests/domain/entities/collabRequest.type';

export const collabRequestKeys = {
    all: ['collabRequests'] as const,
    lists: () => [...collabRequestKeys.all, 'list'] as const,
    list: (params: ListCollabRequestsParams = {}) =>
        [...collabRequestKeys.lists(), params] as const,
    accepted: () => [...collabRequestKeys.all, 'accepted'] as const,
    detail: (id: string) => [...collabRequestKeys.all, 'detail', id] as const,
    public: (userId: string) => [...collabRequestKeys.all, 'public', userId] as const,
};

export function useListCollabRequests(params: ListCollabRequestsParams = {}) {
    return useQuery({
        queryKey: collabRequestKeys.list(params),
        queryFn: () => collabRequestRepository.list(params),
        staleTime: 30_000,
    });
}

export function useAcceptedCollabRequests() {
    return useQuery({
        queryKey: collabRequestKeys.accepted(),
        queryFn: () =>
            collabRequestRepository.list({ status: 'ACCEPTED', page: 1, page_size: 100 }),
        staleTime: 30_000,
    });
}

/**
 * Chi tiết một đề nghị hợp tác — dùng để hydrate thẻ COLLAB_REF trong khung chat.
 * React Query cache theo id nên nhiều tin nhắn cùng trỏ một collab chỉ gọi API một lần.
 * Không retry: 403 (không thuộc collab) và 404 sẽ không khá hơn khi thử lại.
 */
export function useCollabRequestDetail(id?: string) {
    return useQuery({
        queryKey: collabRequestKeys.detail(id ?? ''),
        queryFn: () => collabRequestRepository.getById(id!),
        enabled: Boolean(id),
        staleTime: 5 * 60_000,
        retry: false,
    });
}

export function usePublicCollaborators(userId: string, enabled = true) {
    return useQuery({
        queryKey: collabRequestKeys.public(userId),
        queryFn: () => collabRequestRepository.listPublicCollaborators(userId),
        enabled: Boolean(userId) && enabled,
        staleTime: 60_000,
    });
}

export function useCreateCollabRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            payload,
            file,
        }: {
            payload: CreateCollabRequestPayload;
            file?: { uri: string; name: string; mimeType: string } | null;
        }) => {
            if (file) {
                return collabRequestRepository.createWithAttachment(payload, file);
            }
            return collabRequestRepository.create(payload);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: collabRequestKeys.all });
        },
    });
}

export function useUpdateCollabRequestStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCollabRequestStatusPayload }) =>
            collabRequestRepository.updateStatus(id, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: collabRequestKeys.all });
        },
    });
}

export type CollabFilter = 'ALL' | CollabRequestStatus;
