import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ScrollView,
    RefreshControl,
    Image,
    TextInput,
    StyleSheet,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Disc2, MicVocal, Building2, Users } from 'lucide-react-native';
import { useSearchUsersInfinite } from '@/features/explore/presentation/hooks/useSearchApi';
import { useSearchStore, UserRole } from '@/features/explore/presentation/store/searchStore';
import { FilterSheet } from '@/shared/presentation/ui';
import { ExploreUserCard } from '@/features/explore/presentation/components/ExploreUserCard';
import type { UserProfile } from '@/features/explore/domain/entities/search.type';

const SEARCH_PAGE_SIZE = 20;

const ROLE_TABS: {
    label: string;
    value: 'singer' | 'producer' | 'venue' | 'all';
    icon: React.ElementType;
}[] = [
    { label: 'Tất cả', value: 'all', icon: Users },
    { label: 'Ca sĩ', value: 'singer', icon: MicVocal },
    { label: 'Producer', value: 'producer', icon: Disc2 },
    { label: 'Venue', value: 'venue', icon: Building2 },
];

/** Gradient chủ đạo cho tab đang chọn. */
const ROLE_TAB_ACTIVE_GRADIENT: readonly [string, string] = ['#7C3BED', '#A855F7'];

export default function ExploreScreen() {
    const params = useLocalSearchParams<{ query?: string }>();
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState<'singer' | 'producer' | 'venue' | 'all'>(
        'all',
    );
    const [showFilter, setShowFilter] = useState(false);

    const { filters, setQuery, setRole } = useSearchStore();

    useEffect(() => {
        if (params.query) {
            setSearchText(params.query);
            setQuery(params.query);
        }
    }, [params.query, setQuery]);

    // Build search params (page handled by infinite query)
    const searchParams = useMemo(
        () => ({
            query: filters.query || undefined,
            role: filters.role,
            location: filters.location,
            genres: filters.genres.length > 0 ? filters.genres : undefined,
            businessTypes: filters.businessTypes.length > 0 ? filters.businessTypes : undefined,
            serviceTypes: filters.serviceTypes.length > 0 ? filters.serviceTypes : undefined,
            capacity: filters.capacity,
            feeMin: filters.feeMin,
            feeMax: filters.feeMax,
            isAvailable: filters.isAvailable,
            stateProvince: filters.stateProvince,
            venueType: filters.venueType,
            pageSize: SEARCH_PAGE_SIZE,
        }),
        [
            filters.query,
            filters.role,
            filters.location,
            filters.genres,
            filters.businessTypes,
            filters.serviceTypes,
            filters.capacity,
            filters.feeMin,
            filters.feeMax,
            filters.isAvailable,
            filters.stateProvince,
            filters.venueType,
        ],
    );

    const {
        data,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useSearchUsersInfinite(searchParams);

    const userProfiles = useMemo(
        () => data?.pages.flatMap((page) => page.data?.users ?? []) ?? [],
        [data],
    );
    const totalResults = data?.pages[0]?.data?.total ?? 0;

    // Handle search text change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText !== filters.query) {
                setQuery(searchText);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, filters.query, setQuery]);

    const handleRoleChange = (role: 'singer' | 'producer' | 'venue' | 'all') => {
        setSelectedRole(role);
        setRole(role === 'all' ? undefined : role);
    };

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleUserPress = useCallback(
        (user: UserProfile) => {
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
        },
        [router],
    );

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const keyExtractor = useCallback((item: UserProfile) => item.id, []);

    const renderItem = useCallback(
        ({ item }: { item: UserProfile }) => (
            <ExploreUserCard item={item} onPress={handleUserPress} />
        ),
        [handleUserPress],
    );

    const renderListFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View className="py-4 items-center">
                <ActivityIndicator color="#7C3AED" />
            </View>
        );
    }, [isFetchingNextPage]);

    const renderEmpty = useCallback(() => {
        if (isLoading) {
            return (
                <View className="flex-1 items-center justify-center py-20">
                    <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-4">
                        <Search size={28} color="#7C3AED" />
                    </View>
                    <Text className="text-gray-600 font-medium">Đang tìm kiếm...</Text>
                </View>
            );
        }

        return (
            <View className="flex-1 items-center justify-center py-20">
                <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                    <Users size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 font-bold text-lg">Không tìm thấy kết quả</Text>
                <Text className="text-gray-500 text-sm mt-1 text-center px-8">
                    Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
                </Text>
            </View>
        );
    }, [isLoading]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={SCREEN_SAFE_AREA_EDGES}>
            {/* Header */}
            <View className="bg-white px-4 pt-2 pb-4">
                <View className="flex-row items-center gap-2 mb-4">
                    <Image
                        source={require('@/assets/images/Soundspal-TextLogo.png')}
                        style={{ width: 120, height: 24 }}
                        resizeMode="contain"
                    />
                </View>

                {/* Search Bar */}
                <View
                    style={styles.searchContainer}
                    className="flex-row items-center bg-gray-100 rounded-2xl px-4"
                >
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Tìm kiếm nghệ sĩ, producer, địa điểm..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 py-3 px-3 text-base text-gray-900"
                    />
                    <TouchableOpacity
                        className="w-10 h-10 rounded-xl bg-purple-600 items-center justify-center"
                        onPress={() => setShowFilter(true)}
                    >
                        <SlidersHorizontal size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Role Tabs */}
            <View style={{ height: 66 }} className="bg-white border-b border-gray-100">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsRow}
                >
                    {ROLE_TABS.map((tab) => {
                        const isSelected = selectedRole === tab.value;
                        const IconComponent = tab.icon;
                        return (
                            <TouchableOpacity
                                key={tab.value}
                                onPress={() => handleRoleChange(tab.value)}
                                activeOpacity={0.85}
                            >
                                {isSelected ? (
                                    <LinearGradient
                                        colors={ROLE_TAB_ACTIVE_GRADIENT}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[styles.tab, styles.tabActive]}
                                    >
                                        <IconComponent
                                            size={18}
                                            color="#FFFFFF"
                                            strokeWidth={2.4}
                                        />
                                        <Text
                                            className="text-sm font-bold text-white"
                                            numberOfLines={1}
                                        >
                                            {tab.label}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.tab} className="bg-gray-100">
                                        <IconComponent
                                            size={18}
                                            color="#6B7280"
                                            strokeWidth={2.2}
                                        />
                                        <Text
                                            className="text-sm font-semibold text-gray-600"
                                            numberOfLines={1}
                                        >
                                            {tab.label}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Results Header */}
            <View className="flex-row justify-between items-center px-4 py-3">
                <Text className="text-gray-900 text-base font-bold">
                    {filters.query ? 'Kết quả tìm kiếm' : 'Khám phá'}
                </Text>
                {totalResults > 0 && (
                    <View className="bg-purple-100 px-3 py-1 rounded-full">
                        <Text className="text-purple-600 text-xs font-semibold">
                            {totalResults} kết quả
                        </Text>
                    </View>
                )}
            </View>

            {/* Results List */}
            <FlatList
                data={userProfiles}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 100,
                    gap: 12,
                    flexGrow: userProfiles.length === 0 ? 1 : undefined,
                }}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderListFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.35}
                initialNumToRender={8}
                maxToRenderPerBatch={6}
                windowSize={7}
                removeClippedSubviews={Platform.OS === 'android'}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isFetchingNextPage}
                        onRefresh={handleRefresh}
                        colors={['#7C3AED']}
                        tintColor="#7C3AED"
                    />
                }
                showsVerticalScrollIndicator={false}
            />
            <FilterSheet
                visible={showFilter}
                onClose={() => setShowFilter(false)}
                currentRole={selectedRole === 'all' ? undefined : (selectedRole as UserRole)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    tabsRow: {
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 10,
        height: 66,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        height: 42,
        borderRadius: 14,
    },
    tabActive: {
        shadowColor: '#7C3BED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
});
