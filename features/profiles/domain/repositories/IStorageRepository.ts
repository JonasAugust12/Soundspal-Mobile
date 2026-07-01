import type { UploadFileResponse } from '@/features/messaging/domain/entities/messaging.type';

export interface IStorageRepository {
    uploadFile(formData: FormData): Promise<UploadFileResponse>;
}
