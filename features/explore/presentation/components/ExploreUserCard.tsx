import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { MapPin, BadgeCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cardShadow } from '@/shared/presentation/ui/shadows';
import type { UserProfile } from '@/features/explore/domain/entities/search.type';

const ROLE_COLORS: Record<string, string> = {
    singer: '#EC4899',
    producer: '#3B82F6',
    venue: '#F59E0B',
};

const ROLE_LABELS: Record<string, string> = {
    singer: 'Ca sĩ',
    producer: 'Producer',
    venue: 'Địa điểm',
};

type Props = {
    item: UserProfile;
    onPress: (user: UserProfile) => void;
};

export const ExploreUserCard = React.memo(function ExploreUserCard({ item, onPress }: Props) {
    const location = [item.city, item.country].filter(Boolean).join(', ') || 'Chưa cập nhật';
    const roleColor = ROLE_COLORS[item.role] ?? '#7C3AED';
    const roleLabel = ROLE_LABELS[item.role] ?? item.role;

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            style={styles.card}
            className="bg-white rounded-2xl overflow-hidden"
            activeOpacity={0.9}
        >
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
                            {roleLabel}
                        </Text>
                    </View>
                </View>

                {item.brief_bio ? (
                    <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
                        {item.brief_bio}
                    </Text>
                ) : null}

                <View className="flex-row items-center gap-1 mt-2">
                    <MapPin size={12} color="#9CA3AF" />
                    <Text className="text-xs text-gray-400" numberOfLines={1}>
                        {location}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: cardShadow,
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
