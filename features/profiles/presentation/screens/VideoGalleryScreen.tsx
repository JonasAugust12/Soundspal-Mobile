import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    FlatList,
    ActivityIndicator,
    Platform,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Video as VideoIcon, Trash2, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { VideoPlayer, AddVideoModal } from '@/features/profiles/presentation/components/profile';
import {
    useGetUserVideos,
    useDeleteUserVideo,
} from '@/features/profiles/presentation/hooks/useUserApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { ConfirmModal } from '@/shared/presentation/ui';

const PADDING = 16;
const GAP = 12;

export default function VideoGalleryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();
    const { showSuccess, showError } = useToast();

    // Fix isMe logic - same as portfolioGallery
    const isMe = !params.username || params.username === currentUser?.username;
    const username = isMe ? currentUser?.username || '' : params.username || '';

    const {
        data: userVideos,
        isLoading,
        refetch,
    } = useGetUserVideos(username, {
        enabled: !!username,
    });
    const deleteVideo = useDeleteUserVideo();

    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        visible: boolean;
        videoId: string | null;
    }>({ visible: false, videoId: null });

    const handleDeleteVideo = async () => {
        if (!deleteConfirm.videoId) return;

        try {
            await deleteVideo.mutateAsync(deleteConfirm.videoId);
            showSuccess('Đã xóa', 'Video đã được xóa khỏi thư viện');
            setDeleteConfirm({ visible: false, videoId: null });
            refetch();
        } catch (error: unknown) {
            const err = error as { message?: string };
            showError('Lỗi', err?.message || 'Không thể xóa video');
        }
    };

    const openDeleteConfirm = (videoId: string) => {
        setDeleteConfirm({ visible: true, videoId });
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirm({ visible: false, videoId: null });
    };

    const videos = userVideos?.items || [];

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
            <View className="flex-row items-center px-4 py-3 border-b border-border">
                <Pressable
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-muted"
                >
                    <ChevronLeft size={24} color="#09090b" />
                </Pressable>
                <Text className="text-lg font-bold text-foreground flex-1 ml-2">Video</Text>
            </View>

            {/* Video Grid */}
            <FlatList
                data={videos}
                numColumns={2}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: PADDING, gap: GAP }}
                columnWrapperStyle={{ gap: GAP }}
                ListHeaderComponent={
                    <View className="mb-4">
                        {/* Gradient Banner */}
                        <LinearGradient
                            colors={['#7C3AED', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.bannerContainer}
                            className="rounded-2xl p-5 items-center"
                        >
                            <VideoIcon size={32} color="#FFFFFF" />
                            <Text className="text-white text-lg font-bold mt-2">
                                Thư viện video
                            </Text>
                            <Text className="text-white/80 text-sm text-center mt-1">
                                {videos.length} video trong thư viện
                            </Text>
                        </LinearGradient>

                        {/* Add Video Button - Only show for owner */}
                        {isMe && (
                            <Pressable
                                onPress={() => setShowAddModal(true)}
                                className="mt-4 flex-row items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 active:bg-primary/10"
                            >
                                <Plus size={24} color="#7C3AED" />
                                <Text className="text-primary font-semibold">Thêm video mới</Text>
                            </Pressable>
                        )}

                        {/* Info tip */}
                        {isMe && (
                            <View className="mt-4 p-4 bg-muted/30 rounded-xl">
                                <Text className="text-sm text-muted-foreground">
                                    💡 Thêm video demo để giới thiệu tài năng của bạn với khách hàng
                                    tiềm năng.
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="flex-1 relative">
                        <VideoPlayer
                            videoUrl={item.video_url}
                            thumbnailUrl={item.thumbnail_url}
                            title={item.title}
                        />
                        {isMe && (
                            <Pressable
                                onPress={() => openDeleteConfirm(item.id)}
                                className="absolute top-2 right-2 p-2 bg-red-500/90 rounded-full active:bg-red-600"
                            >
                                <Trash2 size={14} color="#ffffff" />
                            </Pressable>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-16">
                        <View className="w-20 h-20 rounded-2xl bg-muted/50 items-center justify-center mb-4">
                            <VideoIcon size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-muted-foreground text-base font-medium">
                            Chưa có video nào
                        </Text>
                        {isMe && (
                            <Text className="text-muted-foreground/70 text-sm mt-1">
                                Nhấn nút + để thêm video
                            </Text>
                        )}
                    </View>
                }
            />

            {/* Add Video Modal */}
            <AddVideoModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => refetch()}
            />

            {/* Confirm Delete Modal */}
            <ConfirmModal
                visible={deleteConfirm.visible}
                title="Xóa video"
                message="Bạn có chắc chắn muốn xóa video này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isDestructive
                isLoading={deleteVideo.isPending}
                onConfirm={handleDeleteVideo}
                onCancel={closeDeleteConfirm}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bannerContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});
