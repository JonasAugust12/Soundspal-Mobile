import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';

export default function Index() {
    const { isAuthenticated } = useAuthStore();

    // Redirect based on auth state
    return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
