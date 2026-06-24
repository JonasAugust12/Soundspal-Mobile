/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

jest.mock('expo-router');
jest.mock('@/stores/authStore');

const mockRouter = {
    replace: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSegments = useSegments as jest.MockedFunction<typeof useSegments>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('useProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue(mockRouter as any);
    });

    describe('Unauthenticated user', () => {
        beforeEach(() => {
            mockUseAuthStore.mockReturnValue({
                isAuthenticated: false,
                user: null,
            } as any);
        });

        it('should redirect to login when accessing protected route (tabs)', () => {
            mockUseSegments.mockReturnValue(['(tabs)'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
        });

        it('should redirect to login when accessing protected route (profiles)', () => {
            mockUseSegments.mockReturnValue(['(profiles)', 'user123'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
        });

        it('should redirect to login when accessing protected route (jobs)', () => {
            mockUseSegments.mockReturnValue(['(jobs)', 'create'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
        });

        it('should not redirect when on auth screen', () => {
            mockUseSegments.mockReturnValue(['(auth)', 'login'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).not.toHaveBeenCalled();
        });
    });

    describe('Authenticated but unverified user', () => {
        beforeEach(() => {
            mockUseAuthStore.mockReturnValue({
                isAuthenticated: true,
                user: { id: '123', is_verified: false },
            } as any);
        });

        it('should redirect to email verification required', () => {
            mockUseSegments.mockReturnValue(['(tabs)'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/email-verification-required');
        });

        it('should not redirect when on email-verification-required page', () => {
            mockUseSegments.mockReturnValue(['(auth)', 'email-verification-required'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).not.toHaveBeenCalled();
        });

        it('should not redirect when on verify-email page', () => {
            mockUseSegments.mockReturnValue(['(auth)', 'verify-email'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).not.toHaveBeenCalled();
        });
    });

    describe('Authenticated and verified user', () => {
        beforeEach(() => {
            mockUseAuthStore.mockReturnValue({
                isAuthenticated: true,
                user: { id: '123', is_verified: true },
            } as any);
        });

        it('should redirect to home when on auth screen', () => {
            mockUseSegments.mockReturnValue(['(auth)', 'login'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
        });

        it('should not redirect when on protected routes', () => {
            mockUseSegments.mockReturnValue(['(tabs)', 'home'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).not.toHaveBeenCalled();
        });

        it('should not redirect when on profiles', () => {
            mockUseSegments.mockReturnValue(['(profiles)', 'user123'] as any);

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).not.toHaveBeenCalled();
        });
    });
});
