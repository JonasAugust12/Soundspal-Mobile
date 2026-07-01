import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    MediaListResponse,
    UploadMediaResponse,
} from '@/features/profiles/domain/entities/media.type';

export const mediaRemoteDataSource = {
    getMyMedia: () => {
        return createApiCall<MediaListResponse, void>('GET', 'submissions/me/media')();
    },

    uploadMedia: (formData: FormData) => {
        return createApiCall<UploadMediaResponse, FormData>('POST', 'submissions/media')(formData);
    },

    deleteMedia: (id: string) => {
        return createApiCall<void, void>('DELETE', `submissions/me/media/${id}`)();
    },
};
