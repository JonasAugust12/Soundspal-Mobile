import { Stack } from 'expo-router';

export default function JobsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="detail" />
            <Stack.Screen name="recruitment-form" />
        </Stack>
    );
}
