import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageCircle, MapPin, Users, Calendar, Star } from 'lucide-react-native';

import {
    InfoProfile,
    ProfileImageList,
    SocialList,
    ProfileSkeleton,
} from '@/components/profile';
import {
    useGetCurrentUser,
    useGetUserByUsername,
    useGetCurrentUserMedia,
    useGetUserMedia,
} from '@/hooks/useUserApi';
import { useGetOrCreateConversation } from '@/hooks/useMessagingApi';
import { useAuthStore } from '@/stores/authStore';

export default function VenueProfile() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();

    const isMe = !params.username;

    // Fetch data
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

    const userData = isMe ? currentUserData : otherUserData;
    const userMedia = isMe ? currentUserMedia : otherUserMedia;
    const isLoadingUser = isMe ? isLoadingCurrentUser : isLoadingOtherUser;
    const isLoadingMedia = isMe ? isLoadingCurrentMedia : isLoadingOtherMedia;
    const isLoading = isLoadingUser || isLoadingMedia;

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
                    name={userData?.display_name || 'Địa điểm'}
                    location={userData?.city || userData?.country || 'Chưa cập nhật'}
                    rating={4.8}
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
                    role="venue"
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
                            <Text className="text-white font-semibold">Liên hệ đặt lịch</Text>
                        </Pressable>
                    )}

                    {/* Venue Stats */}
                    <View className="flex-row gap-4">
                        <View className="flex-1 p-4 bg-card border border-border rounded-xl items-center gap-1">
                            <Users size={20} color="#7c3aed" />
                            <Text className="text-lg font-bold text-foreground">500+</Text>
                            <Text className="text-xs text-muted-foreground">Sức chứa</Text>
                        </View>
                        <View className="flex-1 p-4 bg-card border border-border rounded-xl items-center gap-1">
                            <Calendar size={20} color="#7c3aed" />
                            <Text className="text-lg font-bold text-foreground">120</Text>
                            <Text className="text-xs text-muted-foreground">Sự kiện</Text>
                        </View>
                        <View className="flex-1 p-4 bg-card border border-border rounded-xl items-center gap-1">
                            <Star size={20} color="#7c3aed" />
                            <Text className="text-lg font-bold text-foreground">4.8</Text>
                            <Text className="text-xs text-muted-foreground">Đánh giá</Text>
                        </View>
                    </View>

                    {/* Social Links */}
                    <SocialList
                        facebook={userData?.facebook_url}
                        instagram={userData?.instagram_url}
                        youtube={userData?.youtube_url}
                    />

                    {/* About */}
                    {userData?.detail_bio && (
                        <View className="gap-3">
                            <Text className="text-base font-bold text-foreground">Giới thiệu</Text>
                            <View className="p-4 bg-card border border-border rounded-xl">
                                <Text className="text-sm text-foreground leading-5">
                                    {userData.detail_bio}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Portfolio Images */}
                    <ProfileImageList
                        title="Không gian"
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
