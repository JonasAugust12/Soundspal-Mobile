import type {
    MediaListResponse,
    UploadMediaResponse,
} from '@/features/profiles/domain/entities/media.type';

export interface IMediaRepository {
    getMyMedia(): Promise<MediaListResponse>;
    uploadMedia(formData: FormData): Promise<UploadMediaResponse>;
    deleteMedia(id: string): Promise<void>;
}
