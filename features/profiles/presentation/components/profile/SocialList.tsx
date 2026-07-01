import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Facebook, Instagram, Youtube, Globe } from 'lucide-react-native';

interface SocialListProps {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
}

export function SocialList({ facebook, instagram, youtube, website }: SocialListProps) {
    const hasSocials = facebook || instagram || youtube || website;

    const openUrl = (url?: string) => {
        if (url) Linking.openURL(url);
    };

    if (!hasSocials) return null;

    return (
        <View className="gap-3">
            <Text className="text-base font-bold text-foreground">Kết nối</Text>
            <View className="flex-row gap-4">
                {facebook && (
                    <Pressable
                        onPress={() => openUrl(facebook)}
                        className="w-12 h-12 rounded-full bg-secondary items-center justify-center"
                    >
                        <Facebook size={22} color="#1877f2" />
                    </Pressable>
                )}
                {instagram && (
                    <Pressable
                        onPress={() => openUrl(instagram)}
                        className="w-12 h-12 rounded-full bg-secondary items-center justify-center"
                    >
                        <Instagram size={22} color="#e4405f" />
                    </Pressable>
                )}
                {youtube && (
                    <Pressable
                        onPress={() => openUrl(youtube)}
                        className="w-12 h-12 rounded-full bg-secondary items-center justify-center"
                    >
                        <Youtube size={22} color="#ff0000" />
                    </Pressable>
                )}
                {website && (
                    <Pressable
                        onPress={() => openUrl(website)}
                        className="w-12 h-12 rounded-full bg-secondary items-center justify-center"
                    >
                        <Globe size={22} color="#71717a" />
                    </Pressable>
                )}
            </View>
        </View>
    );
}
