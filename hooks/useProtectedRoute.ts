import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export function useProtectedRoute() {
    const segments = useSegments();
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';
        const inProtectedGroup =
            segments[0] === '(tabs)' ||
            segments[0] === '(profiles)' ||
            segments[0] === '(jobs)' ||
            segments[0] === '(messages)' ||
            segments[0] === '(editprofile)';

        const segmentsArray = segments as string[];
        const isOnEmailVerificationRequired =
            segmentsArray.length > 1 && segmentsArray[1] === 'email-verification-required';
        const isOnVerifyEmail = segmentsArray.length > 1 && segmentsArray[1] === 'verify-email';

        // 1. Not logged in and trying to access protected route → redirect to login
        if (!isAuthenticated && inProtectedGroup) {
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

        // 3. Logged in, verified, and on auth screen → redirect to home
        if (isAuthenticated && user?.is_verified && inAuthGroup) {
            router.replace('/(tabs)');
            return;
        }
    }, [isAuthenticated, user?.is_verified, segments, router]);
}
