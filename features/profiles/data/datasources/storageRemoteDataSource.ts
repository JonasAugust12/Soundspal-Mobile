import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type { UploadFileResponse } from '@/features/messaging/domain/entities/messaging.type';

export const storageRemoteDataSource = {
    uploadFile: (formData: FormData) => {
        return createApiCall<UploadFileResponse, FormData>('POST', '/storage/upload')(formData);
    },
};
