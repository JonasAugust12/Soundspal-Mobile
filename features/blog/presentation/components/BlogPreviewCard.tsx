import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { ThumbsUp, MessageCircle, BookOpen } from 'lucide-react-native';
import { cardShadow } from '@/shared/presentation/ui/shadows';
import type { BlogPost } from '@/features/blog/domain/entities/blog.type';

export const BLOG_PREVIEW_CARD_WIDTH = 260;
export const BLOG_PREVIEW_CARD_HEIGHT = 260;

interface BlogPreviewCardProps {
    article: BlogPost;
    width?: number;
    onPress?: () => void;
}

/**
 * Compact, fixed-size blog card for horizontal carousels (e.g. the Home screen
 * "Blog · Tin tức" section). For the full-width list card see `BlogCard`.
 */
export function BlogPreviewCard({
    article,
    width = BLOG_PREVIEW_CARD_WIDTH,
    onPress,
}: BlogPreviewCardProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const summary = article.short_description || article.brief_description || article.excerpt || '';
    const author = article.creator_display_name || article.creator_username || 'TalentLink Author';

    const handlePress = () => {
        onPress?.();
        router.push({ pathname: '/(blog)/[id]', params: { id: article.id } });
    };

    return (
        <View style={[styles.cardWrapper, { width, height: BLOG_PREVIEW_CARD_HEIGHT }]}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.92}
                style={styles.cardInner}
                className={`rounded-2xl overflow-hidden border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
                }`}
            >
                {/* Thumbnail */}
                {article.thumbnail ? (
                    <Image
                        source={{ uri: article.thumbnail }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={styles.thumbnail}
                        className={`items-center justify-center ${
                            isDark ? 'bg-slate-800' : 'bg-purple-50'
                        }`}
                    >
                        <BookOpen size={28} color={isDark ? '#64748B' : '#C4B5FD'} />
                    </View>
                )}

                <View className="flex-1 p-3">
                    {/* Category */}
                    {article.category ? (
                        <View className="self-start px-2.5 py-1 rounded-full bg-purple-100 mb-2">
                            <Text className="text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                                {article.category}
                            </Text>
                        </View>
                    ) : null}

                    {/* Title */}
                    <Text
                        className={`text-sm font-bold leading-tight ${
                            isDark ? 'text-white' : 'text-slate-900'
                        }`}
                        numberOfLines={2}
                    >
                        {article.title}
                    </Text>

                    {/* Summary */}
                    {summary ? (
                        <Text
                            className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                            numberOfLines={2}
                        >
                            {summary}
                        </Text>
                    ) : null}

                    {/* Meta row */}
                    <View className="flex-row items-center justify-between mt-auto pt-2">
                        <Text
                            className={`text-[11px] font-semibold flex-1 ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}
                            numberOfLines={1}
                        >
                            {author}
                        </Text>
                        <View className="flex-row items-center gap-2.5 ml-2">
                            <View className="flex-row items-center gap-1">
                                <ThumbsUp
                                    size={12}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                    fill={isDark ? '#9CA3AF' : '#6B7280'}
                                    strokeWidth={1.5}
                                />
                                <Text
                                    className={`text-[10px] font-medium ${
                                        isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                                >
                                    {article.likes || 0}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <MessageCircle
                                    size={12}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                    strokeWidth={1.5}
                                />
                                <Text
                                    className={`text-[10px] font-medium ${
                                        isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                                >
                                    {article.comment_count || 0}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

/** Loading placeholder matching BlogPreviewCard dimensions. */
export function BlogPreviewCardSkeleton({ width = BLOG_PREVIEW_CARD_WIDTH }: { width?: number }) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const block = isDark ? 'bg-slate-800' : 'bg-gray-200';

    return (
        <View style={[styles.cardWrapper, { width, height: BLOG_PREVIEW_CARD_HEIGHT }]}>
            <View
                style={styles.cardInner}
                className={`rounded-2xl overflow-hidden border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
                }`}
            >
                <View style={styles.thumbnail} className={block} />
                <View className="flex-1 p-3 gap-2">
                    <View className={`h-4 w-1/3 rounded-full ${block}`} />
                    <View className={`h-4 w-full rounded-full ${block}`} />
                    <View className={`h-4 w-2/3 rounded-full ${block}`} />
                    <View className={`h-3 w-full rounded-full mt-1 ${block}`} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        ...cardShadow,
        borderRadius: 16,
    },
    cardInner: {
        flex: 1,
    },
    thumbnail: {
        width: '100%',
        height: 120,
    },
});
