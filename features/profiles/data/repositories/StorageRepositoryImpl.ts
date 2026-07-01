import type { IStorageRepository } from '@/features/profiles/domain/repositories/IStorageRepository';
import { storageRemoteDataSource } from '@/features/profiles/data/datasources/storageRemoteDataSource';

export class StorageRepositoryImpl implements IStorageRepository {
    uploadFile = storageRemoteDataSource.uploadFile;
}

export const storageRepository = new StorageRepositoryImpl();
