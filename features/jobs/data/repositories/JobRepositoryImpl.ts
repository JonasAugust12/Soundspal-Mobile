import type { IJobRepository } from '@/features/jobs/domain/repositories/IJobRepository';
import type { JobDetailResponse } from '@/features/jobs/domain/entities/job.type';
import { jobRemoteDataSource } from '@/features/jobs/data/datasources/jobRemoteDataSource';
import {
    getJobByIdWithOwnedFallback,
    reopenOwnedJob,
} from '@/features/jobs/data/repositories/jobRepositoryHelpers';

export class JobRepositoryImpl implements IJobRepository {
    getJobs = jobRemoteDataSource.getJobs;

    getJobById = (id: string): Promise<JobDetailResponse> => getJobByIdWithOwnedFallback(id);

    getMyPosts = jobRemoteDataSource.getMyPosts;
    createJob = jobRemoteDataSource.createJob;
    updateJob = jobRemoteDataSource.updateJob;
    deleteJob = jobRemoteDataSource.deleteJob;
    publishJob = jobRemoteDataSource.publishJob;
    reopenJob = reopenOwnedJob;
    closeJob = jobRemoteDataSource.closeJob;
    submitJobApplication = jobRemoteDataSource.submitJobApplication;
    getMySubmissions = jobRemoteDataSource.getMySubmissions;
    withdrawSubmission = jobRemoteDataSource.withdrawSubmission;
    getJobSubmissions = jobRemoteDataSource.getJobSubmissions;
    reviewSubmission = jobRemoteDataSource.reviewSubmission;
    getPendingApplicationsCount = jobRemoteDataSource.getPendingApplicationsCount;
}

export const jobRepository = new JobRepositoryImpl();
