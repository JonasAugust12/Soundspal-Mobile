import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    UpdateJobRequest,
    SubmitApplicationRequest,
    JobListResponse,
} from '@/features/jobs/domain/entities/job.type';
import type { GetJobsParams } from '@/features/jobs/domain/repositories/IJobRepository';
import { jobRepository } from '@/features/jobs/data/repositories/JobRepositoryImpl';
import { GetJobsUseCase } from '@/features/jobs/domain/usecases/GetJobsUseCase';
import { SubmitJobApplicationUseCase } from '@/features/jobs/domain/usecases/SubmitJobApplicationUseCase';

const getJobsUseCase = new GetJobsUseCase(jobRepository);
const submitJobApplicationUseCase = new SubmitJobApplicationUseCase(jobRepository);

const DEFAULT_JOB_PAGE_SIZE = 10;

const getJobListNextPageParam = (
    lastPage: JobListResponse,
    pageSize: number,
    loadedPageCount: number,
) => {
    const pagination = lastPage.pagination;
    if (pagination) {
        if (pagination.current_page >= pagination.total_pages) {
            return undefined;
        }
        return pagination.current_page + 1;
    }
    const count = lastPage.posts?.length ?? 0;
    if (count < pageSize) {
        return undefined;
    }
    return loadedPageCount + 1;
};

type JobsInfiniteParams = Omit<GetJobsParams, 'page'>;
type MyPostsInfiniteParams = { pageSize?: number };

export const jobKeys = {
    all: ['jobs'] as const,
    lists: () => [...jobKeys.all, 'list'] as const,
    list: (params: GetJobsParams) => [...jobKeys.lists(), params] as const,
    details: () => [...jobKeys.all, 'detail'] as const,
    detail: (id: string) => [...jobKeys.details(), id] as const,
    myPosts: () => [...jobKeys.all, 'myPosts'] as const,
    myPostsList: (params: { page?: number; pageSize?: number }) =>
        [...jobKeys.myPosts(), params] as const,
    mySubmissions: () => [...jobKeys.all, 'mySubmissions'] as const,
    mySubmissionsList: (params: { page?: number; pageSize?: number }) =>
        [...jobKeys.mySubmissions(), params] as const,
};

export const useGetJobs = (params: GetJobsParams) => {
    return useQuery({
        queryKey: jobKeys.list(params),
        queryFn: () => getJobsUseCase.execute(params),
        staleTime: 60000,
    });
};

/** Paginated public job list — loads more as the user scrolls. */
export const useGetJobsInfinite = (params: JobsInfiniteParams, options?: { enabled?: boolean }) => {
    const pageSize = params.pageSize ?? DEFAULT_JOB_PAGE_SIZE;

    return useInfiniteQuery({
        queryKey: [...jobKeys.lists(), 'infinite', params],
        queryFn: ({ pageParam }) =>
            getJobsUseCase.execute({
                ...params,
                page: pageParam,
                pageSize,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            getJobListNextPageParam(lastPage, pageSize, allPages.length),
        staleTime: 60000,
        enabled: options?.enabled !== false,
    });
};

export const useGetJobById = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: jobKeys.detail(id),
        queryFn: () => jobRepository.getJobById(id),
        enabled: options?.enabled !== false && !!id,
        staleTime: 300000,
    });
};

export const useGetMyPosts = (params: { page?: number; pageSize?: number } = {}) => {
    return useQuery({
        queryKey: jobKeys.myPostsList(params),
        queryFn: () => jobRepository.getMyPosts(params),
        staleTime: 60000,
    });
};

/** Paginated my-posts list — loads more as the user scrolls. */
export const useGetMyPostsInfinite = (
    params: MyPostsInfiniteParams = {},
    options?: { enabled?: boolean },
) => {
    const pageSize = params.pageSize ?? DEFAULT_JOB_PAGE_SIZE;

    return useInfiniteQuery({
        queryKey: [...jobKeys.myPosts(), 'infinite', params],
        queryFn: ({ pageParam }) =>
            jobRepository.getMyPosts({
                page: pageParam,
                pageSize,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            getJobListNextPageParam(lastPage, pageSize, allPages.length),
        staleTime: 60000,
        enabled: options?.enabled !== false,
    });
};

export const useCreateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobRepository.createJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateJobRequest }) =>
            jobRepository.updateJob(id, body),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobRepository.deleteJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

export const usePublishJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobRepository.publishJob,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

export const useCloseJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobRepository.closeJob,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
            queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
        },
    });
};

export const useSubmitJobApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ jobId, body }: { jobId: string; body: SubmitApplicationRequest }) =>
            submitJobApplicationUseCase.execute(jobId, body),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
            queryClient.invalidateQueries({ queryKey: jobKeys.mySubmissions() });
        },
    });
};

export const useGetMySubmissions = (params: { page?: number; pageSize?: number } = {}) => {
    return useQuery({
        queryKey: jobKeys.mySubmissionsList(params),
        queryFn: () => jobRepository.getMySubmissions(params),
        staleTime: 30000,
    });
};

export type { GetJobsParams } from '@/features/jobs/domain/repositories/IJobRepository';
