import React from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';

import { VideoPlayer } from '@/components/profile';
import { useGetCurrentUser, useGetUserVideos, useDeleteUserVideo } from '@/hooks/useUserApi';
import { useAuthStore } from '@/stores/authStore';

export default function VideoGalleryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();

    const isMe = !params.username;
    const username = isMe ? currentUser?.username || '' : params.username || '';

    const { data: userVideos, isLoading, refetch } = useGetUserVideos(username, {
        enabled: !!username,
    });
    const deleteVideo = useDeleteUserVideo();

    const handleDelete = async (videoId: string) => {
        try {
            await deleteVideo.mutateAsync(videoId);
            refetch();
        } catch (error) {
            console.error('Failed to delete video:', error);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-border">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft size={24} color="#09090b" />
                </Pressable>
                <Text className="text-lg font-bold text-foreground flex-1 ml-2">Video</Text>
                {isMe && (
                    <Pressable className="p-2 bg-primary rounded-full">
                        <Plus size={20} color="#ffffff" />
                    </Pressable>
                )}
            </View>

            {/* Video Grid */}
            <FlatList
                data={userVideos?.items || []}
                numColumns={2}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 12, gap: 12 }}
                columnWrapperStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                    <View className="flex-1 relative">
                        <VideoPlayer
                            videoUrl={item.video_url}
                            thumbnailUrl={item.thumbnail_url}
                            title={item.title}
                        />
                        {isMe && (
                            <Pressable
                                onPress={() => handleDelete(item.id)}
                                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full"
                            >
                                <Trash2 size={16} color="#ffffff" />
                            </Pressable>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center p-20">
                        <Text className="text-muted-foreground">Chưa có video nào</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
