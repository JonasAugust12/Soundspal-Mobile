import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';

import {
    InfoProfile,
    ProfileImageList,
    VideoPlayer,
    SocialList,
    YoutubeEmbed,
    ProfileSkeleton,
} from '@/components/profile';
import {
    useGetCurrentUser,
    useGetUserByUsername,
    useGetCurrentUserMedia,
    useGetUserMedia,
    useGetUserVideos,
} from '@/hooks/useUserApi';
import { useGetOrCreateConversation } from '@/hooks/useMessagingApi';
import { useAuthStore } from '@/stores/authStore';

export default function ArtistProfile() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();

    // Check if viewing own profile
    const isMe = !params.username;

    // Fetch data based on isMe
    const { data: currentUserData, isLoading: isLoadingCurrentUser } = useGetCurrentUser({
        enabled: isMe,
    });

    const { data: otherUserData, isLoading: isLoadingOtherUser } = useGetUserByUsername(
        params.username || '',
        { enabled: !isMe }
    );

    const { data: currentUserMedia, isLoading: isLoadingCurrentMedia } = useGetCurrentUserMedia({
        enabled: isMe,
    });
    const { data: otherUserMedia, isLoading: isLoadingOtherMedia } = useGetUserMedia(
        params.username || '',
        { enabled: !isMe }
    );

    const getOrCreateConversation = useGetOrCreateConversation();

    // Use appropriate data
    const userData = isMe ? currentUserData : otherUserData;
    const userMedia = isMe ? currentUserMedia : otherUserMedia;
    const isLoadingUser = isMe ? isLoadingCurrentUser : isLoadingOtherUser;
    const isLoadingMedia = isMe ? isLoadingCurrentMedia : isLoadingOtherMedia;

    // Get videos
    const username = userData?.username || '';
    const { data: userVideos, isLoading: isLoadingVideos } = useGetUserVideos(username, {
        enabled: !!username,
    });

    const isLoading = isLoadingUser || isLoadingMedia || isLoadingVideos;

    // Filter portfolio images
    const portfolioImages = userMedia?.media?.filter((m) => m.media_type === 'portfolio') || [];

    const handleSendMessage = async () => {
        if (!userData?.id) return;

        try {
            const result = await getOrCreateConversation.mutateAsync(userData.id);
            router.push({
                pathname: '/(messages)/detailMessage',
                params: { conversationId: result.id },
            });
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    const goBack = () => router.back();

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <ScrollView className="flex-1">
                    <Pressable onPress={goBack} className="absolute top-4 left-4 z-10 p-2">
                        <ChevronLeft size={24} color="#09090b" />
                    </Pressable>
                    <ProfileSkeleton />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Back Button */}
                <Pressable onPress={goBack} className="absolute top-4 left-4 z-10 p-2 bg-white/80 rounded-full">
                    <ChevronLeft size={24} color="#09090b" />
                </Pressable>

                {/* Profile Info */}
                <InfoProfile
                    name={userData?.display_name || 'Người dùng'}
                    location={userData?.city || userData?.country || 'Chưa cập nhật'}
                    rating={4.9}
                    bio={userData?.brief_bio || 'Chưa có thông tin giới thiệu'}
                    avatarSource={
                        userData?.avatar_url
                            ? { uri: userData.avatar_url }
                            : require('@/assets/images/user_profile.png')
                    }
                    backgroundSource={
                        userData?.cover_url
                            ? { uri: userData.cover_url }
                            : require('@/assets/images/background.png')
                    }
                    role={userData?.role?.toLowerCase() as 'singer' | 'producer' | 'venue'}
                />

                <View className="px-4 gap-6 pt-4 pb-8">
                    {/* Message Button - Only for other users */}
                    {!isMe && userData?.id && (
                        <Pressable
                            onPress={handleSendMessage}
                            disabled={getOrCreateConversation.isPending}
                            className="flex-row items-center justify-center gap-2 py-3 rounded-xl bg-primary active:opacity-80"
                        >
                            <MessageCircle size={20} color="#ffffff" />
                            <Text className="text-white font-semibold">Nhắn tin</Text>
                        </Pressable>
                    )}

                    {/* Social Links */}
                    <SocialList
                        facebook={userData?.facebook_url}
                        instagram={userData?.instagram_url}
                        youtube={userData?.youtube_url}
                    />

                    {/* Featured Releases */}
                    <View className="gap-3">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-base font-bold text-foreground">Featured Releases</Text>
                            {(isMe || (userData?.featured_release_links?.length || 0) > 3) && (
                                <Pressable
                                    onPress={() =>
                                        router.push({
                                            pathname: '/(profiles)/featuredReleases',
                                            params: isMe ? {} : { username: userData?.username },
                                        })
                                    }
                                >
                                    <Text className="text-sm text-primary">Xem tất cả</Text>
                                </Pressable>
                            )}
                        </View>

                        {userData?.featured_release_links && userData.featured_release_links.length > 0 ? (
                            <View className="gap-3">
                                {userData.featured_release_links.slice(0, 3).map((link, index) => (
                                    <YoutubeEmbed key={index} url={link} />
                                ))}
                            </View>
                        ) : (
                            <View className="p-4 border border-border rounded-xl bg-card items-center">
                                <Text className="text-sm text-muted-foreground">Chưa có featured releases</Text>
                            </View>
                        )}
                    </View>

                    {/* Videos */}
                    <View className="gap-3">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-base font-bold text-foreground">Video</Text>
                            {(isMe || (userVideos?.items?.length || 0) > 4) && (
                                <Pressable
                                    onPress={() =>
                                        router.push({
                                            pathname: '/(profiles)/videoGallery',
                                            params: isMe ? {} : { username: userData?.username },
                                        })
                                    }
                                >
                                    <Text className="text-sm text-primary">Xem tất cả</Text>
                                </Pressable>
                            )}
                        </View>

                        {userVideos?.items && userVideos.items.length > 0 ? (
                            <View className="flex-row flex-wrap gap-3">
                                {userVideos.items.slice(0, 4).map((video) => (
                                    <VideoPlayer
                                        key={video.id}
                                        videoUrl={video.video_url}
                                        thumbnailUrl={video.thumbnail_url}
                                        title={video.title}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View className="p-4 border border-border rounded-xl bg-card items-center">
                                <Text className="text-sm text-muted-foreground">Chưa có video demo</Text>
                            </View>
                        )}
                    </View>

                    {/* Portfolio Images */}
                    <ProfileImageList
                        title="Ảnh Portfolio"
                        data={portfolioImages.map((media) => ({
                            id: media.id,
                            cover: { uri: media.file_url },
                        }))}
                        onPressSeeAll={
                            isMe
                                ? () => router.push('/(profiles)/portfolioGallery')
                                : portfolioImages.length > 8
                                    ? () =>
                                        router.push({
                                            pathname: '/(profiles)/portfolioGallery',
                                            params: { username: userData?.username },
                                        })
                                    : undefined
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
