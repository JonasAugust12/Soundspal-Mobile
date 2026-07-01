import type { ICollabRepository } from '@/features/collab/domain/repositories/ICollabRepository';
import { collabRemoteDataSource } from '@/features/collab/data/datasources/collabRemoteDataSource';

export class CollabRepositoryImpl implements ICollabRepository {
    getMySubmissions = collabRemoteDataSource.getMySubmissions;
    getMyPosts = collabRemoteDataSource.getMyPosts;
    getOpportunitySubmissions = collabRemoteDataSource.getOpportunitySubmissions;
    getMyPostedJobsSubmissions = collabRemoteDataSource.getMyPostedJobsSubmissions;
    withdrawSubmission = collabRemoteDataSource.withdrawSubmission;
    reviewSubmission = collabRemoteDataSource.reviewSubmission;
}

export const collabRepository = new CollabRepositoryImpl();
