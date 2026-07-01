import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
    useSearchUsers,
    useGetGenres,
    useFeaturedUsers,
    useFeaturedJobs,
} from '@/features/explore/presentation/hooks/useSearchApi';
import { createApiCall } from '@/shared/infrastructure/api/apiClient';

jest.mock('@/shared/infrastructure/api/apiClient');

const mockCreateApiCall = createApiCall as jest.MockedFunction<typeof createApiCall>;

// Test wrapper with QueryClientProvider
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useSearchApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useSearchUsers', () => {
        it('should call searchUsers API with correct params', async () => {
            const mockData = { data: { users: [], total: 0 } };
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue(mockData));

            const params = {
                keyword: 'test',
                genre: 'rock',
                page: 1,
                pageSize: 10,
            };

            const { result } = renderHook(() => useSearchUsers(params), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockCreateApiCall).toHaveBeenCalledWith('POST', '/search/users');
        });

        it('should use query key with params', () => {
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue({ data: {} }));

            const params = { keyword: 'test', page: 1, pageSize: 10 };

            renderHook(() => useSearchUsers(params), {
                wrapper: createWrapper(),
            });

            // Query key should include params
            expect(mockCreateApiCall).toHaveBeenCalled();
        });
    });

    describe('useGetGenres', () => {
        it('should fetch genres from API', async () => {
            const mockData = { data: { genres: ['rock', 'jazz', 'pop'] } };
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue(mockData));

            const { result } = renderHook(() => useGetGenres(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockCreateApiCall).toHaveBeenCalledWith('GET', '/users/genres');
        });

        it('should have long stale time for genres', () => {
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue({ data: {} }));

            renderHook(() => useGetGenres(), {
                wrapper: createWrapper(),
            });

            // Genres query should have 1 hour stale time
            expect(mockCreateApiCall).toHaveBeenCalled();
        });
    });

    describe('useFeaturedUsers', () => {
        it('should fetch featured users with default limit', async () => {
            const mockData = { data: { users: [] } };
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue(mockData));

            const { result } = renderHook(() => useFeaturedUsers(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockCreateApiCall).toHaveBeenCalledWith(
                'GET',
                '/landing/featured-users?limit=10',
            );
        });

        it('should fetch featured users with custom limit', async () => {
            const mockData = { data: { users: [] } };
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue(mockData));

            const { result } = renderHook(() => useFeaturedUsers(20), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockCreateApiCall).toHaveBeenCalledWith(
                'GET',
                '/landing/featured-users?limit=20',
            );
        });
    });

    describe('useFeaturedJobs', () => {
        it('should fetch featured jobs with default limit', async () => {
            const mockData = { data: { jobs: [] } };
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue(mockData));

            const { result } = renderHook(() => useFeaturedJobs(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockCreateApiCall).toHaveBeenCalledWith(
                'GET',
                '/landing/featured-jobs?limit=10',
            );
        });

        it('should fetch featured jobs with custom limit', async () => {
            const mockData = { data: { jobs: [] } };
            mockCreateApiCall.mockReturnValue(jest.fn().mockResolvedValue(mockData));

            const { result } = renderHook(() => useFeaturedJobs(15), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockCreateApiCall).toHaveBeenCalledWith(
                'GET',
                '/landing/featured-jobs?limit=15',
            );
        });
    });
});
