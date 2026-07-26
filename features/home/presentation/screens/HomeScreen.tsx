import React, { useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Search, ChevronRight, BookOpen, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArtistCard, JobCard } from '@/features/home/presentation/components';
import { BlogPreviewCard } from '@/features/blog/presentation/components';
import { TabScreenWrapper } from '@/shared/presentation/navigation/TabScreenWrapper';
import { raisedShadow } from '@/shared/presentation/ui/shadows';
import {
    HOME_HEADER as header,
    HOME_SEARCH as search,
    HOME_HERO as hero,
    HOME_SECTIONS as sections,
} from '@/features/home/domain/constants/homeContent';
import {
    mapFeaturedUsersToArtistItems,
    mapFeaturedJobsToJobItems,
} from '@/features/home/domain/utils/mapFeaturedToHomeItems';
import {
    useFeaturedUsers,
    useFeaturedJobs,
} from '@/features/explore/presentation/hooks/useSearchApi';
import { useBlogFeed } from '@/features/blog/presentation/hooks/useBlogApi';
import { useGetBeats } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { getHeroBeat } from '@/features/challenge/domain/utils/challenge';

const CAROUSEL_CONTENT_STYLE = {
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 4,
    paddingBottom: 10,
} as const;

/**
 * Cấu hình chung cho carousel ngang. Dùng FlatList (thay ScrollView) để chỉ giữ các
 * thẻ đang hiển thị — giảm số ảnh/shimmer mount cùng lúc, nhờ đó cuộn mượt hơn, không
 * bị khựng (khựng khiến cảm giác "kéo nhiều mà trượt ít"). decelerationRate normal cho
 * quán tính lướt xa: vuốt nhẹ vẫn trôi được nhiều thẻ.
 */
const CAROUSEL_LIST_PROPS = {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: CAROUSEL_CONTENT_STYLE,
    removeClippedSubviews: true,
    initialNumToRender: 3,
    maxToRenderPerBatch: 3,
    windowSize: 5,
    decelerationRate: 'normal',
    scrollEventThrottle: 16,
} as const;

// Mỗi mục ở trang chủ chỉ hiển thị tối đa 5 thẻ.
const FEATURED_LIMIT = 5;
const BLOG_PREVIEW_LIMIT = 5;

/** Mỗi mục hiển thị spinner khi đang tải, rồi mới tới rỗng — tránh nháy "Chưa có..." lúc đầu. */
function SectionPlaceholder({
    isLoading,
    emptyMessage,
}: {
    isLoading: boolean;
    emptyMessage: string;
}) {
    return (
        <View className="py-8 items-center">
            {isLoading ? (
                <ActivityIndicator color="#7C3BED" />
            ) : (
                <Text className="text-sm text-gray-400 text-center">{emptyMessage}</Text>
            )}
        </View>
    );
}

export default function HomeScreen() {
    const router = useRouter();

    const { data: featuredUsersData, isLoading: isLoadingArtists } =
        useFeaturedUsers(FEATURED_LIMIT);
    const { data: featuredJobsData, isLoading: isLoadingJobs } = useFeaturedJobs(FEATURED_LIMIT);
    const { data: blogFeed, isLoading: isLoadingBlog } = useBlogFeed();
    const { data: beatsData } = useGetBeats({ page_size: 20 });

    const artists = useMemo(
        () => mapFeaturedUsersToArtistItems(featuredUsersData),
        [featuredUsersData],
    );
    const jobs = useMemo(() => mapFeaturedJobsToJobItems(featuredJobsData), [featuredJobsData]);
    const blogPosts = blogFeed ?? [];

    // Thử thách nổi bật = beat có nhiều bài dự thi nhất (GET /beats). Dùng tên thật của
    // thử thách cho hero thay cho tiêu đề cứng "SONIC PULSE / CYBERPUNK".
    const heroBeat = useMemo(() => getHeroBeat(beatsData?.beats ?? []), [beatsData]);
    const heroTitle = heroBeat
        ? heroBeat.title.toUpperCase()
        : `${hero.titleLine1}\n${hero.titleLine2}`;

    return (
        <TabScreenWrapper>
            <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
                <Image
                    source={require('@/assets/images/Soundspal-TextLogo.png')}
                    className="w-28 h-9"
                    resizeMode="contain"
                />
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center"
                    onPress={() => router.push(header.blogRoute)}
                    accessibilityLabel={header.blogButtonAccessibilityLabel}
                >
                    <BookOpen size={20} color="#7C3BED" />
                </TouchableOpacity>
            </View>

            <View className="px-5 mb-6">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/(search)')}
                    style={styles.searchShadow}
                    className="flex-row items-center bg-white rounded-2xl px-4 py-4 border border-gray-100"
                >
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <LinearGradient
                            colors={[...search.gradientColors]}
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
                            {search.title}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">{search.subtitle}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View className="px-5 mb-8">
                <LinearGradient
                    colors={[...hero.gradientColors]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
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
                                <Text className="text-white text-xs font-bold">
                                    {hero.badgeLabel}
                                </Text>
                            </View>
                        </View>

                        <Text
                            className="text-2xl font-black text-white leading-tight font-heading"
                            numberOfLines={2}
                        >
                            {heroTitle}
                        </Text>

                        <Text className="text-white/80 text-sm max-w-[85%] font-body">
                            {hero.description}
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push(hero.ctaRoute)}
                            activeOpacity={0.9}
                            className="self-start mt-2"
                        >
                            <View className="bg-white px-6 py-3 rounded-2xl flex-row items-center gap-2 shadow-sm">
                                <Text className="text-[#7d3bed] font-bold font-body text-sm">
                                    {hero.ctaLabel}
                                </Text>
                                <ChevronRight size={18} color="#7C3BED" />
                            </View>
                        </TouchableOpacity>
                    </View>

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

            <View className="mb-8">
                <View className="px-5 flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                        <View
                            className="w-1 h-5 rounded-full"
                            style={{ backgroundColor: sections.artists.accentColor }}
                        />
                        <Text className="text-lg font-bold text-gray-900">
                            {sections.artists.title}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(sections.artists.seeAllRoute as '/(tabs)/explore')
                        }
                        className="flex-row items-center gap-1"
                    >
                        <Text className="text-sm font-semibold text-purple-600">
                            {sections.artists.seeAllLabel}
                        </Text>
                        <ChevronRight size={16} color="#7C3BED" />
                    </TouchableOpacity>
                </View>

                {artists.length > 0 ? (
                    <FlatList
                        {...CAROUSEL_LIST_PROPS}
                        data={artists.slice(0, FEATURED_LIMIT)}
                        keyExtractor={(artist) => artist.id}
                        renderItem={({ item: artist }) => (
                            <ArtistCard
                                item={artist}
                                width={170}
                                onPress={() => {
                                    if (!artist.username) return;
                                    router.push({
                                        pathname:
                                            artist.role === 'venue'
                                                ? '/(profiles)/venueProfile'
                                                : '/(profiles)/artistProfile',
                                        params: { username: artist.username },
                                    });
                                }}
                            />
                        )}
                    />
                ) : (
                    <SectionPlaceholder
                        isLoading={isLoadingArtists}
                        emptyMessage={sections.artists.emptyMessage}
                    />
                )}
            </View>

            <View className="mb-8">
                <View className="px-5 flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                        <View
                            className="w-1 h-5 rounded-full"
                            style={{ backgroundColor: sections.jobs.accentColor }}
                        />
                        <Text className="text-lg font-bold text-gray-900">
                            {sections.jobs.title}
                        </Text>
                        {sections.jobs.badgeLabel ? (
                            <View className="bg-orange-100 px-2 py-0.5 rounded-full ml-1">
                                <Text className="text-[10px] font-bold text-orange-600">
                                    {sections.jobs.badgeLabel}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push(sections.jobs.seeAllRoute as '/(tabs)/jobs')}
                        className="flex-row items-center gap-1"
                    >
                        <Text className="text-sm font-semibold text-purple-600">
                            {sections.jobs.seeAllLabel}
                        </Text>
                        <ChevronRight size={16} color="#7C3BED" />
                    </TouchableOpacity>
                </View>

                {jobs.length > 0 ? (
                    <FlatList
                        {...CAROUSEL_LIST_PROPS}
                        data={jobs.slice(0, FEATURED_LIMIT)}
                        keyExtractor={(job) => job.id}
                        renderItem={({ item: job }) => (
                            <JobCard
                                item={job}
                                width={260}
                                onPress={() => {
                                    router.push({
                                        pathname: '/(jobs)/detail',
                                        params: { id: job.id },
                                    });
                                }}
                            />
                        )}
                    />
                ) : (
                    <SectionPlaceholder
                        isLoading={isLoadingJobs}
                        emptyMessage={sections.jobs.emptyMessage}
                    />
                )}
            </View>

            <View className="mb-10">
                <View className="px-5 flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                        <View
                            className="w-1 h-5 rounded-full"
                            style={{ backgroundColor: sections.blog.accentColor }}
                        />
                        <Text className="text-lg font-bold text-gray-900">
                            {sections.blog.title}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push(sections.blog.seeAllRoute as '/(blog)')}
                        className="flex-row items-center gap-1"
                    >
                        <Text className="text-sm font-semibold text-purple-600">
                            {sections.blog.seeAllLabel}
                        </Text>
                        <ChevronRight size={16} color="#7C3BED" />
                    </TouchableOpacity>
                </View>

                {blogPosts.length > 0 ? (
                    <FlatList
                        {...CAROUSEL_LIST_PROPS}
                        data={blogPosts.slice(0, BLOG_PREVIEW_LIMIT)}
                        keyExtractor={(post) => post.id}
                        renderItem={({ item: post }) => <BlogPreviewCard article={post} />}
                    />
                ) : (
                    <SectionPlaceholder
                        isLoading={isLoadingBlog}
                        emptyMessage={sections.blog.emptyMessage}
                    />
                )}
            </View>
        </TabScreenWrapper>
    );
}

const styles = StyleSheet.create({
    searchShadow: raisedShadow,
    heroCard: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        minHeight: 200,
    },
});
