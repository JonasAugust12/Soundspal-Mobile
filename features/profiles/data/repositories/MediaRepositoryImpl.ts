import type { IMediaRepository } from '@/features/profiles/domain/repositories/IMediaRepository';
import { mediaRemoteDataSource } from '@/features/profiles/data/datasources/mediaRemoteDataSource';

export class MediaRepositoryImpl implements IMediaRepository {
    getMyMedia = mediaRemoteDataSource.getMyMedia;
    uploadMedia = mediaRemoteDataSource.uploadMedia;
    deleteMedia = mediaRemoteDataSource.deleteMedia;
}

export const mediaRepository = new MediaRepositoryImpl();
