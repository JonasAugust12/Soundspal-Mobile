import { router } from 'expo-router';
import React from 'react';
import { View, Text, Image, Pressable, ImageSourcePropType } from 'react-native';

export type UserRole = 'singer' | 'producer' | 'venue';

export type ArtistItem = {
    id: string;
    name: string;
    des: string;
    location: string;
    role: UserRole;
    username?: string;
    image: ImageSourcePropType;
};

type Props = { item: ArtistItem; width?: number };

export function ArtistCardSearch({ item, width = 160 }: Props) {
    const handlePress = () => {
        if (!item.username) return;

        // Navigate based on role
        if (item.role === 'venue') {
            router.push({
                pathname: '/(profiles)/venueProfile',
                params: { username: item.username },
            });
        } else {
            // Singer or Producer
            router.push({
                pathname: '/(profiles)/artistProfile',
                params: { username: item.username },
            });
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            className="rounded-2xl p-3 border border-border bg-card shadow-md active:opacity-80 active:scale-98"
            style={{ width }}
        >
            <View className="relative">
                <Image
                    source={item.image}
                    className="w-full rounded-2xl"
                    style={{ height: 400 }}
                    resizeMode="cover"
                />

                {/* Overlay info */}
                <View className="absolute left-3 right-3 bottom-3 bg-black/75 rounded-xl p-3 gap-2">
                    <View className="flex-row gap-2 items-center justify-between">
                        <Text className="text-white text-base font-bold flex-1" numberOfLines={1}>
                            {item.name}
                        </Text>
                        <View className="bg-secondary rounded-full px-2 py-1">
                            <Image
                                source={
                                    item.role === 'singer'
                                        ? require('@/assets/images/Singer.png')
                                        : item.role === 'producer'
                                          ? require('@/assets/images/DJ.png')
                                          : require('@/assets/images/Venue.png')
                                }
                                className="w-10 h-10"
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <Text className="text-white/80 text-xs" numberOfLines={2}>
                        {item.des}
                    </Text>
                    <Text className="text-white/90 text-xs" numberOfLines={1}>
                        {item.location}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}
