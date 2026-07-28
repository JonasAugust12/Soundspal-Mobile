/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react-native';
import { useRouter, useSegments, usePathname, useGlobalSearchParams } from 'expo-router';
import { useProtectedRoute } from '@/shared/presentation/hooks/useProtectedRoute';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useAuthHydration } from '@/features/auth/presentation/hooks/useAuthHydration';

jest.mock('expo-router');
jest.mock('@/features/auth/presentation/store/authStore');
jest.mock('@/features/auth/presentation/hooks/useAuthHydration');
jest.mock('@/shared/presentation/store/redirectStore', () => ({
    useRedirectStore: Object.assign(jest.fn(), {
        getState: jest.fn(() => ({
            pendingPath: null,
            pendingParams: {},
            setPending: jest.fn(),
            clearPending: jest.fn(),
        })),
    }),
}));

const mockRouter = {
    replace: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSegments = useSegments as jest.MockedFunction<typeof useSegments>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseGlobalSearchParams = useGlobalSearchParams as jest.MockedFunction<
    typeof useGlobalSearchParams
>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseAuthHydration = useAuthHydration as jest.MockedFunction<typeof useAuthHydration>;

describe('useProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue(mockRouter as any);
        mockUsePathname.mockReturnValue('/');
        mockUseGlobalSearchParams.mockReturnValue({} as any);
        mockUseAuthHydration.mockReturnValue(true);
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
            mockUsePathname.mockReturnValue('/artistProfile');

            renderHook(() => useProtectedRoute());

            expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
        });

        it('should redirect to login when accessing protected route (jobs)', () => {
            mockUseSegments.mockReturnValue(['(jobs)', 'create'] as any);
            mockUsePathname.mockReturnValue('/create');

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
