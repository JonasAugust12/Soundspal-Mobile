import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    MessageCircle,
    MapPin,
    Users,
    Clock,
    Building2,
    Globe,
    Phone,
    Banknote,
    Check,
    Music4,
} from 'lucide-react-native';

import {
    InfoProfile,
    ProfileImageList,
    SocialList,
    ProfileSkeleton,
    VenueOpenJobs,
} from '@/features/profiles/presentation/components/profile';
import {
    useGetCurrentUser,
    useGetUserByUsername,
    useGetCurrentUserMedia,
    useGetUserMedia,
    useGetAllGenres,
} from '@/features/profiles/presentation/hooks/useUserApi';
import { useGetOrCreateConversation } from '@/features/messaging/presentation/hooks/useMessagingApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { VenueUser } from '@/features/profiles/domain/entities/user.type';

export default function VenueProfile() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();

    const isMe = !params.username || params.username === currentUser?.username;

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

    const userData = isMe ? currentUserData : otherUserData;
    const userMedia = isMe ? currentUserMedia : otherUserMedia;
    const isLoadingUser = isMe ? isLoadingCurrentUser : isLoadingOtherUser;
    const isLoadingMedia = isMe ? isLoadingCurrentMedia : isLoadingOtherMedia;
    const isLoading = isLoadingUser || isLoadingMedia;

    const { data: allGenresData } = useGetAllGenres();

    const venueData = userData as unknown as VenueUser;
    const businessTypes = venueData?.business_types || [];
    const facilities = venueData?.convenient_facilities || [];
    const portfolioImages = userMedia?.media?.filter((m) => m.media_type === 'portfolio') || [];

    // Yêu cầu nghệ sĩ
    const allGenres = allGenresData?.genres || [];
    const preferredGenreNames = (venueData?.preferred_genre_ids || [])
        .map((id) => allGenres.find((g) => g.id === id)?.name)
        .filter((n): n is string => !!n);
    const requirementsNote = venueData?.artist_requirements_note;

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
                    name={userData?.display_name || 'Địa điểm'}
                    location={userData?.city || userData?.country || 'Chưa cập nhật'}
                    rating={4.8}
                    bio={userData?.brief_bio || 'Chưa có thông tin giới thiệu'}
                    avatarSource={
                        userData?.avatar_url
                            ? { uri: userData.avatar_url }
                            : require('@/assets/images/user_profile.png')
                    }
                    backgroundSource={userData?.cover_url ? { uri: userData.cover_url } : undefined}
                    role="venue"
                />

                <View className="px-4 gap-6 pt-4 pb-8">
                    {/* Message Button - Only for other users */}
                    {!isMe && userData?.id && (
                        <Pressable
                            onPress={handleSendMessage}
                            disabled={getOrCreateConversation.isPending}
                            className="flex-row items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 active:opacity-80"
                        >
                            <MessageCircle size={20} color="#ffffff" />
                            <Text className="text-white font-semibold">Liên hệ đặt lịch</Text>
                        </Pressable>
                    )}

                    {/* Đang tuyển nghệ sĩ */}
                    {userData?.is_available === true && (
                        <View className="self-start px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                            <Text className="text-xs font-bold text-green-700 dark:text-green-400">
                                ● Đang tuyển nghệ sĩ
                            </Text>
                        </View>
                    )}

                    {/* Business Types */}
                    {businessTypes.length > 0 && (
                        <View className="flex-row flex-wrap gap-2">
                            {businessTypes.map((type: string, index: number) => (
                                <View
                                    key={index}
                                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                                >
                                    <Text className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                        {type}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Đang tuyển (open jobs) */}
                    <VenueOpenJobs isMe={isMe} username={userData?.username} />

                    {/* Venue Stats */}
                    <View className="flex-row gap-3">
                        {venueData?.capacity && (
                            <View className="flex-1 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl items-center gap-2">
                                <View className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                                    <Users size={20} color="#3B82F6" />
                                </View>
                                <Text className="text-sm font-bold text-foreground text-center">
                                    {venueData.capacity}
                                </Text>
                                <Text className="text-xs text-muted-foreground">Sức chứa</Text>
                            </View>
                        )}
                        {venueData?.open_hour && (
                            <View className="flex-1 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl items-center gap-2">
                                <View className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 items-center justify-center">
                                    <Clock size={20} color="#22C55E" />
                                </View>
                                <Text className="text-sm font-bold text-foreground text-center">
                                    {venueData.open_hour}
                                </Text>
                                <Text className="text-xs text-muted-foreground">Giờ mở cửa</Text>
                            </View>
                        )}
                    </View>

                    {/* Rent Price */}
                    {venueData?.rent_price && (
                        <View className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex-row items-center gap-4">
                            <View className="w-12 h-12 rounded-xl bg-blue-600 items-center justify-center">
                                <Banknote size={24} color="#FFFFFF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Giá thuê tham khảo
                                </Text>
                                <Text className="text-base font-bold text-blue-600 dark:text-blue-400">
                                    {venueData.rent_price}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Contact Info */}
                    <View className="gap-3">
                        {venueData?.detailed_address && (
                            <View className="flex-row items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <MapPin size={18} color="#6B7280" />
                                <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                    {venueData.detailed_address}
                                </Text>
                            </View>
                        )}
                        {userData?.phone_number && (
                            <Pressable
                                onPress={() => Linking.openURL(`tel:${userData.phone_number}`)}
                                className="flex-row items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <Phone size={18} color="#6B7280" />
                                <Text className="text-sm text-gray-700 dark:text-gray-300">
                                    {userData.phone_number}
                                </Text>
                            </Pressable>
                        )}
                        {venueData?.website_url && (
                            <Pressable
                                onPress={() =>
                                    venueData.website_url && Linking.openURL(venueData.website_url)
                                }
                                className="flex-row items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <Globe size={18} color="#6B7280" />
                                <Text className="text-sm text-blue-600 dark:text-blue-400">
                                    {venueData.website_url}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Facilities */}
                    {facilities.length > 0 && (
                        <View className="gap-3">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 items-center justify-center">
                                    <Check size={18} color="#22C55E" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">Tiện ích</Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {facilities.map((facility: string, index: number) => (
                                    <View
                                        key={index}
                                        className="flex-row items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-full"
                                    >
                                        <Check size={12} color="#22C55E" />
                                        <Text className="text-sm font-medium text-green-700 dark:text-green-400">
                                            {facility}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Yêu cầu nghệ sĩ */}
                    {(preferredGenreNames.length > 0 || !!requirementsNote) && (
                        <View className="gap-3">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                                    <Music4 size={18} color="#7C3AED" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">
                                    Yêu cầu nghệ sĩ
                                </Text>
                            </View>
                            {preferredGenreNames.length > 0 && (
                                <View className="flex-row flex-wrap gap-2">
                                    {preferredGenreNames.map((n) => (
                                        <View
                                            key={n}
                                            className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30"
                                        >
                                            <Text className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                                {n}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {!!requirementsNote && (
                                <View className="p-4 bg-card border border-border rounded-xl">
                                    <Text className="text-sm text-foreground leading-5">
                                        {requirementsNote}
                                    </Text>
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

                    {/* About */}
                    {userData?.detail_bio && (
                        <View className="gap-4">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                                    <Building2 size={18} color="#7C3AED" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">
                                    Giới thiệu
                                </Text>
                            </View>
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
