import React from 'react';
import { View, Text, Image, Pressable, Linking } from 'react-native';
import { Play, ExternalLink } from 'lucide-react-native';

interface YoutubeEmbedProps {
    url: string;
}

// Extract YouTube video ID from URL
function getYoutubeVideoId(url: string): string | null {
    const regex =
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export function YoutubeEmbed({ url }: YoutubeEmbedProps) {
    const videoId = getYoutubeVideoId(url);

    if (!videoId) {
        return (
            <View className="h-48 rounded-xl bg-muted items-center justify-center">
                <Text className="text-sm text-muted-foreground">Invalid YouTube URL</Text>
            </View>
        );
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const openYoutube = () => {
        Linking.openURL(url);
    };

    return (
        <Pressable onPress={openYoutube} className="rounded-xl overflow-hidden relative">
            <Image source={{ uri: thumbnailUrl }} className="w-full h-48" resizeMode="cover" />
            <View className="absolute inset-0 items-center justify-center bg-black/30">
                <View className="w-16 h-12 rounded-lg bg-red-600 items-center justify-center">
                    <Play size={24} color="#ffffff" fill="#ffffff" />
                </View>
            </View>
            <View className="absolute top-2 right-2">
                <ExternalLink size={18} color="#ffffff" />
            </View>
        </Pressable>
    );
}
