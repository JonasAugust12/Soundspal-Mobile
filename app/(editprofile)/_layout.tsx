import { Stack } from 'expo-router';

export default function EditProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="editProfile" />
            <Stack.Screen name="venueEditProfile" />
            <Stack.Screen name="change-email" />
        </Stack>
    );
}
