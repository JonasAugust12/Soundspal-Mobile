import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
    const { isAuthenticated } = useAuthStore();

    // Redirect based on auth state
    return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
