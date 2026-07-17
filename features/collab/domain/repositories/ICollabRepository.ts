import type { collabRemoteDataSource } from '@/features/collab/data/datasources/collabRemoteDataSource';

export interface ICollabRepository {
    getMySubmissions(
        ...args: Parameters<typeof collabRemoteDataSource.getMySubmissions>
    ): ReturnType<typeof collabRemoteDataSource.getMySubmissions>;
    getMyPosts(
        ...args: Parameters<typeof collabRemoteDataSource.getMyPosts>
    ): ReturnType<typeof collabRemoteDataSource.getMyPosts>;
    getOpportunitySubmissions(
        ...args: Parameters<typeof collabRemoteDataSource.getOpportunitySubmissions>
    ): ReturnType<typeof collabRemoteDataSource.getOpportunitySubmissions>;
    getMyPostedJobsSubmissions(
        ...args: Parameters<typeof collabRemoteDataSource.getMyPostedJobsSubmissions>
    ): ReturnType<typeof collabRemoteDataSource.getMyPostedJobsSubmissions>;
    withdrawSubmission(
        ...args: Parameters<typeof collabRemoteDataSource.withdrawSubmission>
    ): ReturnType<typeof collabRemoteDataSource.withdrawSubmission>;
    reviewSubmission(
        ...args: Parameters<typeof collabRemoteDataSource.reviewSubmission>
    ): ReturnType<typeof collabRemoteDataSource.reviewSubmission>;
}
