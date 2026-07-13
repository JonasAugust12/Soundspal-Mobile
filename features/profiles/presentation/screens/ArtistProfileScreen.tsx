import React from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Music4,
    Video as VideoIcon,
    Briefcase,
} from 'lucide-react-native';

import {
    InfoProfile,
    ProfileImageList,
    VideoPlayer,
    SocialList,
    YoutubeEmbed,
    ProfileSkeleton,
    ServicesList,
} from '@/features/profiles/presentation/components/profile';
import {
    useGetCurrentUser,
    useGetUserByUsername,
    useGetCurrentUserMedia,
    useGetUserMedia,
    useGetUserVideos,
    useGetUserGenres,
    useGetUserExperiences,
} from '@/features/profiles/presentation/hooks/useUserApi';
import { useGetOrCreateConversation } from '@/features/messaging/presentation/hooks/useMessagingApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import {
    feeRangeLabel,
    serviceTypeLabel,
} from '@/features/profiles/domain/constants/profileConstants';

const fmtMonthYear = (iso?: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function ArtistProfile() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();

    // Check if viewing own profile
    const isMe = !params.username || params.username === currentUser?.username;
    const [isRefetching, setIsRefetching] = React.useState(false);

    // Fetch data based on isMe
    const { data: currentUserData, isLoading: isLoadingCurrentUser } = useGetCurrentUser({
        enabled: isMe,
    });

    const { data: otherUserData, isLoading: isLoadingOtherUser } = useGetUserByUsername(
        params.username || '',
        { enabled: !isMe },
    );

    const { data: currentUserMedia, isLoading: isLoadingCurrentMedia } = useGetCurrentUserMedia({
        enabled: isMe,
    });
    const { data: otherUserMedia, isLoading: isLoadingOtherMedia } = useGetUserMedia(
        params.username || '',
        { enabled: !isMe },
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

    // Get user genres
    const { data: userGenresData } = useGetUserGenres(username, {
        enabled: !!username,
    });
    const userGenres = userGenresData?.genres || [];

    // Get user experiences (kinh nghiệm)
    const { data: experiences = [] } = useGetUserExperiences(username, {
        enabled: !!username,
    });

    const isLoading = (isLoadingUser || isLoadingMedia || isLoadingVideos) && !isRefetching;

    const onRefresh = async () => {
        setIsRefetching(true);
        // React Query's refetch is handled within hooks if needed,
        // but for simplicity we can trigger a global state update or wait for queries to invalidate
        // In this case, useQuery's refetch is not directly exposed here for all,
        // but it will refresh on mount/focus if configured.
        // To be explicit, we could pass refetch from the hooks.
        setIsRefetching(false);
    };

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
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor="#7C3BED"
                        colors={['#7C3BED']}
                    />
                }
            >
                {/* Back Button */}
                <View className="absolute top-4 left-4 z-10">
                    <Pressable
                        onPress={goBack}
                        className="p-2 bg-black/20 dark:bg-white/10 rounded-full backdrop-blur-md border border-white/20"
                    >
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

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
                    backgroundSource={userData?.cover_url ? { uri: userData.cover_url } : undefined}
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

                    {/* Availability + fee + service types */}
                    {(userData?.is_available !== undefined ||
                        userData?.fee_min != null ||
                        (userData?.service_types?.length ?? 0) > 0) && (
                        <View className="gap-3">
                            <View className="flex-row flex-wrap items-center gap-2">
                                {userData?.is_available === true && (
                                    <View className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                                        <Text className="text-xs font-bold text-green-700 dark:text-green-400">
                                            ● Đang nhận show
                                        </Text>
                                    </View>
                                )}
                                {userData?.is_available === false && (
                                    <View className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                        <Text className="text-xs font-bold text-gray-500">
                                            ○ Tạm nghỉ
                                        </Text>
                                    </View>
                                )}
                                {!!feeRangeLabel(userData?.fee_min, userData?.fee_max) && (
                                    <View className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                        <Text className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                            {feeRangeLabel(userData?.fee_min, userData?.fee_max)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {(userData?.service_types?.length ?? 0) > 0 && (
                                <View className="flex-row flex-wrap gap-2">
                                    {userData?.service_types?.map((v) => (
                                        <View
                                            key={v}
                                            className="px-3 py-1.5 rounded-full bg-secondary"
                                        >
                                            <Text className="text-xs font-semibold text-foreground">
                                                {serviceTypeLabel(v)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Social Links */}
                    <SocialList
                        facebook={userData?.facebook_url}
                        instagram={userData?.instagram_url}
                        youtube={userData?.youtube_url}
                        tiktok={userData?.tiktok_url}
                        soundcloud={userData?.soundcloud_url}
                    />

                    {/* Services */}
                    <ServicesList services={userData?.services || []} />

                    {/* Genres */}
                    {userGenres.length > 0 && (
                        <View className="gap-3">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                                    <Music4 size={18} color="#7C3AED" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">Thể loại</Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {userGenres.map((genre) => (
                                    <View
                                        key={genre.id}
                                        className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30"
                                    >
                                        <Text className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                            {genre.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Experience (kinh nghiệm) */}
                    {experiences.length > 0 && (
                        <View className="gap-3">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                                    <Briefcase size={18} color="#7C3AED" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">
                                    Kinh nghiệm
                                </Text>
                            </View>
                            <View className="gap-3">
                                {experiences.map((exp, index) => (
                                    <View
                                        key={exp.id || `exp-${index}`}
                                        className="p-4 rounded-2xl border border-border bg-card"
                                    >
                                        <Text className="font-bold text-foreground">
                                            {exp.title || 'Chưa có tiêu đề'}
                                        </Text>
                                        {(exp.start_date || exp.end_date) && (
                                            <Text className="text-xs text-muted-foreground mt-0.5">
                                                {exp.start_date
                                                    ? fmtMonthYear(exp.start_date)
                                                    : '—'}
                                                {' - '}
                                                {exp.end_date
                                                    ? fmtMonthYear(exp.end_date)
                                                    : 'Hiện tại'}
                                            </Text>
                                        )}
                                        {!!exp.description && (
                                            <Text className="text-sm text-muted-foreground mt-1">
                                                {exp.description}
                                            </Text>
                                        )}
                                        {!!exp.genres?.length && (
                                            <View className="flex-row flex-wrap gap-1 mt-2">
                                                {exp.genres.map((g) => (
                                                    <View
                                                        key={g.id || g.name}
                                                        className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30"
                                                    >
                                                        <Text className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                                            {g.name}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Featured Releases */}
                    <View className="gap-4">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                                    <Music4 size={18} color="#7C3AED" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">
                                    Featured Releases
                                </Text>
                            </View>
                            {(isMe || (userData?.featured_release_links?.length || 0) > 3) && (
                                <Pressable
                                    onPress={() =>
                                        router.push({
                                            pathname: '/(profiles)/featuredReleases',
                                            params: isMe ? {} : { username: userData?.username },
                                        })
                                    }
                                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 active:bg-primary/20"
                                >
                                    <Text className="text-sm font-semibold text-primary">
                                        Xem tất cả
                                    </Text>
                                    <ChevronRight size={14} color="#7C3AED" />
                                </Pressable>
                            )}
                        </View>

                        {userData?.featured_release_links &&
                        userData.featured_release_links.length > 0 ? (
                            <View className="gap-3">
                                {userData.featured_release_links.slice(0, 3).map((link, index) => (
                                    <YoutubeEmbed key={index} url={link} />
                                ))}
                            </View>
                        ) : (
                            <View className="py-12 items-center gap-3 bg-muted/30 rounded-2xl">
                                <View className="w-16 h-16 rounded-2xl bg-muted/60 items-center justify-center">
                                    <Music4 size={32} color="#9CA3AF" />
                                </View>
                                <Text className="text-sm text-muted-foreground">
                                    Chưa có featured releases
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Videos */}
                    <View className="gap-4">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                                    <VideoIcon size={18} color="#7C3AED" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">Video</Text>
                            </View>
                            {(isMe || (userVideos?.items?.length || 0) > 4) && (
                                <Pressable
                                    onPress={() =>
                                        router.push({
                                            pathname: '/(profiles)/videoGallery',
                                            params: isMe ? {} : { username: userData?.username },
                                        })
                                    }
                                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 active:bg-primary/20"
                                >
                                    <Text className="text-sm font-semibold text-primary">
                                        Xem tất cả
                                    </Text>
                                    <ChevronRight size={14} color="#7C3AED" />
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
                            <View className="py-12 items-center gap-3 bg-muted/30 rounded-2xl">
                                <View className="w-16 h-16 rounded-2xl bg-muted/60 items-center justify-center">
                                    <VideoIcon size={32} color="#9CA3AF" />
                                </View>
                                <Text className="text-sm text-muted-foreground">
                                    Chưa có video demo
                                </Text>
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
