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
    backgroundSource: any;
    role?: 'singer' | 'producer' | 'venue';
}

const roleIcons = {
    singer: require('@/assets/images/Singer.png'),
    producer: require('@/assets/images/DJ.png'),
    venue: require('@/assets/images/Venue.png'),
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
    return (
        <View className="gap-3">
            {/* Background with gradient overlay */}
            <View className="h-44 w-full relative">
                <Image
                    source={backgroundSource}
                    className="w-full h-full absolute"
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    className="absolute inset-0"
                />
            </View>

            {/* Avatar and Info */}
            <View className="flex-row items-center gap-4 px-5 -mt-14">
                <View className="relative border-4 border-background rounded-xl shadow-lg">
                    <Image
                        source={avatarSource}
                        className="w-24 h-24 rounded-lg"
                        resizeMode="cover"
                    />
                    <Image
                        source={roleIcons[role]}
                        className="w-8 h-8 absolute -bottom-3 -right-3"
                        resizeMode="contain"
                    />
                </View>

                <View className="gap-1 flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-foreground">{name}</Text>
                        <BadgeCheck size={18} color="#3b82f6" fill="#3b82f680" />
                    </View>

                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1">
                            <MapPin size={14} color="#71717a" />
                            <Text className="text-sm text-muted-foreground">{location}</Text>
                        </View>
                        {rating > 0 && (
                            <View className="flex-row items-center gap-1">
                                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                <Text className="text-sm text-muted-foreground">{rating}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Bio */}
            <View className="px-5">
                <Text className="text-sm text-muted-foreground leading-5">{bio}</Text>
            </View>
        </View>
    );
}
