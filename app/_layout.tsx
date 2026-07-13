import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/infrastructure/api/queryClient';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from '@/shared/presentation/store/themeStore';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { useProtectedRoute } from '@/shared/presentation/hooks/useProtectedRoute';
import { useAuthInitialize } from '@/features/auth/presentation/hooks/useAuthInitialize';
import '../global.css';

function RootLayoutNav() {
    const { isDark } = useThemeStore();
    const { setColorScheme } = useColorScheme();

    // Xác thực token + làm mới user (/users/me) khi mở app
    useAuthInitialize();

    // Handle auth redirects
    useProtectedRoute();

    // Sync theme with NativeWind
    useEffect(() => {
        setColorScheme(isDark ? 'dark' : 'light');
    }, [isDark, setColorScheme]);

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(editprofile)" />
                <Stack.Screen name="(profiles)" />
                <Stack.Screen name="(messages)" />
                <Stack.Screen name="(jobs)" />
                <Stack.Screen name="(payments)" />
                <Stack.Screen name="(blog)" />
                <Stack.Screen name="(challenge)" />
            </Stack>
            <Toast />
        </>
    );
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <KeyboardProvider>
                    <RootLayoutNav />
                </KeyboardProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
