import { createApiCall } from '@/shared/infrastructure/api/apiClient';
import type {
    MySubmissionsResponse,
    OpportunitySubmissionsResponse,
    WithdrawSubmissionRequest,
    ReviewSubmissionRequest,
    ReviewSubmissionResponse,
} from '@/features/collab/domain/entities/collaboration.type';
import type { JobListResponse } from '@/features/jobs/domain/entities/job.type';

export const collabRemoteDataSource = {
    // Get my submissions (submissions I created)
    getMySubmissions: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        return createApiCall<MySubmissionsResponse>(
            'GET',
            `/my-submissions?${searchParams.toString()}`,
        )();
    },

    getMyPosts: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        return createApiCall<JobListResponse>('GET', `/posts/me?${searchParams.toString()}`)();
    },

    // Get submissions for a specific opportunity/job I own
    getOpportunitySubmissions: (
        opportunityId: string,
        params: {
            page?: number;
            pageSize?: number;
            status?: string;
            sortBy?: string;
            sortOrder?: string;
        },
    ) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        if (params.status) searchParams.append('status', params.status);
        if (params.sortBy) searchParams.append('sort_by', params.sortBy);
        if (params.sortOrder) searchParams.append('sort_order', params.sortOrder);

        return createApiCall<OpportunitySubmissionsResponse>(
            'GET',
            `/posts/${opportunityId}/submissions?${searchParams.toString()}`,
        )();
    },

    getMyPostedJobsSubmissions: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        return createApiCall<OpportunitySubmissionsResponse>(
            'GET',
            `/my-posts/submissions?${searchParams.toString()}`,
        )();
    },

    withdrawSubmission: (id: string, body: WithdrawSubmissionRequest) => {
        return createApiCall<{ message: string }, WithdrawSubmissionRequest>(
            'PUT',
            `/submissions/${id}/withdraw`,
        )(body);
    },

    // Review submission (accept/reject/skip)
    reviewSubmission: (id: string, body: ReviewSubmissionRequest) => {
        return createApiCall<ReviewSubmissionResponse, ReviewSubmissionRequest>(
            'PUT',
            `/submissions/${id}/review`,
        )(body);
    },
};
