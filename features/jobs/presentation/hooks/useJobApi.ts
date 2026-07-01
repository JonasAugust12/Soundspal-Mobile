import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    UpdateJobRequest,
    SubmitApplicationRequest,
} from '@/features/jobs/domain/entities/job.type';
import { jobRepository } from '@/features/jobs/data/repositories/JobRepositoryImpl';
import { GetJobsUseCase } from '@/features/jobs/domain/usecases/GetJobsUseCase';
import { SubmitJobApplicationUseCase } from '@/features/jobs/domain/usecases/SubmitJobApplicationUseCase';

const getJobsUseCase = new GetJobsUseCase(jobRepository);
const submitJobApplicationUseCase = new SubmitJobApplicationUseCase(jobRepository);

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

export const useGetJobs = (params: { page?: number; pageSize?: number; search?: string }) => {
    return useQuery({
        queryKey: jobKeys.list(params),
        queryFn: () => getJobsUseCase.execute(params),
        staleTime: 60000,
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
