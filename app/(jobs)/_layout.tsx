import { Stack } from 'expo-router';

export default function JobsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="detail" />
            <Stack.Screen name="recruitment-form" />
            <Stack.Screen name="edit-job" />
            <Stack.Screen name="my-applications" />
            <Stack.Screen name="applicants" />
        </Stack>
    );
}
