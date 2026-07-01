import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    MySubmissionsResponse,
    OpportunitySubmissionsResponse,
    WithdrawSubmissionRequest,
    ReviewSubmissionRequest,
    ReviewSubmissionResponse,
} from '@/features/collab/domain/entities/collaboration.type';
import type { JobListResponse } from '@/features/jobs/domain/entities/job.type';
import { collabRepository } from '@/features/collab/data/repositories/CollabRepositoryImpl';

// API Calls
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
        queryFn: () => collabRepository.getMySubmissions(params),
        staleTime: 30000, // 30 seconds
    });
};

// Hooks - Get my posts (jobs)
export const useGetMyPosts = (params: { page?: number; pageSize?: number } = {}) => {
    return useQuery({
        queryKey: ['collab', 'myPosts', params],
        queryFn: () => collabRepository.getMyPosts(params),
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
        queryFn: () => collabRepository.getOpportunitySubmissions(opportunityId, params),
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
                const submissionsResponse = await collabRepository.getOpportunitySubmissions(
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
            collabRepository.withdrawSubmission(id, body),
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
            collabRepository.reviewSubmission(id, body),
        onSuccess: (_, _variables) => {
            // Invalidate opportunity submissions
            queryClient.invalidateQueries({
                queryKey: collabKeys.opportunitySubmissions(),
            });
        },
    });
};
