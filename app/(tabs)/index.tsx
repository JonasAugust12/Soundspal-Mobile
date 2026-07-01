import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
} from 'react-native';
import { Search, ChevronRight, Sparkles, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ArtistCard,
    JobCard,
    ArtistCardSkeleton,
    JobCardSkeleton,
    type ArtistItem,
    type JobItem,
} from '@/components/home';
import { useFeaturedUsers, useFeaturedJobs } from '@/hooks/useSearchApi';
import { TabScreenWrapper } from '@/components/navigation/TabScreenWrapper';

export default function HomeScreen() {
    const router = useRouter();

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
            skills:
                user.genres?.map((g: import('@/types/search.type').Genre) => g.name).join('/') ||
                'Chưa cập nhật',
            image: user.avatar_url
                ? { uri: user.avatar_url }
                : require('@/assets/images/user_profile.png'),
            role: user.role,
        }));
    }, [featuredUsersData]);

    // Transform featured jobs to JobItem format (NEW format for JobCard)
    const jobs: JobItem[] = useMemo(() => {
        if (!featuredJobsData) return [];

        const jobsList = featuredJobsData?.data?.jobs || [];

        if (!Array.isArray(jobsList)) {
            console.warn('Featured jobs array check failed. Data:', featuredJobsData?.data);
            return [];
        }

        return jobsList.map((job: import('@/types/search.type').FeaturedJob) => ({
            id: job.id,
            title: job.title,
            briefDescription: job.brief_description,
            location: job.location,
            workTime: job.work_time,
            budgetMin: job.budget_min,
            budgetMax: job.budget_max,
            budgetCurrency: job.budget_currency,
            genres: job.genres,
            recruitmentType: job.recruitment_type,
            creatorName: job.creator_display_name,
            creatorAvatar: job.creator_avatar_url ? { uri: job.creator_avatar_url } : undefined,
            postType: job.post_type,
        }));
    }, [featuredJobsData]);

    return (
        <TabScreenWrapper>
            {/* Modern Header */}
            <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
                <Image
                    source={require('@/assets/images/Soundspal-TextLogo.png')}
                    className="w-28 h-9"
                    resizeMode="contain"
                />
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center"
                    onPress={() => router.push('/(tabs)/explore')}
                >
                    <Sparkles size={20} color="#7C3BED" />
                </TouchableOpacity>
            </View>

            {/* Premium Search Bar */}
            <View className="px-5 mb-6">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/(tabs)/explore')}
                    style={styles.searchShadow}
                    className="flex-row items-center bg-white rounded-2xl px-4 py-4 border border-gray-100"
                >
                    <View className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 items-center justify-center mr-3">
                        <LinearGradient
                            colors={['#7C3BED', '#EC4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Search size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                            Tìm kiếm nghệ sĩ, địa điểm...
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                            Ca sĩ, Producer, Địa điểm biểu diễn
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Hero Card */}
            <View className="px-5 mb-8">
                <LinearGradient
                    colors={['#7C3BED', '#9333EA', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    {/* Background Pattern */}
                    <View className="absolute top-0 right-0 opacity-20">
                        <View
                            className="w-32 h-32 rounded-full bg-white"
                            style={{ marginTop: -40, marginRight: -40 }}
                        />
                    </View>
                    <View className="absolute bottom-0 left-0 opacity-10">
                        <View
                            className="w-24 h-24 rounded-full bg-white"
                            style={{ marginBottom: -30, marginLeft: -30 }}
                        />
                    </View>

                    <View className="gap-3 z-10">
                        <View className="flex-row items-center gap-2">
                            <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center gap-1.5">
                                <TrendingUp size={14} color="#FFFFFF" />
                                <Text className="text-white text-xs font-bold">Thử thách mới</Text>
                            </View>
                        </View>

                        <Text className="text-2xl font-black text-white leading-tight font-heading">
                            SONIC PULSE{'\n'}CYBERPUNK
                        </Text>

                        <Text className="text-white/80 text-sm max-w-[85%] font-body">
                            Trổ tài thu âm trên beat Cyberpunk, leo rank và tỏa sáng ngay hôm nay!
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push('/(challenge)/explore')}
                            activeOpacity={0.9}
                            className="self-start mt-2"
                        >
                            <View className="bg-white px-6 py-3 rounded-2xl flex-row items-center gap-2 shadow-sm">
                                <Text className="text-[#7d3bed] font-bold font-body text-sm">
                                    Tham gia ngay
                                </Text>
                                <ChevronRight size={18} color="#7C3BED" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Floating Icon */}
                    <View className="absolute" style={{ bottom: 20, right: 20 }}>
                        <Image
                            source={require('@/assets/icons/gemini.png')}
                            className="w-16 h-16 opacity-80"
                            resizeMode="contain"
                        />
                    </View>
                    <View className="absolute" style={{ bottom: 45, right: 0 }}>
                        <Image
                            source={require('@/assets/icons/gemini.png')}
                            className="w-16 h-16 opacity-80"
                            resizeMode="contain"
                        />
                    </View>
                </LinearGradient>
            </View>

            {/* Featured Artists Section */}
            <View className="mb-8">
                <View className="px-5 flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                        <View className="w-1 h-5 bg-purple-500 rounded-full" />
                        <Text className="text-lg font-bold text-gray-900">Nghệ sĩ nổi bật</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/explore')}
                        className="flex-row items-center gap-1"
                    >
                        <Text className="text-sm font-semibold text-purple-600">Tất cả</Text>
                        <ChevronRight size={16} color="#7C3BED" />
                    </TouchableOpacity>
                </View>

                {/* Artists Carousel */}
                {isLoadingUsers ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    >
                        {[1, 2, 3].map((i) => (
                            <ArtistCardSkeleton key={i} width={170} />
                        ))}
                    </ScrollView>
                ) : artists.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    >
                        {artists.map((artist, index) => {
                            const user = featuredUsersData?.data?.users?.users?.[index];

                            return (
                                <ArtistCard
                                    key={artist.id}
                                    item={artist}
                                    width={170}
                                    onPress={() => {
                                        if (!user?.username) return;
                                        if (user.role === 'venue') {
                                            router.push({
                                                pathname: '/(profiles)/venueProfile',
                                                params: { username: user.username },
                                            });
                                        } else {
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
                    <Text className="text-sm text-gray-400 text-center py-8">
                        Chưa có nghệ sĩ nổi bật
                    </Text>
                )}
            </View>

            {/* Featured Jobs Section */}
            <View className="mb-10">
                <View className="px-5 flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                        <View className="w-1 h-5 bg-orange-500 rounded-full" />
                        <Text className="text-lg font-bold text-gray-900">Việc làm hot</Text>
                        <View className="bg-orange-100 px-2 py-0.5 rounded-full ml-1">
                            <Text className="text-[10px] font-bold text-orange-600">Mới</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/jobs')}
                        className="flex-row items-center gap-1"
                    >
                        <Text className="text-sm font-semibold text-purple-600">Tất cả</Text>
                        <ChevronRight size={16} color="#7C3BED" />
                    </TouchableOpacity>
                </View>

                {/* Jobs Carousel */}
                {isLoadingJobs ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    >
                        {[1, 2, 3].map((i) => (
                            <JobCardSkeleton key={i} width={260} />
                        ))}
                    </ScrollView>
                ) : jobs.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    >
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                item={job}
                                width={260}
                                onPress={() => {
                                    router.push({
                                        pathname: '/(jobs)/detail',
                                        params: { id: job.id },
                                    });
                                }}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <Text className="text-sm text-gray-400 text-center py-8">
                        Chưa có việc làm nổi bật
                    </Text>
                )}
            </View>
        </TabScreenWrapper>
    );
}

const styles = StyleSheet.create({
    searchShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        minHeight: 200,
    },
});
