import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import {
    postMultipartWithFetch,
    unwrapUploadPayload,
} from '@/shared/infrastructure/api/multipartUpload';
import type {
    MediaListResponse,
    UploadMediaResponse,
} from '@/features/profiles/domain/entities/media.type';

export const mediaRemoteDataSource = {
    getMyMedia: () => {
        return createApiCall<MediaListResponse, void>('GET', 'submissions/me/media')();
    },

    // Upload đi qua fetch (không phải axios) vì axios 1.x trên RN gửi multipart hỏng —
    // body rỗng, chết ở tầng transport và báo ERR_NETWORK. Xem multipartUpload.ts.
    uploadMedia: async (formData: FormData): Promise<UploadMediaResponse> => {
        const payload = await postMultipartWithFetch('submissions/media', formData);
        return unwrapUploadPayload<UploadMediaResponse>(payload);
    },

    deleteMedia: (id: string) => {
        return createApiCall<void, void>('DELETE', `submissions/me/media/${id}`)();
    },
};
