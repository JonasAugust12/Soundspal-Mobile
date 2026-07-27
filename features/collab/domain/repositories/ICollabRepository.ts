import type {
    MySubmissionsResponse,
    OpportunitySubmissionsResponse,
    WithdrawSubmissionRequest,
    ReviewSubmissionRequest,
    ReviewSubmissionResponse,
} from '@/features/collab/domain/entities/collaboration.type';
import type { JobListResponse } from '@/features/jobs/domain/entities/job.type';

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface OpportunitySubmissionsParams extends PaginationParams {
    status?: string;
    sortBy?: string;
    sortOrder?: string;
}

export interface ICollabRepository {
    getMySubmissions(params: PaginationParams): Promise<MySubmissionsResponse>;
    getMyPosts(params: PaginationParams): Promise<JobListResponse>;
    getOpportunitySubmissions(
        opportunityId: string,
        params: OpportunitySubmissionsParams,
    ): Promise<OpportunitySubmissionsResponse>;
    getMyPostedJobsSubmissions(params: PaginationParams): Promise<OpportunitySubmissionsResponse>;
    withdrawSubmission(id: string, body: WithdrawSubmissionRequest): Promise<{ message: string }>;
    reviewSubmission(id: string, body: ReviewSubmissionRequest): Promise<ReviewSubmissionResponse>;
}
