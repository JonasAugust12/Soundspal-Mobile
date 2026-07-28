import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Images, Video as VideoIcon } from 'lucide-react-native';

import { MediaUploadSection } from '@/features/profiles/presentation/components/profile/MediaUploadSection';
import { ProfileImageList, VideoPlayer } from '@/features/profiles/presentation/components/profile';
import {
    useGetCurrentUserMedia,
    useGetUserVideos,
} from '@/features/profiles/presentation/hooks/useUserApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';

const PREVIEW_VIDEO_COUNT = 4;

function SectionHeader({
    icon,
    title,
    count,
    onPressManage,
}: {
    icon: React.ReactNode;
    title: string;
    count: number;
    onPressManage: () => void;
}) {
    return (
        <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                    {icon}
                </View>
                <Text className="text-base font-bold text-gray-900 dark:text-white">{title}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">({count})</Text>
            </View>
            <TouchableOpacity
                onPress={onPressManage}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 active:bg-primary/20"
            >
                <Text className="text-sm font-semibold text-primary">Quản lý</Text>
                <ChevronRight size={14} color="#7C3AED" />
            </TouchableOpacity>
        </View>
    );
}

/**
 * Ảnh & Video của tôi — đọc CÙNG nguồn với phần hiển thị trên hồ sơ công khai
 * (`/users/me/media` lọc `portfolio`, và `/users/videos`), nên sửa ở đây là hồ sơ đổi theo.
 *
 * Khối "Tệp dùng khi ứng tuyển" ở cuối là kho KHÁC (`submissions/*`) — nó không lên hồ sơ,
 * chỉ dùng để đính kèm lúc nộp đơn. Giữ lại vì `MediaPicker` trong luồng ứng tuyển chỉ liệt kê
 * chứ không tải lên được, đây là lối nạp tệp duy nhất cho luồng đó.
 */
export default function MediaGalleryScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const username = user?.username || '';

    const { data: userMedia, isLoading: isLoadingMedia } = useGetCurrentUserMedia();
    const { data: userVideos, isLoading: isLoadingVideos } = useGetUserVideos(username, {
        enabled: !!username,
    });

    const portfolioImages = userMedia?.media?.filter((m) => m.media_type === 'portfolio') || [];
    const videos = userVideos?.items || [];

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={SCREEN_SAFE_AREA_EDGES}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft size={24} color="#09090b" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                    Ảnh & Video
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, gap: 16 }}
            >
                {/* Ảnh portfolio — hiện luôn trên hồ sơ */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                    <SectionHeader
                        icon={<Images size={18} color="#7C3AED" />}
                        title="Ảnh portfolio"
                        count={portfolioImages.length}
                        onPressManage={() => router.push('/(profiles)/portfolioGallery')}
                    />

                    {isLoadingMedia ? (
                        <View className="py-10 items-center">
                            <ActivityIndicator color="#7C3BED" />
                        </View>
                    ) : (
                        <ProfileImageList
                            hideHeader
                            data={portfolioImages.map((media) => ({
                                id: media.id,
                                cover: { uri: media.file_url },
                            }))}
                            onPressSeeAll={() => router.push('/(profiles)/portfolioGallery')}
                        />
                    )}
                </View>

                {/* Video — hiện luôn trên hồ sơ */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                    <SectionHeader
                        icon={<VideoIcon size={18} color="#7C3AED" />}
                        title="Video"
                        count={videos.length}
                        onPressManage={() => router.push('/(profiles)/videoGallery')}
                    />

                    {isLoadingVideos ? (
                        <View className="py-10 items-center">
                            <ActivityIndicator color="#7C3BED" />
                        </View>
                    ) : videos.length > 0 ? (
                        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                            {videos.slice(0, PREVIEW_VIDEO_COUNT).map((video) => (
                                <VideoPlayer
                                    key={video.id}
                                    videoUrl={video.video_url}
                                    thumbnailUrl={video.thumbnail_url}
                                    title={video.title}
                                />
                            ))}
                        </View>
                    ) : (
                        <View className="py-10 items-center gap-3 bg-muted/30 rounded-2xl">
                            <View className="w-16 h-16 rounded-2xl bg-muted/60 items-center justify-center">
                                <VideoIcon size={32} color="#9CA3AF" />
                            </View>
                            <Text className="text-sm text-muted-foreground">
                                Chưa có video demo
                            </Text>
                        </View>
                    )}
                </View>

                {/* Kho tệp riêng cho luồng ứng tuyển — KHÔNG hiện trên hồ sơ */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                    <MediaUploadSection />
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
