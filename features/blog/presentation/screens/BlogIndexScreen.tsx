import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';
import { useBlogBookmarkStore } from '@/features/blog/presentation/store/blogBookmarkStore';
import {
    BlogHeader,
    BlogTabBar,
    BlogLibraryRow,
    FeaturedArticle,
    BlogCard,
    CreateBlogModal,
    EditBlogModal,
    BlogSlidingNotice,
    BlogSearchBar,
    FloatingCreateButton,
    type BlogNoticePayload,
} from '@/features/blog/presentation/components';
import { BLOG_FOR_YOU_TAB } from '@/features/blog/domain/constants/blog';
import {
    useBlogFeed,
    useBlogSearch,
    useBlogTopics,
    useBookmarksList,
    useBookmarkPostMutation,
    useUnbookmarkPostMutation,
} from '@/features/blog/presentation/hooks/useBlogApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import type { BlogPost, BlogTab } from '@/features/blog/domain/entities/blog.type';

type BlogNoticeState = BlogNoticePayload & { key: string };

export default function BlogScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const user = useAuthStore((s) => s.user);
    const [activeTab, setActiveTab] = useState('for-you');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);
    const [blogNotice, setBlogNotice] = useState<BlogNoticeState | null>(null);
    /** Draft in the text field; API query uses `committedSearch` only after submit. */
    const [searchDraft, setSearchDraft] = useState('');
    const [committedSearch, setCommittedSearch] = useState('');
    const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);
    // Nguồn "đã lưu" bền vững (persist MMKV) — hiển thị được sau khi rời màn / mở lại app.
    const savedPosts = useBlogBookmarkStore((s) => s.savedPosts);
    const isBookmarked = useBlogBookmarkStore((s) => s.isBookmarked);
    const addBookmarkLocal = useBlogBookmarkStore((s) => s.addBookmark);
    const removeBookmarkLocal = useBlogBookmarkStore((s) => s.removeBookmark);
    const mergeServerBookmarks = useBlogBookmarkStore((s) => s.mergeServer);

    const commitSearch = useCallback(() => {
        setCommittedSearch(searchDraft.trim());
    }, [searchDraft]);

    // Không có nút xoá riêng (giống thanh tìm ở Khám phá): xoá hết chữ thì thoát tìm kiếm.
    const handleSearchChange = useCallback((text: string) => {
        setSearchDraft(text);
        if (text.trim().length === 0) setCommittedSearch('');
    }, []);

    const isSearchMode = committedSearch.trim().length > 0;
    const isMyPostsTab = activeTab === 'my-posts';
    const isBookmarksTab = activeTab === 'bookmarks';
    const myPostsNeedsAuth = isMyPostsTab && !user?.id;
    const bookmarksNeedsAuth = isBookmarksTab && !user?.id;
    const tabAuthBlockedForSearch = (isMyPostsTab || isBookmarksTab) && !user?.id;
    /** One feed fetch when not searching; tabs (incl. My posts) filter client-side. */
    const listEnabled = !isSearchMode;

    const {
        data: listPosts = [],
        isLoading: listLoading,
        error: listError,
        refetch: refetchList,
        isRefetching: listRefetching,
    } = useBlogFeed({ enabled: listEnabled });

    const {
        data: bookmarkPosts = [],
        isLoading: bookmarksLoading,
        error: bookmarksError,
        refetch: refetchBookmarks,
        isFetching: bookmarksFetching,
    } = useBookmarksList({ enabled: !!user && !isSearchMode });

    // Chủ đề lấy động từ /blogs/topics — tab feed = "Dành cho bạn" + các chủ đề backend.
    const { data: topics = [] } = useBlogTopics();
    const feedTabs = useMemo<BlogTab[]>(
        () => [BLOG_FOR_YOU_TAB, ...topics.map((t) => ({ id: t.id, label: t.name, value: t.id }))],
        [topics],
    );

    const addBookmarkM = useBookmarkPostMutation();
    const removeBookmarkM = useUnbookmarkPostMutation();

    // Gộp danh sách /bookmarks (server) vào store bền vững khi có dữ liệu mới.
    useEffect(() => {
        if (bookmarkPosts.length) mergeServerBookmarks(bookmarkPosts);
    }, [bookmarkPosts, mergeServerBookmarks]);

    const searchQueryEnabled = isSearchMode && !tabAuthBlockedForSearch;

    const {
        data: searchPosts = [],
        isLoading: searchLoading,
        error: searchError,
        refetch: refetchSearch,
        isFetching: searchFetching,
    } = useBlogSearch({ q: committedSearch }, { enabled: searchQueryEnabled });

    const posts = useMemo((): BlogPost[] => {
        if (isSearchMode) {
            return tabAuthBlockedForSearch ? [] : searchPosts;
        }
        if (isBookmarksTab && user?.id) {
            return bookmarkPosts;
        }
        return listPosts;
    }, [
        isSearchMode,
        tabAuthBlockedForSearch,
        searchPosts,
        isBookmarksTab,
        user?.id,
        bookmarkPosts,
        listPosts,
    ]);

    const isLoading = isSearchMode
        ? searchLoading
        : isBookmarksTab && user
          ? bookmarksLoading
          : listLoading;
    const error = isSearchMode ? searchError : isBookmarksTab && user ? bookmarksError : listError;
    const isRefetching = isSearchMode
        ? searchFetching
        : isBookmarksTab && user
          ? bookmarksFetching
          : listRefetching;

    /** Full-screen spinner: initial feed/bookmarks only — search keeps list + header visible.
     *  Bỏ qua khi ở tab "Đã lưu" mà đã có bài lưu sẵn trong store (khỏi che bằng spinner). */
    const blockingInitialLoad =
        !isSearchMode &&
        isLoading &&
        posts.length === 0 &&
        !(isBookmarksTab && savedPosts.length > 0);

    const onRefresh = useCallback(() => {
        if (isSearchMode) void refetchSearch();
        else if (isBookmarksTab && user) void refetchBookmarks();
        else void refetchList();
    }, [isSearchMode, isBookmarksTab, user, refetchSearch, refetchBookmarks, refetchList]);

    const handleToggleBookmark = useCallback(
        async (article: BlogPost) => {
            if (!user?.id) return;

            const currentlyBookmarked = isBookmarked(article.id);

            setBookmarkPendingId(article.id);
            // Cập nhật store bền vững ngay (bài lưu hiện ở tab "Đã lưu" + sống qua điều hướng),
            // rồi đồng bộ backend; lỗi thì revert.
            if (currentlyBookmarked) removeBookmarkLocal(article.id);
            else addBookmarkLocal(article);
            try {
                if (currentlyBookmarked) {
                    await removeBookmarkM.mutateAsync({ postId: article.id });
                } else {
                    await addBookmarkM.mutateAsync({ postId: article.id });
                }
            } catch {
                if (currentlyBookmarked) addBookmarkLocal(article);
                else removeBookmarkLocal(article.id);
                Toast.show({
                    type: 'error',
                    text1: currentlyBookmarked ? 'Không thể bỏ lưu' : 'Không thể lưu bài viết',
                    text2: 'Vui lòng thử lại.',
                });
            } finally {
                setBookmarkPendingId(null);
            }
        },
        [
            user?.id,
            isBookmarked,
            addBookmarkLocal,
            removeBookmarkLocal,
            addBookmarkM,
            removeBookmarkM,
        ],
    );

    const isTopicTab = (t: string) => t !== 'for-you' && t !== 'my-posts' && t !== 'bookmarks';

    const filteredArticles = useMemo(() => {
        if (isSearchMode) {
            let list = posts;
            if (isMyPostsTab && user?.id) {
                list = list.filter((a) => a.author_id === user.id);
            } else if (isBookmarksTab && user?.id) {
                list = list.filter((a) => isBookmarked(a.id));
            } else if (isTopicTab(activeTab)) {
                list = list.filter((a) => a.topic_id === activeTab);
            }
            return list;
        }
        if (activeTab === 'for-you') return listPosts;
        if (activeTab === 'my-posts') {
            if (!user?.id) return [];
            return listPosts.filter((a) => a.author_id === user.id);
        }
        if (activeTab === 'bookmarks') {
            if (!user?.id) return [];
            return savedPosts;
        }
        return listPosts.filter((a) => a.topic_id === activeTab);
    }, [
        isSearchMode,
        posts,
        listPosts,
        savedPosts,
        activeTab,
        isMyPostsTab,
        isBookmarksTab,
        user?.id,
        isBookmarked,
    ]);

    /** Large hero only on “For you” (not while searching). Other tabs: all items as standard cards. */
    const showFeaturedHero = activeTab === 'for-you' && !isSearchMode;
    const featuredArticle =
        showFeaturedHero && filteredArticles.length > 0 ? filteredArticles[0] : null;
    const listArticles =
        showFeaturedHero && featuredArticle ? filteredArticles.slice(1) : filteredArticles;

    const pushNotice = useCallback((payload: BlogNoticePayload) => {
        setBlogNotice({ ...payload, key: `${Date.now()}-${Math.random()}` });
    }, []);

    /** Hero scrolls with the list; search + tabs stay fixed so TextInput is not inside FlatList (avoids keyboard closing on each keystroke). */
    const listFeaturedHeader =
        showFeaturedHero && featuredArticle?.title ? (
            <FeaturedArticle article={featuredArticle} />
        ) : null;

    const fixedBlogChrome = (
        <View>
            <BlogHeader />
            <BlogSearchBar
                value={searchDraft}
                onChangeText={handleSearchChange}
                onSubmitSearch={commitSearch}
                isSearching={isSearchMode && (searchFetching || searchLoading)}
            />
            <BlogLibraryRow activeTab={activeTab} onTabChange={setActiveTab} />
            <BlogTabBar tabs={feedTabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </View>
    );

    if (myPostsNeedsAuth) {
        return (
            <SafeAreaView
                className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                edges={['top', 'right', 'bottom', 'left']}
            >
                {fixedBlogChrome}
                <FlatList
                    style={{ flex: 1 }}
                    data={[]}
                    renderItem={() => null}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center py-16 px-4">
                            <Text
                                className={`text-lg font-semibold text-center ${
                                    isDark ? 'text-slate-300' : 'text-gray-600'
                                }`}
                            >
                                Đăng nhập để xem bài viết của bạn
                            </Text>
                            <Text
                                className={`mt-2 text-center ${
                                    isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}
                            >
                                Mục "Bài viết của tôi" chỉ hiển thị những bài bạn đã đăng bằng tài
                                khoản này.
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        );
    }

    if (bookmarksNeedsAuth) {
        return (
            <SafeAreaView
                className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                edges={['top', 'right', 'bottom', 'left']}
            >
                {fixedBlogChrome}
                <FlatList
                    style={{ flex: 1 }}
                    data={[]}
                    renderItem={() => null}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center py-16 px-4">
                            <Text
                                className={`text-lg font-semibold text-center ${
                                    isDark ? 'text-slate-300' : 'text-gray-600'
                                }`}
                            >
                                Đăng nhập để xem mục đã lưu
                            </Text>
                            <Text
                                className={`mt-2 text-center ${
                                    isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}
                            >
                                Lưu bài viết bằng biểu tượng đánh dấu để xem lại tại đây.
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        );
    }

    if (blockingInitialLoad) {
        return (
            <SafeAreaView
                className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                edges={['top', 'right', 'bottom', 'left']}
            >
                <ActivityIndicator size="large" color={isDark ? '#E2E8F0' : '#1F2937'} />
                <Text className={`mt-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    Đang tải bài viết...
                </Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                className={`flex-1 justify-center items-center px-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                edges={['top', 'right', 'bottom', 'left']}
            >
                <Text
                    className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}
                >
                    {isSearchMode ? 'Tìm kiếm thất bại' : 'Không tải được bài viết'}
                </Text>
                <Text className={`mt-1 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                </Text>
            </SafeAreaView>
        );
    }

    if (filteredArticles.length === 0 && !isLoading) {
        const emptyTitle = isSearchMode ? 'Không có kết quả' : 'Chưa có bài viết';
        const emptySubtitle = isSearchMode
            ? 'Thử từ khoá hoặc mục khác.'
            : isMyPostsTab
              ? 'Bạn chưa đăng bài nào ở đây. Tạo bài mới bằng nút +.'
              : isBookmarksTab
                ? 'Bạn chưa lưu bài viết nào. Dùng biểu tượng đánh dấu trên bài để lưu tại đây.'
                : 'Quay lại sau để xem bài viết mới nhé.';
        return (
            <SafeAreaView
                className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                edges={['top', 'right', 'bottom', 'left']}
            >
                {fixedBlogChrome}
                <FlatList
                    style={{ flex: 1 }}
                    data={[]}
                    renderItem={() => null}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center py-16 px-4">
                            <Text
                                className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}
                            >
                                {emptyTitle}
                            </Text>
                            <Text
                                className={`mt-2 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                                {emptySubtitle}
                            </Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={onRefresh}
                            tintColor={isDark ? '#E2E8F0' : '#1F2937'}
                        />
                    }
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            edges={['top', 'right', 'bottom', 'left']}
        >
            {fixedBlogChrome}
            <FlatList
                style={{ flex: 1 }}
                data={listArticles}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                renderItem={({ item }) => (
                    <BlogCard
                        article={item}
                        showEdit={isMyPostsTab}
                        onEditPress={(a) => setEditingArticle(a)}
                        showBookmark={!!user && !isSearchMode}
                        isBookmarked={isBookmarked(item.id)}
                        bookmarkLoading={bookmarkPendingId === item.id}
                        onBookmarkPress={handleToggleBookmark}
                    />
                )}
                ListHeaderComponent={listFeaturedHeader}
                ListEmptyComponent={
                    isSearchMode &&
                    (searchLoading || searchFetching) &&
                    listArticles.length === 0 ? (
                        <View className="py-16 items-center px-6">
                            <ActivityIndicator
                                size="small"
                                color={isDark ? '#A78BFA' : '#7C3AED'}
                            />
                            <Text
                                className={`mt-3 text-center text-sm ${
                                    isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}
                            >
                                Đang tìm…
                            </Text>
                        </View>
                    ) : null
                }
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={isDark ? '#E2E8F0' : '#1F2937'}
                    />
                }
                // Chừa chỗ cho nút "+" nổi (đã nâng lên trên vạch home) để card cuối cùng
                // không bị nút che phần meta ngày đăng / thời lượng đọc.
                contentContainerStyle={{ paddingBottom: 140 }}
            />

            <FloatingCreateButton onPress={() => setShowCreateModal(true)} />

            <CreateBlogModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    void refetchList();
                    if (user) void refetchBookmarks();
                }}
                onBlogNotify={pushNotice}
            />

            <EditBlogModal
                visible={!!editingArticle}
                article={editingArticle}
                onClose={() => setEditingArticle(null)}
                onSuccess={() => {
                    void refetchList();
                    if (user) void refetchBookmarks();
                }}
                onBlogNotify={pushNotice}
            />

            {blogNotice ? (
                <BlogSlidingNotice
                    key={blogNotice.key}
                    variant={blogNotice.variant}
                    title={blogNotice.title}
                    message={blogNotice.message}
                    onDismiss={() => setBlogNotice(null)}
                />
            ) : null}
        </SafeAreaView>
    );
}
