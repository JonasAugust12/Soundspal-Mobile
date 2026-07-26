import React, { useMemo } from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import { CalendarDays } from 'lucide-react-native';
import RenderHTML from 'react-native-render-html';
import type { MixedStyleDeclaration } from 'react-native-render-html';
import type { BlogPost } from '@/features/blog/domain/entities/blog.type';

interface BlogDetailContentProps {
    article: BlogPost;
}

/** Nhãn vai trò tác giả bằng tiếng Việt (giữ nguyên các vai trò chuyên ngành đã Việt hoá). */
function creatorRoleLabel(role?: string): string {
    switch (role) {
        case 'artist':
            return 'Nghệ sĩ';
        case 'producer':
            return 'Nhà sản xuất';
        case 'venue':
            return 'Nhà tuyển dụng';
        default:
            return 'Tác giả';
    }
}

/** Decode common entities and strip tags so we can compare CMS title vs opening &lt;h1&gt;. */
function normalizeComparableText(fragment: string): string {
    const decoded = fragment
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#160;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<[^>]+>/g, '');
    return decoded.replace(/\s+/g, ' ').trim();
}

/** Avoid showing the same headline twice when body starts with &lt;h1&gt; equal to `article.title`. */
function stripOpeningH1IfMatchesTitle(html: string, title?: string): string {
    if (!html.trim() || !title?.trim()) return html;
    const trimmed = html.trim();
    const match = trimmed.match(/^<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (!match) return html;
    const inner = normalizeComparableText(match[1]);
    const t = normalizeComparableText(title);
    if (inner === t) {
        return trimmed.slice(match[0].length).trimStart();
    }
    return html;
}

export function BlogDetailContent({ article }: BlogDetailContentProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { width: windowWidth } = useWindowDimensions();
    const contentWidth = Math.max(0, windowWidth - 32);

    const avatarSeed = article.creator_username || article.creator_display_name || 'author';
    const authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    const authorName = article.creator_display_name || article.creator_username || 'Anonymous';

    const htmlSource = useMemo(() => {
        return stripOpeningH1IfMatchesTitle(article.content ?? '', article.title);
    }, [article.content, article.title]);

    const tagsStyles = useMemo<Record<string, MixedStyleDeclaration>>(() => {
        const bodyColor = isDark ? '#cbd5e1' : '#475569';
        const h1Color = isDark ? '#f8fafc' : '#0f172a';
        const h2Color = isDark ? '#e2e8f0' : '#1e293b';
        const linkColor = isDark ? '#c4b5fd' : '#7c3aed';

        return {
            body: {
                color: bodyColor,
                fontSize: 16,
                lineHeight: 26,
            },
            p: {
                marginTop: 0,
                marginBottom: 14,
                fontSize: 16,
                lineHeight: 26,
                color: bodyColor,
            },
            h1: {
                fontSize: 26,
                fontWeight: '700',
                lineHeight: 32,
                color: h1Color,
                marginTop: 8,
                marginBottom: 12,
            },
            h2: {
                fontSize: 20,
                fontWeight: '700',
                lineHeight: 28,
                color: h2Color,
                marginTop: 22,
                marginBottom: 10,
            },
            h3: {
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 26,
                color: h2Color,
                marginTop: 18,
                marginBottom: 8,
            },
            ul: {
                marginTop: 4,
                marginBottom: 16,
                paddingLeft: 4,
            },
            ol: {
                marginTop: 4,
                marginBottom: 16,
                paddingLeft: 4,
            },
            li: {
                marginBottom: 8,
                fontSize: 16,
                lineHeight: 26,
                color: bodyColor,
            },
            strong: {
                fontWeight: '700',
                color: isDark ? '#f1f5f9' : '#0f172a',
            },
            b: {
                fontWeight: '700',
                color: isDark ? '#f1f5f9' : '#0f172a',
            },
            a: {
                color: linkColor,
                textDecorationLine: 'underline',
            },
            blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: isDark ? '#6366f1' : '#8b5cf6',
                paddingLeft: 14,
                marginVertical: 12,
                fontStyle: 'italic',
                color: bodyColor,
            },
        };
    }, [isDark]);

    return (
        <View>
            {/* Ngày đăng bài (thay cho hiển thị id topic) */}
            <View className="px-4 pt-4 pb-3 flex-row items-center gap-3">
                <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full border-2 border-purple-600">
                    <CalendarDays size={12} color="#9333EA" strokeWidth={2} />
                    <Text className="text-purple-600 text-xs font-bold">{article.publishedAt}</Text>
                </View>
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
                        {creatorRoleLabel(article.creator_role)}
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

            {/* Article body (HTML from CMS) */}
            <View className="px-4 pb-6">
                {htmlSource.trim().length > 0 ? (
                    <RenderHTML
                        contentWidth={contentWidth}
                        source={{ html: htmlSource }}
                        tagsStyles={tagsStyles}
                        defaultTextProps={{
                            selectable: true,
                        }}
                    />
                ) : (
                    <Text
                        className={`text-base italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                    >
                        No article body yet.
                    </Text>
                )}
            </View>
        </View>
    );
}
