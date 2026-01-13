import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, RefreshControl, Image, TextInput, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Disc2, MicVocal, Building2, Users, MapPin, BadgeCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSearchUsers } from '@/hooks/useSearchApi';
import { useSearchStore, UserRole } from '@/stores/searchStore';
import { FilterSheet } from '@/components/common';
import type { UserProfile } from '@/types/search.type';

const ROLE_TABS: { label: string; value: 'singer' | 'producer' | 'venue' | 'all'; icon: any; color: string }[] = [
    { label: 'Tất cả', value: 'all', icon: Users, color: '#7C3AED' },
    { label: 'Ca sĩ', value: 'singer', icon: MicVocal, color: '#EC4899' },
    { label: 'Producer', value: 'producer', icon: Disc2, color: '#3B82F6' },
    { label: 'Venue', value: 'venue', icon: Building2, color: '#F59E0B' },
];

export default function ExploreScreen() {
    const params = useLocalSearchParams<{ query?: string }>();
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState<'singer' | 'producer' | 'venue' | 'all'>('all');
    const [showFilter, setShowFilter] = useState(false);

    const { filters, setQuery, setRole } = useSearchStore();

    // Set initial search text from params
    useEffect(() => {
        if (params.query) {
            setSearchText(params.query);
            setQuery(params.query);
        }
    }, [params.query, setQuery]);

    // Build search params
    const searchParams = {
        query: filters.query || undefined,
        role: filters.role,
        location: filters.location,
        genres: filters.genres.length > 0 ? filters.genres : undefined,
        businessTypes: filters.businessTypes.length > 0 ? filters.businessTypes : undefined,
        capacity: filters.capacity,
    };

    const { data, isLoading, refetch } = useSearchUsers(searchParams);

    // API now returns ApiResponse<SearchUsersData> so access data.data.users
    const userProfiles = data?.data?.users || [];
    const totalResults = data?.data?.total || 0;

    // Handle search text change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText !== filters.query) {
                setQuery(searchText);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, filters.query, setQuery]);

    // Handle role change
    const handleRoleChange = (role: 'singer' | 'producer' | 'venue' | 'all') => {
        setSelectedRole(role);
        setRole(role === 'all' ? undefined : role);
    };

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleUserPress = (userId: string) => {
        router.push(`/(profiles)/${userId}`);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'singer': return '#EC4899';
            case 'producer': return '#3B82F6';
            case 'venue': return '#F59E0B';
            default: return '#7C3AED';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'singer': return 'Ca sĩ';
            case 'producer': return 'Producer';
            case 'venue': return 'Địa điểm';
            default: return role;
        }
    };

    const renderItem = ({ item }: { item: UserProfile }) => {
        const location = [item.city, item.country].filter(Boolean).join(', ') || 'Chưa cập nhật';
        const roleColor = getRoleColor(item.role);

        return (
            <TouchableOpacity
                onPress={() => handleUserPress(item.id)}
                style={styles.card}
                className="bg-white rounded-2xl overflow-hidden"
                activeOpacity={0.9}
            >
                {/* Cover Image */}
                <View className="h-24 bg-gray-200">
                    {item.cover_url ? (
                        <Image
                            source={{ uri: item.cover_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={[roleColor, `${roleColor}99`]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="w-full h-full"
                        />
                    )}
                </View>

                {/* Avatar */}
                <View className="absolute top-16 left-4">
                    <View style={styles.avatarContainer}>
                        <Image
                            source={
                                item.avatar_url
                                    ? { uri: item.avatar_url }
                                    : require('@/assets/images/user-default.jpg')
                            }
                            className="w-16 h-16 rounded-full"
                        />
                        {item.is_verified && (
                            <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                <BadgeCheck size={16} color="white" fill="#7C3AED" />
                            </View>
                        )}
                    </View>
                </View>

                {/* Content */}
                <View className="pt-10 px-4 pb-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                {item.display_name}
                            </Text>
                            <Text className="text-xs text-gray-500">@{item.username}</Text>
                        </View>
                        <View
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${roleColor}15` }}
                        >
                            <Text className="text-xs font-semibold" style={{ color: roleColor }}>
                                {getRoleLabel(item.role)}
                            </Text>
                        </View>
                    </View>

                    {item.brief_bio && (
                        <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
                            {item.brief_bio}
                        </Text>
                    )}

                    <View className="flex-row items-center gap-1 mt-2">
                        <MapPin size={12} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400">{location}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
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
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-white px-4 pt-2 pb-4">
                <View className="flex-row items-center gap-2 mb-4">
                    <Image
                        source={require('@/assets/images/TalentLink-TextLogo.png')}
                        style={{ width: 120, height: 24 }}
                        resizeMode="contain"
                    />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer} className="flex-row items-center bg-gray-100 rounded-2xl px-4">
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
            <View style={{ height: 70 }} className="bg-white border-b border-gray-100">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center', height: 70 }}
                >
                    <View className="flex-row gap-2">
                        {ROLE_TABS.map((tab) => {
                            const isSelected = selectedRole === tab.value;
                            const IconComponent = tab.icon;
                            return (
                                <TouchableOpacity
                                    key={tab.value}
                                    onPress={() => handleRoleChange(tab.value)}
                                    style={{ minWidth: 80, height: 44 }}
                                    className={`flex-row items-center justify-center gap-2 px-4 rounded-xl ${isSelected ? 'bg-purple-600' : 'bg-gray-100'
                                        }`}
                                >
                                    <IconComponent
                                        size={18}
                                        color={isSelected ? '#FFFFFF' : tab.color}
                                    />
                                    <Text
                                        className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
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
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 100,
                    gap: 12,
                }}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
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
    card: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    avatarContainer: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        borderRadius: 999,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
});
