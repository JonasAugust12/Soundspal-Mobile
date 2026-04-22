import React from 'react';
import { View, Text, Image } from 'react-native';
import { useColorScheme } from 'nativewind';
import type { BlogPost } from '@/types/blog.type';

interface BlogDetailContentProps {
    article: BlogPost;
}

export function BlogDetailContent({ article }: BlogDetailContentProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Generate avatar from creator username or display name
    const avatarSeed = article.creator_username || article.creator_display_name || 'author';
    const authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    const authorName = article.creator_display_name || article.creator_username || 'Anonymous';

    return (
        <View>
            {/* Category and metadata */}
            <View className="px-4 pt-4 pb-3 flex-row items-center justify-between gap-3">
                <View className="px-3 py-1 rounded-full border-2 border-purple-600">
                    <Text className="text-purple-600 text-xs font-bold uppercase tracking-wider">
                        {article.category}
                    </Text>
                </View>
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    {article.readTime} min read • {article.publishedAt}
                </Text>
            </View>

            {/* Title */}
            <View className="px-4 py-3">
                <Text
                    className={`text-2xl font-bold leading-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                    }`}
                >
                    {article.title}
                </Text>
            </View>

            {/* Author info */}
            <View className="px-4 py-3 flex-row items-center gap-3">
                <Image source={{ uri: authorAvatar }} className="w-10 h-10 rounded-full" />
                <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {authorName}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {article.creator_role || 'Author'}
                    </Text>
                </View>
            </View>

            {/* Thumbnail */}
            {article.thumbnail && (
                <Image
                    source={{ uri: article.thumbnail }}
                    className="w-full h-64 my-4"
                    resizeMode="cover"
                />
            )}

            {/* Article content */}
            <View className="px-4 pb-4">
                <Text
                    className={`text-base leading-relaxed ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                >
                    {article.content}
                </Text>
            </View>
        </View>
    );
}
