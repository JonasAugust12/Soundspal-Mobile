import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { showAppDialog } from '@/shared/presentation/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import {
    BlogDetailHeader,
    BlogDetailContent,
    BlogQuote,
    RelatedArticles,
    CommentsModal,
} from '@/features/blog/presentation/components';
import {
    useBlogArticle,
    useBlogFeed,
    useBlogComments,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
    useBookmarkPostMutation,
    useUnbookmarkPostMutation,
} from '@/features/blog/presentation/hooks/useBlogApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useBlogBookmarkStore } from '@/features/blog/presentation/store/blogBookmarkStore';
import type { BlogPost } from '@/features/blog/domain/entities/blog.type';

export default function BlogDetailScreen() {
    const params = useLocalSearchParams<{ id: string }>();
    const postId = useMemo(() => {
        const raw = params.id;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params.id]);
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const user = useAuthStore((s) => s.user);

    const { data: article, isLoading, error } = useBlogArticle(postId);
    const { data: allPosts = [] } = useBlogFeed();
    const { data: comments = [], isLoading: commentsLoading } = useBlogComments(postId, {
        enabled: !!postId,
    });
    const createCommentM = useCreateComment(postId ?? '');
    const updateCommentM = useUpdateComment(postId ?? '');
    const deleteCommentM = useDeleteComment(postId ?? '');
    const addBookmarkM = useBookmarkPostMutation();
    const removeBookmarkM = useUnbookmarkPostMutation();

    // Trạng thái lưu đọc từ store bền vững (persist) → giữ nguyên khi rời màn / mở lại app.
    const savedPosts = useBlogBookmarkStore((s) => s.savedPosts);
    const addBookmarkLocal = useBlogBookmarkStore((s) => s.addBookmark);
    const removeBookmarkLocal = useBlogBookmarkStore((s) => s.removeBookmark);
    const isArticleBookmarked = !!(postId && savedPosts.some((p) => p.id === postId));

    const handleOpenComments = useCallback(() => {
        setShowCommentsModal(true);
    }, []);

    const handleBookmarkPress = useCallback(() => {
        if (!user?.id || !postId || !article) {
            showAppDialog('Cần đăng nhập', 'Đăng nhập để lưu bài viết vào mục đã lưu.');
            return;
        }
        const currentlyBookmarked = savedPosts.some((p) => p.id === postId);
        // Cập nhật store ngay (icon đổi + hiện ở tab "Đã lưu"), rồi đồng bộ backend.
        if (currentlyBookmarked) removeBookmarkLocal(postId);
        else addBookmarkLocal(article);
        const options = {
            onError: () => {
                if (currentlyBookmarked) addBookmarkLocal(article);
                else removeBookmarkLocal(postId);
                showAppDialog(
                    'Lỗi',
                    currentlyBookmarked ? 'Không thể bỏ lưu.' : 'Không thể lưu bài viết.',
                );
            },
        };
        if (currentlyBookmarked) {
            removeBookmarkM.mutate({ postId }, options);
        } else {
            addBookmarkM.mutate({ postId }, options);
        }
    }, [
        user?.id,
        postId,
        article,
        savedPosts,
        addBookmarkLocal,
        removeBookmarkLocal,
        addBookmarkM,
        removeBookmarkM,
    ]);

    const userAvatar =
        user?.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.id ?? 'user')}`;

    if (isLoading) {
        return (
            <SafeAreaView
                className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            >
                <ActivityIndicator size="large" color={isDark ? '#E2E8F0' : '#1F2937'} />
            </SafeAreaView>
        );
    }

    if (error || !article || !postId) {
        return (
            <SafeAreaView
                className={`flex-1 items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            >
                <View className="text-center">
                    <Text className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                        Failed to load article
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const relatedArticles = allPosts.filter((a) => a.id !== article.id).slice(0, 3);

    const handleBackPress = () => {
        router.back();
    };

    const handleRelatedArticlePress = (relatedArticle: BlogPost) => {
        router.push({
            pathname: '/(blog)/[id]',
            params: { id: relatedArticle.id },
        });
    };

    const handleSendComment = async (text: string, parentId?: string | null) => {
        try {
            // Bình luận hiện ngay trong danh sách nên không cần popup thành công.
            // parentId có giá trị khi đang trả lời một bình luận gốc (tối đa 2 tầng).
            await createCommentM.mutateAsync({
                content: text.trim(),
                parent_id: parentId ?? undefined,
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Không thể đăng bình luận.';
            showAppDialog('Lỗi', msg);
        }
    };

    const handleUpdateComment = async (commentId: string, newText: string) => {
        try {
            await updateCommentM.mutateAsync({
                commentId,
                request: { content: newText.trim() },
            });
            showAppDialog('Thành công', 'Đã cập nhật bình luận.');
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Không thể cập nhật bình luận.';
            showAppDialog('Lỗi', msg);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteCommentM.mutateAsync(commentId);
            showAppDialog('Thành công', 'Đã xóa bình luận.');
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Không thể xóa bình luận.';
            showAppDialog('Lỗi', msg);
        }
    };

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            edges={['top', 'right', 'bottom', 'left']}
            style={{ position: 'relative' }}
        >
            <BlogDetailHeader
                onBackPress={handleBackPress}
                onBookmarkPress={handleBookmarkPress}
                onCommentPress={handleOpenComments}
                isBookmarked={isArticleBookmarked}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <BlogDetailContent article={article} />

                <View className="px-4 my-8">
                    <BlogQuote
                        text={`"${article.title}" - A deep dive into music's transformative power and cultural impact.`}
                    />
                </View>

                <View className="px-4 mb-8">
                    <View className={`rounded-lg p-4 ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                        <View className="flex-row justify-around">
                            <View className="items-center">
                                <Text
                                    className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                                >
                                    {article.view_count || 0}
                                </Text>
                                <Text
                                    className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                                >
                                    Views
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text
                                    className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                                >
                                    {article.comment_count || 0}
                                </Text>
                                <Text
                                    className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                                >
                                    Comments
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text
                                    className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                                >
                                    {article.upvote_count || 0}
                                </Text>
                                <Text
                                    className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                                >
                                    Upvotes
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {article.tags && article.tags.length > 0 && (
                    <View className="px-4 mb-8">
                        <Text
                            className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                        >
                            TAGS
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {article.tags.map((tag: string) => (
                                <View
                                    key={tag}
                                    className={`px-3 py-1.5 rounded-full ${
                                        isDark
                                            ? 'bg-purple-900/30 border border-purple-700'
                                            : 'bg-purple-100 border border-purple-300'
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}
                                    >
                                        #{tag}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <RelatedArticles
                    articles={relatedArticles}
                    onArticlePress={handleRelatedArticlePress}
                />
            </ScrollView>

            <CommentsModal
                visible={showCommentsModal}
                comments={comments}
                articleTitle={article.title}
                userAvatar={userAvatar}
                onClose={() => setShowCommentsModal(false)}
                isLoading={commentsLoading}
                isSending={createCommentM.isPending || updateCommentM.isPending}
                currentUserId={user?.id ?? null}
                onSendComment={handleSendComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
                allowVoice={false}
            />
        </SafeAreaView>
    );
}
