import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Search, X, Users, Briefcase, ChevronRight } from 'lucide-react-native';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { ExploreUserCard } from '@/features/explore/presentation/components/ExploreUserCard';
import { JobCardFull } from '@/features/jobs/presentation/components/JobCardFull';
import type { UserProfile } from '@/features/explore/domain/entities/search.type';
import type { Job } from '@/features/jobs/domain/entities/job.type';
import {
    useUnifiedUserSearch,
    useUnifiedJobSearch,
} from '@/features/search/presentation/hooks/useUnifiedSearch';

type SearchTab = 'all' | 'jobs' | 'users';

const TABS: { key: SearchTab; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'jobs', label: 'Việc làm' },
    { key: 'users', label: 'Người dùng' },
];

const PREVIEW_COUNT = 5;
const SEARCH_DEBOUNCE_MS = 400;

export default function UnifiedSearchScreen() {
    const params = useLocalSearchParams<{ query?: string }>();
    const router = useRouter();

    const [searchText, setSearchText] = useState(params.query ?? '');
    const [query, setQuery] = useState((params.query ?? '').trim());
    const [activeTab, setActiveTab] = useState<SearchTab>('all');

    // Debounce input -> query (autocomplete khi gõ)
    useEffect(() => {
        const timer = setTimeout(() => setQuery(searchText.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchText]);

    const hasQuery = query.length > 0;

    const userQuery = useUnifiedUserSearch(query, hasQuery);
    const jobQuery = useUnifiedJobSearch(query, hasQuery);

    const users = useMemo(
        () => userQuery.data?.pages.flatMap((page) => page.data?.users ?? []) ?? [],
        [userQuery.data],
    );
    const jobs = useMemo(
        () => jobQuery.data?.pages.flatMap((page) => page.posts ?? []) ?? [],
        [jobQuery.data],
    );

    const usersTotal = userQuery.data?.pages[0]?.data?.total ?? users.length;
    const jobsTotal = jobQuery.data?.pages[0]?.pagination?.total_items ?? jobs.length;

    const handleUserPress = useCallback(
        (user: UserProfile) => {
            router.push({
                pathname:
                    user.role === 'venue'
                        ? '/(profiles)/venueProfile'
                        : '/(profiles)/artistProfile',
                params: { username: user.username },
            });
        },
        [router],
    );

    const handleLoadMoreUsers = useCallback(() => {
        if (userQuery.hasNextPage && !userQuery.isFetchingNextPage) {
            void userQuery.fetchNextPage();
        }
    }, [userQuery]);

    const handleLoadMoreJobs = useCallback(() => {
        if (jobQuery.hasNextPage && !jobQuery.isFetchingNextPage) {
            void jobQuery.fetchNextPage();
        }
    }, [jobQuery]);

    const renderUser = useCallback(
        ({ item }: { item: UserProfile }) => (
            <ExploreUserCard item={item} onPress={handleUserPress} />
        ),
        [handleUserPress],
    );

    const renderJob = useCallback(
        ({ item }: { item: Job }) => (
            <View className="px-1">
                <JobCardFull job={item} />
            </View>
        ),
        [],
    );

    const showLoading = hasQuery && (userQuery.isLoading || jobQuery.isLoading);
    const bothEmpty = hasQuery && !showLoading && users.length === 0 && jobs.length === 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={SCREEN_SAFE_AREA_EDGES}>
            {/* Header + Search */}
            <View className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        accessibilityLabel="Quay lại"
                    >
                        <ArrowLeft size={22} color="#111827" />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-3">
                        <Search size={18} color="#9CA3AF" />
                        <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Tìm việc làm, nghệ sĩ, địa điểm..."
                            placeholderTextColor="#9CA3AF"
                            autoFocus={!params.query}
                            returnKeyType="search"
                            className="flex-1 py-3 px-2 text-base text-gray-900"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')} className="p-1">
                                <X size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white px-4 gap-2 py-2 border-b border-gray-100">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const count =
                        tab.key === 'jobs' ? jobsTotal : tab.key === 'users' ? usersTotal : 0;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full ${
                                isActive ? 'bg-purple-600' : 'bg-gray-100'
                            }`}
                        >
                            <Text
                                className={`text-sm font-semibold ${
                                    isActive ? 'text-white' : 'text-gray-600'
                                }`}
                            >
                                {tab.label}
                                {hasQuery && tab.key !== 'all' && count > 0 ? ` (${count})` : ''}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Body */}
            {!hasQuery ? (
                <EmptyPrompt />
            ) : showLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#7C3AED" size="large" />
                    <Text className="text-gray-500 mt-3">Đang tìm kiếm...</Text>
                </View>
            ) : bothEmpty ? (
                <NoResults query={query} />
            ) : activeTab === 'users' ? (
                <FlatList
                    data={users}
                    renderItem={renderUser}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMoreUsers}
                    onEndReachedThreshold={0.35}
                    ListEmptyComponent={<SectionEmpty label="Không tìm thấy người dùng nào" />}
                    ListFooterComponent={userQuery.isFetchingNextPage ? <FooterSpinner /> : null}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
            ) : activeTab === 'jobs' ? (
                <FlatList
                    data={jobs}
                    renderItem={renderJob}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMoreJobs}
                    onEndReachedThreshold={0.35}
                    ListEmptyComponent={<SectionEmpty label="Không tìm thấy việc làm nào" />}
                    ListFooterComponent={jobQuery.isFetchingNextPage ? <FooterSpinner /> : null}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
            ) : (
                // Tab "Tất cả" — xem trước gộp người dùng + việc làm
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {users.length > 0 && (
                        <View className="mb-2">
                            <SectionHeader
                                icon={<Users size={18} color="#7C3AED" />}
                                title="Người dùng"
                                total={usersTotal}
                                onSeeAll={() => setActiveTab('users')}
                            />
                            <View className="gap-3">
                                {users.slice(0, PREVIEW_COUNT).map((user) => (
                                    <ExploreUserCard
                                        key={user.id}
                                        item={user}
                                        onPress={handleUserPress}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {jobs.length > 0 && (
                        <View className="mt-4">
                            <SectionHeader
                                icon={<Briefcase size={18} color="#7C3AED" />}
                                title="Việc làm"
                                total={jobsTotal}
                                onSeeAll={() => setActiveTab('jobs')}
                            />
                            <View className="gap-3">
                                {jobs.slice(0, PREVIEW_COUNT).map((job) => (
                                    <View key={job.id} className="px-1">
                                        <JobCardFull job={job} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

function SectionHeader({
    icon,
    title,
    total,
    onSeeAll,
}: {
    icon: React.ReactNode;
    title: string;
    total: number;
    onSeeAll: () => void;
}) {
    return (
        <View className="flex-row items-center justify-between mb-3 px-1">
            <View className="flex-row items-center gap-2">
                {icon}
                <Text className="text-base font-bold text-gray-900">{title}</Text>
                <View className="bg-purple-100 px-2 py-0.5 rounded-full">
                    <Text className="text-xs font-semibold text-purple-600">{total}</Text>
                </View>
            </View>
            {total > PREVIEW_COUNT && (
                <TouchableOpacity onPress={onSeeAll} className="flex-row items-center gap-0.5">
                    <Text className="text-sm font-semibold text-purple-600">Xem tất cả</Text>
                    <ChevronRight size={16} color="#7C3BED" />
                </TouchableOpacity>
            )}
        </View>
    );
}

function EmptyPrompt() {
    return (
        <View className="flex-1 items-center justify-center px-8">
            <View className="w-20 h-20 rounded-full bg-purple-50 items-center justify-center mb-4">
                <Search size={32} color="#7C3AED" />
            </View>
            <Text className="text-gray-900 font-bold text-lg text-center">
                Tìm kiếm trên Soundspal
            </Text>
            <Text className="text-gray-500 text-sm mt-1 text-center">
                Nhập từ khoá để tìm việc làm, nghệ sĩ, producer hoặc địa điểm
            </Text>
        </View>
    );
}

function NoResults({ query }: { query: string }) {
    return (
        <View className="flex-1 items-center justify-center px-8">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Search size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg text-center">
                Không tìm thấy kết quả
            </Text>
            <Text className="text-gray-500 text-sm mt-1 text-center">
                Không có kết quả nào cho “{query}”. Thử từ khoá khác nhé.
            </Text>
        </View>
    );
}

function SectionEmpty({ label }: { label: string }) {
    return (
        <View className="items-center justify-center py-16">
            <Text className="text-gray-500 text-sm">{label}</Text>
        </View>
    );
}

function FooterSpinner() {
    return (
        <View className="py-4 items-center">
            <ActivityIndicator color="#7C3AED" />
        </View>
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
        paddingBottom: 100,
        gap: 12,
    },
});
