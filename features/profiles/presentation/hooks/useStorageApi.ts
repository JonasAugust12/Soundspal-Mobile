import { useMutation } from '@tanstack/react-query';
import { storageRepository } from '@/features/profiles/data/repositories/StorageRepositoryImpl';

export const useUploadFile = () => {
    return useMutation({
        mutationFn: storageRepository.uploadFile,
    });
};
