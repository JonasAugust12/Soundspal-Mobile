import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type {
    UpdateJobRequest,
    SubmitApplicationRequest,
    JobListResponse,
    GetJobSubmissionsParams,
    WithdrawSubmissionRequest,
    ReviewSubmissionRequest,
    BulkReviewRequest,
} from '@/features/jobs/domain/entities/job.type';
import type { GetJobsParams } from '@/features/jobs/domain/repositories/IJobRepository';
import { jobRepository } from '@/features/jobs/data/repositories/JobRepositoryImpl';
import { GetJobsUseCase } from '@/features/jobs/domain/usecases/GetJobsUseCase';
import { SubmitJobApplicationUseCase } from '@/features/jobs/domain/usecases/SubmitJobApplicationUseCase';
import { isApiNotFound } from '@/shared/utils/apiError';

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

function findJobInMyPostsQueryCache(
    queryClient: ReturnType<typeof useQueryClient>,
    jobId: string,
): JobListResponse['posts'][number] | undefined {
    const entries = queryClient.getQueriesData<InfiniteData<JobListResponse>>({
        queryKey: jobKeys.myPosts(),
    });

    for (const [, data] of entries) {
        if (!data?.pages) {
            continue;
        }
        const found = data.pages
            .flatMap((page) => page.posts ?? [])
            .find((post) => post.id === jobId);
        if (found) {
            return found;
        }
    }

    return undefined;
}

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
    jobSubmissions: (jobId: string) => [...jobKeys.all, 'jobSubmissions', jobId] as const,
    jobSubmissionsList: (jobId: string, params: GetJobSubmissionsParams) =>
        [...jobKeys.jobSubmissions(jobId), params] as const,
    pendingCount: () => [...jobKeys.all, 'pendingCount'] as const,
};

export const useGetJobs = (params: GetJobsParams) => {
    return useQuery({
        queryKey: jobKeys.list(params),
        queryFn: () => getJobsUseCase.execute(params),
        staleTime: 60000,
    });
};

/** Paginated public job list — loads more as the user scrolls. */
export const useGetJobsInfinite = (params: JobsInfiniteParams) => {
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
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetJobById = (id: string, options?: { enabled?: boolean }) => {
    const queryClient = useQueryClient();
    const cachedOwnedJob = id ? findJobInMyPostsQueryCache(queryClient, id) : undefined;

    return useQuery({
        queryKey: jobKeys.detail(id),
        queryFn: async () => {
            try {
                return await jobRepository.getJobById(id);
            } catch (err) {
                if (isApiNotFound(err)) {
                    await queryClient.invalidateQueries({ queryKey: jobKeys.myPosts() });
                }
                throw err;
            }
        },
        enabled: options?.enabled !== false && !!id,
        staleTime: 300000,
        placeholderData: cachedOwnedJob,
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
export const useGetMyPostsInfinite = (params: MyPostsInfiniteParams = {}) => {
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
        refetchOnMount: false,
        refetchOnWindowFocus: false,
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

export const useReopenJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobRepository.reopenJob,
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

/** Flow 7 — Artist rút đơn ứng tuyển. */
export const useWithdrawSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            submissionId,
            body,
        }: {
            submissionId: string;
            body: WithdrawSubmissionRequest;
        }) => jobRepository.withdrawSubmission(submissionId, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.mySubmissions() });
        },
    });
};

/** Flow 5 — Venue xem danh sách đơn ứng tuyển của 1 job. */
export const useGetJobSubmissions = (jobId: string, params: GetJobSubmissionsParams = {}) => {
    return useQuery({
        queryKey: jobKeys.jobSubmissionsList(jobId, params),
        queryFn: () => jobRepository.getJobSubmissions(jobId, params),
        enabled: !!jobId,
        staleTime: 30000,
    });
};

/** Flow 5 — Venue accept/reject/skip 1 đơn. */
export const useReviewSubmission = (jobId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            submissionId,
            body,
        }: {
            submissionId: string;
            body: ReviewSubmissionRequest;
        }) => jobRepository.reviewSubmission(submissionId, body),
        onSuccess: () => {
            if (jobId) {
                queryClient.invalidateQueries({ queryKey: jobKeys.jobSubmissions(jobId) });
                queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
            }
            queryClient.invalidateQueries({ queryKey: jobKeys.pendingCount() });
        },
    });
};

/** Flow 5 — Venue duyệt hàng loạt (accept/reject/skip nhiều đơn). */
export const useBulkReviewSubmissions = (jobId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: BulkReviewRequest) => jobRepository.bulkReviewSubmissions(body),
        onSuccess: () => {
            if (jobId) {
                queryClient.invalidateQueries({ queryKey: jobKeys.jobSubmissions(jobId) });
                queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
            }
            queryClient.invalidateQueries({ queryKey: jobKeys.pendingCount() });
        },
    });
};

/** Flow 9 — Số đơn đang chờ duyệt (badge cho venue). */
export const useGetPendingApplicationsCount = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: jobKeys.pendingCount(),
        queryFn: () => jobRepository.getPendingApplicationsCount(),
        enabled: options?.enabled !== false,
        staleTime: 60000,
        refetchInterval: 60000,
    });
};

export type { GetJobsParams } from '@/features/jobs/domain/repositories/IJobRepository';
