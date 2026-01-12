import React from 'react';
import { View, Text, Pressable, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';

import { useGetCurrentUserMedia, useGetUserMedia, useDeleteUserMedia } from '@/hooks/useUserApi';
import { useAuthStore } from '@/stores/authStore';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 48 - 24) / 3; // padding + gaps

export default function PortfolioGalleryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();

    const isMe = !params.username;

    const { data: currentMedia, isLoading: isLoadingCurrent, refetch: refetchCurrent } =
        useGetCurrentUserMedia({ enabled: isMe });
    const { data: otherMedia, isLoading: isLoadingOther } = useGetUserMedia(params.username || '', {
        enabled: !isMe,
    });

    const deleteMedia = useDeleteUserMedia();

    const userMedia = isMe ? currentMedia : otherMedia;
    const isLoading = isMe ? isLoadingCurrent : isLoadingOther;

    // Filter portfolio images
    const portfolioImages = userMedia?.media?.filter((m) => m.media_type === 'portfolio') || [];

    const handleDelete = async (mediaId: string) => {
        try {
            await deleteMedia.mutateAsync(mediaId);
            refetchCurrent();
        } catch (error) {
            console.error('Failed to delete media:', error);
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
                <Text className="text-lg font-bold text-foreground flex-1 ml-2">Portfolio</Text>
                {isMe && (
                    <Pressable className="p-2 bg-primary rounded-full">
                        <Plus size={20} color="#ffffff" />
                    </Pressable>
                )}
            </View>

            {/* Image Grid */}
            <FlatList
                data={portfolioImages}
                numColumns={3}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 12 }}
                renderItem={({ item }) => (
                    <Pressable
                        className="relative m-1"
                        style={{ width: imageSize, height: imageSize }}
                    >
                        <Image
                            source={{ uri: item.file_url }}
                            className="w-full h-full rounded-lg"
                            resizeMode="cover"
                        />
                        {isMe && (
                            <Pressable
                                onPress={() => handleDelete(item.id)}
                                className="absolute top-1 right-1 p-1.5 bg-red-500/90 rounded-full"
                            >
                                <Trash2 size={14} color="#ffffff" />
                            </Pressable>
                        )}
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center p-20">
                        <Text className="text-muted-foreground">Chưa có ảnh portfolio</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
