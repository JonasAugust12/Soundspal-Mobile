import type {
    JobListResponse,
    JobDetailResponse,
    Job,
    CreateJobRequest,
    UpdateJobRequest,
    SubmitApplicationRequest,
    Application,
    MySubmissionsResponse,
    PostStatus,
    PostVisibility,
    GetJobSubmissionsParams,
    OpportunitySubmission,
    OpportunitySubmissionsResponse,
    WithdrawSubmissionRequest,
    ReviewSubmissionRequest,
    ReviewSubmissionResponse,
    PendingCountResponse,
} from '@/features/jobs/domain/entities/job.type';

export interface GetJobsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: PostStatus;
    visibility?: PostVisibility;
}

export interface IJobRepository {
    getJobs(params: GetJobsParams): Promise<JobListResponse>;
    getJobById(id: string): Promise<JobDetailResponse>;
    getMyPosts(params: { page?: number; pageSize?: number }): Promise<JobListResponse>;
    createJob(body: CreateJobRequest): Promise<Job>;
    updateJob(id: string, body: UpdateJobRequest): Promise<Job>;
    deleteJob(id: string): Promise<void>;
    publishJob(id: string): Promise<Job>;
    reopenJob(id: string): Promise<Job>;
    closeJob(id: string): Promise<Job>;
    submitJobApplication(jobId: string, body: SubmitApplicationRequest): Promise<Application>;
    getMySubmissions(params: { page?: number; pageSize?: number }): Promise<MySubmissionsResponse>;
    withdrawSubmission(
        submissionId: string,
        body: WithdrawSubmissionRequest,
    ): Promise<OpportunitySubmission>;
    getJobSubmissions(
        jobId: string,
        params?: GetJobSubmissionsParams,
    ): Promise<OpportunitySubmissionsResponse>;
    reviewSubmission(
        submissionId: string,
        body: ReviewSubmissionRequest,
    ): Promise<ReviewSubmissionResponse>;
    getPendingApplicationsCount(): Promise<PendingCountResponse>;
}
