import { Stack } from "expo-router";

export default function ProfilesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="artistProfile" />
      <Stack.Screen name="venueProfile" />
      <Stack.Screen name="portfolioGallery" />
      <Stack.Screen name="videoGallery" />
      <Stack.Screen name="featuredReleases" />
      <Stack.Screen name="collaboration" />
      <Stack.Screen name="jobSubmissions" />
    </Stack>
  );
}
