import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, Telescope } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ArtistCard,
    JobCard,
    ArtistCardSkeleton,
    JobCardSkeleton,
    type ArtistItem,
    type JobItem
} from '@/components/home';
import { useFeaturedUsers, useFeaturedJobs } from '@/hooks/useSearchApi';
import { TabScreenWrapper } from '@/components/navigation/TabScreenWrapper';

export default function HomeScreen() {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');

    // Fetch featured data
    const { data: featuredUsersData, isLoading: isLoadingUsers } = useFeaturedUsers(10);
    const { data: featuredJobsData, isLoading: isLoadingJobs } = useFeaturedJobs(10);

    // Transform featured users to ArtistItem format
    const artists: ArtistItem[] = useMemo(() => {
        if (!featuredUsersData) return [];

        // Handle nested response structure: data.users.users
        const users = featuredUsersData?.data?.users?.users || [];

        if (!Array.isArray(users)) {
            console.warn('Featured users array check failed. Data:', featuredUsersData?.data);
            return [];
        }

        return users.map((user: import('@/types/search.type').FeaturedUser) => ({
            id: user.id,
            name: user.display_name,
            description: user.brief_bio || `${user.role} chuyên nghiệp`,
            location:
                user.city && user.country
                    ? `${user.city}, ${user.country}`
                    : user.city || user.country || 'Chưa cập nhật',
            skills: user.genres?.map((g: import('@/types/search.type').Genre) => g.name).join('/') || 'Chưa cập nhật',
            image: user.avatar_url
                ? { uri: user.avatar_url }
                : require('@/assets/images/user_profile.png'),
            role: user.role, // Add role for badge display
        }));
    }, [featuredUsersData]);

    // Transform featured jobs to JobItem format
    const jobs: JobItem[] = useMemo(() => {
        if (!featuredJobsData) return [];

        const jobsList = featuredJobsData?.data?.jobs || [];

        if (!Array.isArray(jobsList)) {
            console.warn('Featured jobs array check failed. Data:', featuredJobsData?.data);
            return [];
        }

        return jobsList.map((job: import('@/types/search.type').FeaturedJob) => {
            // Parse date from published_at or created_at
            const date = new Date(job.published_at || job.created_at).toLocaleDateString('vi-VN');

            return {
                id: job.id,
                title: job.title,
                date: date,
                location: job.location,
                time: job.work_time || 'Linh hoạt',
                creator: job.creator_display_name,
                image: job.creator_avatar_url
                    ? { uri: job.creator_avatar_url }
                    : require('@/assets/images/event_cover.png'),
            };
        });
    }, [featuredJobsData]);

    const handleSearch = () => {
        if (searchText.trim()) {
            router.push({
                pathname: '/(tabs)/explore',
                params: { query: searchText },
            });
        }
    };

    return (
        <TabScreenWrapper>
            {/* Header */}
            <View className="px-4 py-4 flex-row items-center justify-between">
                <Image
                    source={require('@/assets/images/TalentLink-TextLogo.png')}
                    className="w-24 h-8"
                    resizeMode="contain"
                />
            </View>

            {/* Search Bar */}
            <View className="px-4 mb-4">
                <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                    <View className="text-gray-400 dark:text-gray-500">
                        <Search size={20} />
                    </View>
                    <TextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Tìm kiếm nghệ sĩ, địa điểm..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Hero Section */}
            <View className="px-4 py-8 relative overflow-hidden bg-white dark:bg-gray-900">
                {/* Decorative Background Circle */}
                <View
                    className="absolute w-48 h-48 rounded-full bg-purple-600 opacity-5"
                    style={{ top: -50, right: -50, zIndex: 0 }}
                />

                <View className="gap-4 z-10">
                    <View className="gap-2">
                        <Text className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                            Tìm kiếm tài năng{'\n'}
                            <Text className="text-purple-600">âm nhạc</Text>
                        </Text>
                        <Text className="text-base text-gray-600 dark:text-gray-400 max-w-[80%]">
                            Khám phá và kết nối với những nghệ sĩ phù hợp nhất cho dự án của bạn.
                        </Text>
                    </View>

                    {/* Gradient Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/explore')}
                        activeOpacity={0.8}
                        style={{ alignSelf: 'flex-start' }}
                    >
                        <LinearGradient
                            colors={['#7C3BED', '#F471B7']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{
                                borderRadius: 9999,
                                paddingVertical: 14,
                                paddingHorizontal: 28,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <Telescope size={18} color="#FFFFFF" />
                            <Text className="text-white font-bold text-sm">
                                Khám phá ngay
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Floating Gemini Icon */}
                <View className="absolute" style={{ top: 20, right: 20, zIndex: 0 }}>
                    <Image
                        source={require('@/assets/icons/gemini.png')}
                        className="w-20 h-20 rounded-2xl opacity-60"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Featured Artists Section */}
            <View className="px-4 pt-8 gap-4">
                <View className="flex-row justify-between items-end">
                    <View className="gap-1">
                        <Text className="text-xl font-extrabold text-gray-900 dark:text-white">
                            Nghệ sĩ nổi bật
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            Những gương mặt tài năng nhất tuần qua
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/explore')}
                        className="flex-row items-center gap-1 pb-1"
                    >
                        <Text className="text-sm font-semibold text-purple-600">
                            Xem tất cả
                        </Text>
                        <View className="text-purple-600">
                            <ChevronRight size={16} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Artists Carousel */}
                {isLoadingUsers ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="py-2"
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {[1, 2, 3].map((i) => (
                            <ArtistCardSkeleton key={i} width={170} />
                        ))}
                    </ScrollView>
                ) : artists.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="py-2"
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {artists.map((artist, index) => {
                            // Get the original user data for navigation
                            const user = featuredUsersData?.data?.users?.users?.[index];

                            return (
                                <ArtistCard
                                    key={artist.id}
                                    item={artist}
                                    width={170}
                                    onPress={() => {
                                        if (!user?.username) return;
                                        // Navigate based on role
                                        if (user.role === 'venue') {
                                            router.push({
                                                pathname: '/(profiles)/venueProfile',
                                                params: { username: user.username },
                                            });
                                        } else {
                                            // Singer or Producer
                                            router.push({
                                                pathname: '/(profiles)/artistProfile',
                                                params: { username: user.username },
                                            });
                                        }
                                    }}
                                />
                            );
                        })}
                    </ScrollView>
                ) : (
                    <Text className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                        Chưa có nghệ sĩ nổi bật
                    </Text>
                )}
            </View>

            {/* Featured Jobs Section */}
            <View className="px-4 pt-10 gap-4">
                <View className="flex-row justify-between items-end">
                    <View className="gap-1">
                        <Text className="text-xl font-extrabold text-gray-900 dark:text-white">
                            Công việc nổi bật
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            Đừng bỏ lỡ những cơ hội cộng tác hấp dẫn
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/jobs')}
                        className="flex-row items-center gap-1 pb-1"
                    >
                        <Text className="text-sm font-semibold text-purple-600">
                            Xem tất cả
                        </Text>
                        <View className="text-purple-600">
                            <ChevronRight size={16} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Jobs Carousel */}
                {isLoadingJobs ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="py-2"
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {[1, 2, 3].map((i) => (
                            <JobCardSkeleton key={i} width={210} />
                        ))}
                    </ScrollView>
                ) : jobs.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="py-2"
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                item={job}
                                width={210}
                                onPress={() => {
                                    router.push({
                                        pathname: '/(jobs)/detailJob',
                                        params: { id: job.id },
                                    });
                                }}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <Text className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                        Chưa có công việc nổi bật
                    </Text>
                )}
            </View>
        </TabScreenWrapper >
    );
}
