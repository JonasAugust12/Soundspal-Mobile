import type {
    JobListResponse,
    JobDetailResponse,
    Job,
    CreateJobRequest,
    UpdateJobRequest,
    SubmitApplicationRequest,
    Application,
    MySubmissionsResponse,
} from '@/features/jobs/domain/entities/job.type';

export interface IJobRepository {
    getJobs(params: {
        page?: number;
        pageSize?: number;
        search?: string;
    }): Promise<JobListResponse>;
    getJobById(id: string): Promise<JobDetailResponse>;
    getMyPosts(params: { page?: number; pageSize?: number }): Promise<JobListResponse>;
    createJob(body: CreateJobRequest): Promise<Job>;
    updateJob(id: string, body: UpdateJobRequest): Promise<Job>;
    deleteJob(id: string): Promise<void>;
    submitJobApplication(jobId: string, body: SubmitApplicationRequest): Promise<Application>;
    getMySubmissions(params: { page?: number; pageSize?: number }): Promise<MySubmissionsResponse>;
}
