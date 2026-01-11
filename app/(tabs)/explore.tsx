import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { SearchBar } from '@/components/common/SearchBar';
import { ArtistCardSearch } from '@/components/common/ArtistCardSearch';
import { useSearchUsers } from '@/hooks/useSearchApi';
import { useSearchStore } from '@/stores/searchStore';
import type { UserProfile } from '@/types/search.type';

const ROLE_TABS: { label: string; value: 'singer' | 'producer' | 'venue' | 'all' }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Ca sĩ', value: 'singer' },
    { label: 'Nhà sản xuất', value: 'producer' },
    { label: 'Địa điểm', value: 'venue' },
];

export default function ExploreScreen() {
    const params = useLocalSearchParams<{ query?: string }>();
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState<'singer' | 'producer' | 'venue' | 'all'>(
        'all'
    );

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

    const userProfiles = data || [];

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

    const renderItem = ({ item }: { item: UserProfile }) => {
        // Create location string from city and country
        const location = [item.city, item.country].filter(Boolean).join(', ') || 'N/A';

        return (
            <ArtistCardSearch
                key={item.id}
                item={{
                    id: item.id,
                    name: item.display_name,
                    des: item.brief_bio || '',
                    location: location,
                    role: item.role.toLowerCase() as any,
                    username: item.username,
                    image: item.avatar_url
                        ? { uri: item.avatar_url }
                        : require('@/assets/images/profile_search.png'),
                }}
                width={260}
            />
        );
    };

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View className="flex-1 items-center justify-center py-8">
                    <Text className="text-muted-foreground">Đang tải...</Text>
                </View>
            );
        }

        return (
            <View className="flex-1 items-center justify-center py-8">
                <Text className="text-muted-foreground text-base">Không tìm thấy kết quả</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
            <View className="flex-1 pb-8">
                {/* Logo Header */}
                <View className="flex-row items-center p-4 gap-2">
                    <Image
                        source={require('@/assets/images/TalentLink-TextLogo.png')}
                        className="w-30 h-6"
                        resizeMode="contain"
                    />
                </View>

                {/* Search bar */}
                <SearchBar
                    onFilterPress={() => {
                        // TODO: Open filter sheet
                        console.log('Filter pressed');
                    }}
                    value={searchText}
                    onChangeText={setSearchText}
                />

                {/* Role Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-grow-0"
                >
                    <View className="flex-row px-4 pt-4 gap-2">
                        {ROLE_TABS.map((tab) => {
                            const isSelected = selectedRole === tab.value;
                            return (
                                <Pressable
                                    key={tab.value}
                                    onPress={() => handleRoleChange(tab.value)}
                                    className={`px-4 py-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-secondary'
                                        }`}
                                >
                                    <Text
                                        className={`text-sm ${isSelected
                                            ? 'text-primary-foreground'
                                            : 'text-foreground'
                                            }`}
                                    >
                                        {tab.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Featured Artists / Search Results */}
                <View className="flex-1 px-4 pt-4">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-foreground text-base font-bold">
                            {filters.query ? 'Kết quả tìm kiếm' : 'Nghệ sĩ nổi bật'}
                        </Text>
                        {userProfiles.length > 0 && (
                            <Text className="text-muted-foreground text-xs">
                                {userProfiles.length} kết quả
                            </Text>
                        )}
                    </View>

                    <FlatList
                        data={userProfiles}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{
                            paddingVertical: 8,
                            alignItems: 'center',
                            gap: 12,
                        }}
                        ItemSeparatorComponent={() => <View className="h-3" />}
                        ListEmptyComponent={renderEmpty}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
