import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiCall } from '@/lib/apiClient';
import type {
    JobListResponse,
    JobDetailResponse,
    Job,
    CreateJobRequest,
    UpdateJobRequest,
    SubmitApplicationRequest,
    Application,
    MySubmissionsResponse,
} from '@/types/job.type';

// API Calls
const jobApi = {
    getJobs: (params: { page?: number; pageSize?: number; search?: string }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 0).toString(),
            page_size: (params.pageSize || 10).toString(),
        });
        if (params.search) {
            searchParams.append('search', params.search);
        }
        return createApiCall<JobListResponse>('GET', `/posts?${searchParams.toString()}`)();
    },

    getJobById: (id: string) => {
        return createApiCall<JobDetailResponse>('GET', `/posts/${id}`)();
    },

    getMyPosts: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        return createApiCall<JobListResponse>('GET', `/posts/me?${searchParams.toString()}`)();
    },

    createJob: createApiCall<Job, CreateJobRequest>('POST', '/posts'),

    updateJob: (id: string, body: UpdateJobRequest) => {
        return createApiCall<Job, UpdateJobRequest>('PUT', `/posts/${id}`)(body);
    },

    deleteJob: (id: string) => {
        return createApiCall<void>('DELETE', `/posts/${id}`)();
    },

    submitJobApplication: (jobId: string, body: SubmitApplicationRequest) => {
        return createApiCall<Application, SubmitApplicationRequest>(
            'POST',
            `/posts/${jobId}/submit`
        )(body);
    },

    getMySubmissions: (params: { page?: number; pageSize?: number }) => {
        const searchParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            page_size: (params.pageSize || 20).toString(),
        });
        return createApiCall<MySubmissionsResponse>(
            'GET',
            `/my-submissions?${searchParams.toString()}`
        )();
    },
};

// Query Keys
export const jobKeys = {
    all: ['jobs'] as const,
    lists: () => [...jobKeys.all, 'list'] as const,
    list: (params: { page?: number; pageSize?: number; search?: string }) =>
        [...jobKeys.lists(), params] as const,
    details: () => [...jobKeys.all, 'detail'] as const,
    detail: (id: string) => [...jobKeys.details(), id] as const,
    myPosts: () => [...jobKeys.all, 'myPosts'] as const,
    myPostsList: (params: { page?: number; pageSize?: number }) =>
        [...jobKeys.myPosts(), params] as const,
    mySubmissions: () => [...jobKeys.all, 'mySubmissions'] as const,
    mySubmissionsList: (params: { page?: number; pageSize?: number }) =>
        [...jobKeys.mySubmissions(), params] as const,
};

// Get Jobs Hook
export const useGetJobs = (params: { page?: number; pageSize?: number; search?: string }) => {
    return useQuery({
        queryKey: jobKeys.list(params),
        queryFn: () => jobApi.getJobs(params),
        staleTime: 60000, // 1 minute
    });
};

// Get Job By ID Hook
export const useGetJobById = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: jobKeys.detail(id),
        queryFn: () => jobApi.getJobById(id),
        enabled: options?.enabled !== false && !!id,
        staleTime: 300000, // 5 minutes
    });
};

// Get My Posts Hook
export const useGetMyPosts = (params: { page?: number; pageSize?: number } = {}) => {
    return useQuery({
        queryKey: jobKeys.myPostsList(params),
        queryFn: () => jobApi.getMyPosts(params),
        staleTime: 60000, // 1 minute
    });
};

// Create Job Hook
export const useCreateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobApi.createJob,
        onSuccess: () => {
            // Invalidate job lists to refetch
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

// Update Job Hook
export const useUpdateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateJobRequest }) =>
            jobApi.updateJob(id, body),
        onSuccess: (_, variables) => {
            // Invalidate specific job detail and lists
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

// Delete Job Hook
export const useDeleteJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobApi.deleteJob,
        onSuccess: () => {
            // Invalidate job lists
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

// Submit Job Application Hook
export const useSubmitJobApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ jobId, body }: { jobId: string; body: SubmitApplicationRequest }) =>
            jobApi.submitJobApplication(jobId, body),
        onSuccess: (_, variables) => {
            // Invalidate job detail to refresh application count
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
            queryClient.invalidateQueries({ queryKey: jobKeys.mySubmissions() });
        },
    });
};

// Get My Submissions Hook
export const useGetMySubmissions = (params: { page?: number; pageSize?: number } = {}) => {
    return useQuery({
        queryKey: jobKeys.mySubmissionsList(params),
        queryFn: () => jobApi.getMySubmissions(params),
        staleTime: 30000, // 30 seconds
    });
};
