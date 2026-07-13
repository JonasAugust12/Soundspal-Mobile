import { useEffect } from 'react';
import { useRouter, useSegments, usePathname, useGlobalSearchParams } from 'expo-router';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useAuthHydration } from '@/features/auth/presentation/hooks/useAuthHydration';
import { useRedirectStore } from '@/shared/presentation/store/redirectStore';

export function useProtectedRoute() {
    const segments = useSegments();
    const router = useRouter();
    const pathname = usePathname();
    const globalParams = useGlobalSearchParams();
    const { isAuthenticated, user } = useAuthStore();
    const authHydrated = useAuthHydration();

    useEffect(() => {
        if (!authHydrated) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inProtectedGroup =
            segments[0] === '(tabs)' ||
            segments[0] === '(profiles)' ||
            segments[0] === '(jobs)' ||
            segments[0] === '(messages)' ||
            segments[0] === '(editprofile)' ||
            segments[0] === '(payments)';

        const segmentsArray = segments as string[];
        const isOnEmailVerificationRequired =
            segmentsArray.length > 1 && segmentsArray[1] === 'email-verification-required';
        const isOnVerifyEmail = segmentsArray.length > 1 && segmentsArray[1] === 'verify-email';

        // 1. Not logged in and trying to access protected route → redirect to login
        if (!isAuthenticated && inProtectedGroup) {
            // Lưu returnTo cho các màn nội dung có thể deep-link (giống buildLoginHref bên web).
            // Loại trừ (tabs) và (editprofile) để logout không tự bắt chính màn đó làm returnTo.
            const isReturnToEligible =
                segments[0] === '(profiles)' ||
                segments[0] === '(jobs)' ||
                segments[0] === '(messages)' ||
                segments[0] === '(payments)';

            if (
                isReturnToEligible &&
                pathname &&
                pathname !== '/' &&
                !pathname.startsWith('/login')
            ) {
                const params: Record<string, string> = {};
                for (const [key, value] of Object.entries(globalParams)) {
                    if (typeof value === 'string') params[key] = value;
                }
                useRedirectStore.getState().setPending(pathname, params);
            }
            router.replace('/(auth)/login');
            return;
        }

        // 2. Logged in but not verified
        if (isAuthenticated && user && !user.is_verified) {
            // Allow staying on verify email or email verification required pages
            if (!isOnEmailVerificationRequired && !isOnVerifyEmail) {
                router.replace('/(auth)/email-verification-required');
                return;
            }
        }

        // 3. Logged in, verified, and on auth screen → quay lại điểm đến đã lưu (returnTo) hoặc home
        if (isAuthenticated && user?.is_verified && inAuthGroup) {
            const { pendingPath, pendingParams, clearPending } = useRedirectStore.getState();
            if (pendingPath) {
                clearPending();
                router.replace({ pathname: pendingPath as `${string}`, params: pendingParams });
            } else {
                router.replace('/(tabs)');
            }
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authHydrated, isAuthenticated, user, segments, pathname, router]);
}
