import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { BlogPost } from '@/types/blog.type';

interface FeaturedArticleProps {
    article: BlogPost;
    onPress?: () => void;
}

export function FeaturedArticle({ article, onPress }: FeaturedArticleProps) {
    const router = useRouter();

    const handlePress = () => {
        onPress?.();
        router.push({
            pathname: '/(blog)/[id]',
            params: { id: article.id },
        });
    };

    return (
        <TouchableOpacity onPress={handlePress} className="mx-4 my-4">
            <View className="rounded-2xl overflow-hidden bg-gray-300 relative h-64">
                {article.thumbnail && (
                    <Image
                        source={{ uri: article.thumbnail }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                )}

                {/* Gradient overlay */}
                <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Category badge */}
                <View className="absolute top-4 left-4 bg-purple-600 px-3 py-1.5 rounded-lg">
                    <Text className="text-white text-xs font-bold uppercase tracking-wide">
                        {article.category}
                    </Text>
                </View>

                {/* Content */}
                <View className="absolute inset-0 justify-end p-4">
                    <Text className="text-white text-xl font-bold mb-2 leading-tight">
                        {article.title}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
