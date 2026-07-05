import type { IJobRepository } from '@/features/jobs/domain/repositories/IJobRepository';
import { jobRemoteDataSource } from '@/features/jobs/data/datasources/jobRemoteDataSource';

export class JobRepositoryImpl implements IJobRepository {
    getJobs = jobRemoteDataSource.getJobs;
    getJobById = jobRemoteDataSource.getJobById;
    getMyPosts = jobRemoteDataSource.getMyPosts;
    createJob = jobRemoteDataSource.createJob;
    updateJob = jobRemoteDataSource.updateJob;
    deleteJob = jobRemoteDataSource.deleteJob;
    publishJob = jobRemoteDataSource.publishJob;
    closeJob = jobRemoteDataSource.closeJob;
    submitJobApplication = jobRemoteDataSource.submitJobApplication;
    getMySubmissions = jobRemoteDataSource.getMySubmissions;
}

export const jobRepository = new JobRepositoryImpl();
