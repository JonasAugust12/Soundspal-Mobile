import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { ThumbsUp, MessageCircle, Pencil, Bookmark } from 'lucide-react-native';
import type { BlogPost } from '@/features/blog/domain/entities/blog.type';

interface BlogCardProps {
    article: BlogPost;
    onPress?: () => void;
    /** When set, an Edit control is shown (e.g. “My posts” tab). */
    showEdit?: boolean;
    onEditPress?: (article: BlogPost) => void;
    /** Logged-in: save / remove bookmark without opening the article. */
    showBookmark?: boolean;
    isBookmarked?: boolean;
    bookmarkLoading?: boolean;
    onBookmarkPress?: (article: BlogPost) => void;
}

export function BlogCard({
    article,
    onPress,
    showEdit,
    onEditPress,
    showBookmark,
    isBookmarked,
    bookmarkLoading,
    onBookmarkPress,
}: BlogCardProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const handlePress = () => {
        onPress?.();
        router.push({
            pathname: '/(blog)/[id]',
            params: { id: article.id },
        });
    };

    return (
        <View
            className={`mx-4 mb-6 p-4 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
            }`}
        >
            {showEdit && onEditPress ? (
                <View className="flex-row justify-end items-center gap-2 mb-2">
                    {showBookmark && onBookmarkPress ? (
                        <TouchableOpacity
                            onPress={() => onBookmarkPress(article)}
                            disabled={bookmarkLoading}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            className="rounded-full p-2 border border-amber-500/50 bg-amber-500/10"
                        >
                            <Bookmark
                                size={18}
                                color={isBookmarked ? '#D97706' : isDark ? '#E2E8F0' : '#1F2937'}
                                fill={isBookmarked ? '#FBBF24' : 'none'}
                                strokeWidth={2}
                            />
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                        onPress={() => onEditPress(article)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="flex-row items-center gap-1.5 rounded-full border border-purple-500/50 bg-purple-500/10 px-3 py-1.5"
                    >
                        <Pencil size={14} color="#A855F7" strokeWidth={2} />
                        <Text className="text-sm font-semibold text-purple-600">Edit</Text>
                    </TouchableOpacity>
                </View>
            ) : showBookmark && onBookmarkPress ? (
                <View className="flex-row justify-end mb-2">
                    <TouchableOpacity
                        onPress={() => onBookmarkPress(article)}
                        disabled={bookmarkLoading}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="rounded-full p-2 border border-amber-500/50 bg-amber-500/10"
                    >
                        <Bookmark
                            size={18}
                            color={isBookmarked ? '#D97706' : isDark ? '#E2E8F0' : '#1F2937'}
                            fill={isBookmarked ? '#FBBF24' : 'none'}
                            strokeWidth={2}
                        />
                    </TouchableOpacity>
                </View>
            ) : null}
            <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
                <View className="flex-row gap-4">
                    {/* Left side - Content */}
                    <View className="flex-1">
                        {/* Category tag and metadata row */}
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="px-3 py-1 rounded-full bg-purple-100">
                                <Text className="text-purple-700 text-xs font-bold uppercase tracking-wider">
                                    {article.category}
                                </Text>
                            </View>
                            <Text
                                className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                            >
                                {article.readTime} min read • {article.publishedAt}
                            </Text>
                        </View>

                        {/* Title - Larger */}
                        <Text
                            className={`text-xl font-bold mb-3 leading-snug ${
                                isDark ? 'text-white' : 'text-slate-900'
                            }`}
                            numberOfLines={3}
                        >
                            {article.title}
                        </Text>

                        {/* Author info with avatar */}
                        {/* Removed - only show author name in bottom row */}

                        {/* Author, Time, Likes, Comments - All in one row */}
                        <View className="flex-row items-center justify-between gap-2">
                            {/* Left: Author name */}
                            <Text
                                className={`text-sm font-semibold ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}
                                numberOfLines={1}
                            >
                                {article.creator_display_name ||
                                    article.creator_username ||
                                    'TalentLink Author'}
                            </Text>

                            {/* Right: Likes and Comments */}
                            <View className="flex-row items-center gap-3">
                                <View className="flex-row items-center gap-1">
                                    <ThumbsUp
                                        size={14}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                        fill={isDark ? '#9CA3AF' : '#6B7280'}
                                        strokeWidth={1.5}
                                    />
                                    <Text
                                        className={`text-xs font-medium ${
                                            isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}
                                    >
                                        {article.likes || 0}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <MessageCircle
                                        size={14}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                        strokeWidth={1.5}
                                    />
                                    <Text
                                        className={`text-xs font-medium ${
                                            isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}
                                    >
                                        {article.comment_count || 0}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Right side - Thumbnail */}
                    {article.thumbnail ? (
                        <Image
                            source={{ uri: article.thumbnail }}
                            className="w-24 h-24 rounded-lg"
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            className={`w-24 h-24 rounded-lg ${
                                isDark ? 'bg-slate-800' : 'bg-gray-100'
                            } justify-center items-center`}
                        >
                            <Text className={isDark ? 'text-slate-500' : 'text-gray-400'}>
                                No image
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}
