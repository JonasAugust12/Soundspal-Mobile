import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    FlatList,
    Image,
    ActivityIndicator,
    Dimensions,
    Platform,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Images, Trash2, ImagePlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import {
    useGetCurrentUserMedia,
    useGetUserMedia,
    useDeleteUserMedia,
    useUploadUserMedia,
} from '@/features/profiles/presentation/hooks/useUserApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { ConfirmModal } from '@/shared/presentation/ui';

const { width: screenWidth } = Dimensions.get('window');
const PADDING = 16;
const GAP = 12;
const imageSize = (screenWidth - PADDING * 2 - GAP * 2) / 3;

export default function PortfolioGalleryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();
    const { showSuccess, showError } = useToast();

    const isMe = !params.username || params.username === currentUser?.username;

    const {
        data: currentMedia,
        isLoading: isLoadingCurrent,
        refetch: refetchCurrent,
    } = useGetCurrentUserMedia({ enabled: isMe });
    const { data: otherMedia, isLoading: isLoadingOther } = useGetUserMedia(params.username || '', {
        enabled: !isMe,
    });

    const uploadMedia = useUploadUserMedia();
    const deleteMedia = useDeleteUserMedia();

    const [deleteConfirm, setDeleteConfirm] = useState<{
        visible: boolean;
        mediaId: string | null;
    }>({ visible: false, mediaId: null });

    const userMedia = isMe ? currentMedia : otherMedia;
    const isLoading = isMe ? isLoadingCurrent : isLoadingOther;

    // Filter portfolio images
    const portfolioImages = userMedia?.media?.filter((m) => m.media_type === 'portfolio') || [];

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];

                // Create FormData
                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri,
                    type: asset.mimeType || 'image/jpeg',
                    name: asset.fileName || 'portfolio.jpg',
                } as unknown as Blob);
                formData.append('media_type', 'portfolio');

                await uploadMedia.mutateAsync(formData);
                showSuccess('Thành công', 'Đã thêm ảnh vào portfolio');
                refetchCurrent();
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            showError('Lỗi', err?.message || 'Không thể tải ảnh lên');
        }
    };

    const handleDeleteImage = async () => {
        if (!deleteConfirm.mediaId) return;

        try {
            await deleteMedia.mutateAsync(deleteConfirm.mediaId);
            showSuccess('Đã xóa', 'Ảnh đã được xóa khỏi portfolio');
            setDeleteConfirm({ visible: false, mediaId: null });
            refetchCurrent();
        } catch (error: unknown) {
            const err = error as { message?: string };
            showError('Lỗi', err?.message || 'Không thể xóa ảnh');
        }
    };

    const openDeleteConfirm = (mediaId: string) => {
        setDeleteConfirm({ visible: true, mediaId });
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirm({ visible: false, mediaId: null });
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
            <View className="flex-row items-center px-4 py-3 border-b border-border">
                <Pressable
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-muted"
                >
                    <ChevronLeft size={24} color="#09090b" />
                </Pressable>
                <Text className="text-lg font-bold text-foreground flex-1 ml-2">Portfolio</Text>
            </View>

            <FlatList
                data={portfolioImages}
                numColumns={3}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: PADDING, gap: GAP }}
                columnWrapperStyle={{ gap: GAP }}
                ListHeaderComponent={
                    <View className="mb-4">
                        {/* Gradient Banner */}
                        <LinearGradient
                            colors={['#7C3AED', '#EC4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.bannerContainer}
                            className="rounded-2xl p-5 items-center"
                        >
                            <Images size={32} color="#FFFFFF" />
                            <Text className="text-white text-lg font-bold mt-2">Thư viện ảnh</Text>
                            <Text className="text-white/80 text-sm text-center mt-1">
                                {portfolioImages.length} ảnh trong portfolio
                            </Text>
                        </LinearGradient>

                        {/* Add Image Button - Only show for owner */}
                        {isMe && (
                            <Pressable
                                onPress={handlePickImage}
                                disabled={uploadMedia.isPending}
                                className="mt-4 flex-row items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 active:bg-primary/10"
                                style={{ opacity: uploadMedia.isPending ? 0.5 : 1 }}
                            >
                                <ImagePlus size={24} color="#7C3AED" />
                                <Text className="text-primary font-semibold">
                                    {uploadMedia.isPending ? 'Đang tải lên...' : 'Thêm ảnh mới'}
                                </Text>
                            </Pressable>
                        )}

                        {/* Info tip */}
                        {isMe && (
                            <View className="mt-4 p-4 bg-muted/30 rounded-xl">
                                <Text className="text-sm text-muted-foreground">
                                    💡 Thêm ảnh vào portfolio của bạn để giới thiệu công việc và
                                    phong cách của mình.
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={[styles.imageWrapper, { width: imageSize, height: imageSize }]}
                        className="rounded-xl overflow-hidden"
                    >
                        <Image
                            source={{ uri: item.file_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        {isMe && (
                            <Pressable
                                onPress={() => openDeleteConfirm(item.id)}
                                className="absolute top-2 right-2 p-2 bg-red-500/90 rounded-full active:bg-red-600"
                            >
                                <Trash2 size={14} color="#ffffff" />
                            </Pressable>
                        )}
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-16">
                        <View className="w-20 h-20 rounded-2xl bg-muted/50 items-center justify-center mb-4">
                            <Images size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-muted-foreground text-base font-medium">
                            Chưa có ảnh trong portfolio
                        </Text>
                        {isMe && (
                            <Text className="text-muted-foreground/70 text-sm mt-1">
                                Nhấn nút + để thêm ảnh
                            </Text>
                        )}
                    </View>
                }
            />

            {/* Confirm Delete Modal */}
            <ConfirmModal
                visible={deleteConfirm.visible}
                title="Xóa ảnh"
                message="Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isDestructive
                isLoading={deleteMedia.isPending}
                onConfirm={handleDeleteImage}
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
    imageWrapper: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
