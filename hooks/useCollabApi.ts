import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import type {
    MySubmission,
    MySubmissionsResponse,
    OpportunitySubmissionsResponse,
    WithdrawSubmissionRequest,
    ReviewSubmissionRequest,
    ReviewSubmissionResponse,
    OpportunitySubmission,
} from '@/types/collaboration.type';
import type { JobListResponse } from '@/types/job.type';

// API Calls
const collabApi = {
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

    // Get my posted jobs
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

    // Get all submissions for my posted jobs
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

    // Withdraw my submission
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

// Query Keys
export const collabKeys = {
    all: ['collab'] as const,
    mySubmissions: () => [...collabKeys.all, 'mySubmissions'] as const,
    mySubmissionsList: (params: { page?: number; pageSize?: number }) =>
        [...collabKeys.mySubmissions(), params] as const,
    opportunitySubmissions: () => [...collabKeys.all, 'opportunitySubmissions'] as const,
    opportunitySubmissionsList: (
        opportunityId: string,
        params: {
            page?: number;
            pageSize?: number;
            status?: string;
            sortBy?: string;
            sortOrder?: string;
        },
    ) => [...collabKeys.opportunitySubmissions(), opportunityId, params] as const,
    myPostedJobsSubmissions: () => [...collabKeys.all, 'myPostedJobsSubmissions'] as const,
    myPostedJobsSubmissionsList: (params: { page?: number; pageSize?: number }) =>
        [...collabKeys.myPostedJobsSubmissions(), params] as const,
};

// Hooks - Get my submissions
export const useGetMySubmissions = (params: { page?: number; pageSize?: number } = {}) => {
    return useQuery({
        queryKey: collabKeys.mySubmissionsList(params),
        queryFn: () => collabApi.getMySubmissions(params),
        staleTime: 30000, // 30 seconds
    });
};

// Hooks - Get my posts (jobs)
export const useGetMyPosts = (params: { page?: number; pageSize?: number } = {}) => {
    return useQuery({
        queryKey: ['collab', 'myPosts', params],
        queryFn: () => collabApi.getMyPosts(params),
        staleTime: 60000, // 1 minute
    });
};

// Hooks - Get opportunity submissions
export const useGetOpportunitySubmissions = (
    opportunityId: string,
    params: {
        page?: number;
        pageSize?: number;
        status?: string;
        sortBy?: string;
        sortOrder?: string;
    } = {},
) => {
    return useQuery({
        queryKey: collabKeys.opportunitySubmissionsList(opportunityId, params),
        queryFn: () => collabApi.getOpportunitySubmissions(opportunityId, params),
        enabled: !!opportunityId,
        staleTime: 60000, // 1 minute
    });
};

// Hooks - Get my posted jobs submissions (aggregate from all my jobs)
export const useGetMyPostedJobsSubmissions = (
    params: { page?: number; pageSize?: number } = {},
) => {
    // First get my posts
    const { data: postsData } = useGetMyPosts();

    // Then query opportunity submissions based on posts data
    const firstJobId = postsData?.posts?.[0]?.id;

    return useQuery({
        queryKey: ['collab', 'myPostedJobsSubmissions', params, firstJobId],
        queryFn: async () => {
            if (!firstJobId) {
                return {
                    submissions: [],
                    total: 0,
                    total_pages: 0,
                    page: 1,
                    page_size: 20,
                } as OpportunitySubmissionsResponse;
            }

            try {
                // Fetch submissions from the first job (most recent)
                const submissionsResponse = await collabApi.getOpportunitySubmissions(
                    firstJobId,
                    params,
                );
                return submissionsResponse;
            } catch (error) {
                console.error('Error fetching opportunity submissions:', error);
                throw error;
            }
        },
        enabled: !!firstJobId,
        staleTime: 60000, // 1 minute
    });
};

// Hooks - Withdraw submission
export const useWithdrawSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: WithdrawSubmissionRequest }) =>
            collabApi.withdrawSubmission(id, body),
        onSuccess: () => {
            // Invalidate my submissions list
            queryClient.invalidateQueries({ queryKey: collabKeys.mySubmissions() });
        },
    });
};

// Hooks - Review submission
export const useReviewSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: ReviewSubmissionRequest }) =>
            collabApi.reviewSubmission(id, body),
        onSuccess: (_, variables) => {
            // Invalidate opportunity submissions
            queryClient.invalidateQueries({
                queryKey: collabKeys.opportunitySubmissions(),
            });
        },
    });
};
