import { Stack } from 'expo-router';

export default function EditProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="leaderboard" />
            <Stack.Screen name="beat-detail" />
            <Stack.Screen name="record" />
            <Stack.Screen name="explore" />
        </Stack>
    );
}
