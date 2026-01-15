import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { MapPin, Star, BadgeCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface InfoProfileProps {
    name: string;
    location: string;
    rating?: number;
    reviewCount?: number;
    bio: string;
    avatarSource: any;
    backgroundSource?: any;
    role?: 'singer' | 'producer' | 'venue';
}

const roleIcons = {
    singer: require('@/assets/images/Singer.png'),
    producer: require('@/assets/images/DJ.png'),
    venue: require('@/assets/images/Venue.png'),
};

const roleColors = {
    singer: '#EC4899',
    producer: '#3B82F6',
    venue: '#F59E0B',
    default: '#7C3AED',
};

export function InfoProfile({
    name,
    location,
    rating = 0,
    reviewCount = 0,
    bio,
    avatarSource,
    backgroundSource,
    role = 'singer',
}: InfoProfileProps) {
    const roleColor = roleColors[role] || roleColors.default;

    return (
        <View className="gap-4">
            {/* Background with gradient overlay */}
            <View className="h-60 w-full relative bg-gray-100 dark:bg-gray-800">
                {backgroundSource?.uri ? (
                    <>
                        <Image
                            source={backgroundSource}
                            className="w-full h-full absolute"
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                            className="absolute inset-0"
                        />
                    </>
                ) : (
                    <LinearGradient
                        colors={[roleColor, `${roleColor}99`, `${roleColor}40`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-full h-full"
                    />
                )}
            </View>

            {/* Avatar and Info */}
            <View className="flex-row items-end gap-4 px-5 -mt-16">
                <View className="relative shadow-2xl">
                    <View className="p-1 bg-background rounded-2xl">
                        <Image
                            source={avatarSource}
                            className="w-28 h-28 rounded-xl"
                            resizeMode="cover"
                        />
                    </View>
                    <View className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-sm">
                        <Image source={roleIcons[role]} className="w-6 h-6" resizeMode="contain" />
                    </View>
                </View>

                <View className="gap-1 flex-1 mb-2">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-2xl font-bold text-foreground">{name}</Text>
                        <BadgeCheck size={20} color="#3b82f6" fill="#3b82f640" />
                    </View>

                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1">
                            <MapPin size={14} className="text-muted-foreground" />
                            <Text className="text-sm font-medium text-muted-foreground">
                                {location}
                            </Text>
                        </View>
                        {rating > 0 && (
                            <View className="flex-row items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                                <Text className="text-xs font-bold text-amber-600 dark:text-amber-500">
                                    {rating}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Bio */}
            <View className="px-5 mt-2">
                <Text className="text-base text-foreground/80 leading-6 tracking-tight">{bio}</Text>
            </View>
        </View>
    );
}
