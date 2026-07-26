import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { LoadingImage } from '@/shared/presentation/ui';
import type { BlogPost } from '@/features/blog/domain/entities/blog.type';

interface RelatedArticlesProps {
    articles: BlogPost[];
    onArticlePress?: (article: BlogPost) => void;
}

export function RelatedArticles({ articles, onArticlePress }: RelatedArticlesProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (articles.length === 0) return null;

    return (
        <View className="mt-8 mb-6">
            <Text
                className={`text-lg font-bold mb-4 px-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
                Bài viết liên quan
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                <View className="flex-row gap-3">
                    {articles.map((article) => (
                        <TouchableOpacity
                            key={article.id}
                            onPress={() => onArticlePress?.(article)}
                            className={`w-64 rounded-lg overflow-hidden border ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            <LoadingImage
                                uri={article.thumbnail}
                                style={{ width: 256, height: 128 }}
                                shimmerBase={isDark ? '#334155' : '#E5E7EB'}
                                fallback={
                                    <View
                                        className={`flex-1 items-center justify-center ${
                                            isDark ? 'bg-slate-700' : 'bg-gray-100'
                                        }`}
                                    >
                                        <Text
                                            className={isDark ? 'text-slate-500' : 'text-gray-400'}
                                        >
                                            Chưa có ảnh
                                        </Text>
                                    </View>
                                }
                            />

                            {/* Content */}
                            <View className="p-3">
                                <Text
                                    className={`text-xs font-bold mb-2 ${
                                        isDark ? 'text-purple-400' : 'text-purple-600'
                                    } uppercase`}
                                >
                                    {article.category}
                                </Text>

                                <Text
                                    className={`text-sm font-bold ${
                                        isDark ? 'text-white' : 'text-slate-900'
                                    }`}
                                    numberOfLines={2}
                                >
                                    {article.title}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
