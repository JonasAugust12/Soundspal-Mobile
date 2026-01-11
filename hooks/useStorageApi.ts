import { useMutation } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import type { UploadFileResponse } from '@/types/messaging.type';

// File Upload API
const storageApi = {
    uploadFile: (formData: FormData) => {
        return createApiCall<UploadFileResponse, FormData>('POST', '/storage/upload')(formData);
    },
};

// Upload File Hook
export const useUploadFile = () => {
    return useMutation({
        mutationFn: storageApi.uploadFile,
    });
};
