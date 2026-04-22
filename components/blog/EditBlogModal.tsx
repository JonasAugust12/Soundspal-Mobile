import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { X, Save } from 'lucide-react-native';
import { useUpdateBlogPost } from '@/hooks/useBlogApi';
import { BLOG_CREATE_TOPIC_OPTIONS } from '@/constants/blog';
import type { BlogPost, UpdatePostRequest } from '@/types/blog.type';
import type { BlogNoticePayload } from './BlogSlidingNotice';

const TITLE_MIN_LEN = 3;
const CONTENT_MIN_LEN = 20;
const SHORT_DESC_MAX = 200;

const AVAILABLE_TAGS = [
    'music-trend',
    'indie-music',
    'hip-hop',
    'jazz',
    'kpop',
    'streaming',
    'production',
    'live-music',
    'technology',
    'artist-revenue',
    'music-industry',
    'diy-music',
];

interface EditBlogModalProps {
    visible: boolean;
    article: BlogPost | null;
    onClose: () => void;
    onSuccess?: () => void;
    onBlogNotify?: (payload: BlogNoticePayload) => void;
}

export function EditBlogModal({
    visible,
    article,
    onClose,
    onSuccess,
    onBlogNotify,
}: EditBlogModalProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const updateMutation = useUpdateBlogPost();

    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [content, setContent] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible && article) {
            setTitle(article.title ?? '');
            setContent(article.content ?? '');
            setShortDescription(article.short_description ?? article.excerpt ?? '');
            setSelectedTopic(article.topic_id ?? '');
            setSelectedTags(
                Array.isArray(article.tags) && article.tags.length > 0 ? [...article.tags] : [],
            );
        }
    }, [visible, article?.id]);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [visible, scaleAnim, opacityAnim]);

    const formError = useMemo((): string | null => {
        const t = title.trim();
        const c = content.trim();
        const s = shortDescription.trim();
        if (t.length < TITLE_MIN_LEN) {
            return `Title must be at least ${TITLE_MIN_LEN} characters`;
        }
        if (c.length < CONTENT_MIN_LEN) {
            return `Content must be at least ${CONTENT_MIN_LEN} characters`;
        }
        if (!selectedTopic) {
            return 'Select a topic for this post';
        }
        if (selectedTags.length < 1) {
            return 'Select at least one tag';
        }
        if (s.length > SHORT_DESC_MAX) {
            return `Short description may be at most ${SHORT_DESC_MAX} characters`;
        }
        return null;
    }, [title, content, shortDescription, selectedTopic, selectedTags]);

    const isFormValid = formError === null;

    const buildPayload = (): UpdatePostRequest => {
        const t = title.trim();
        const c = content.trim();
        const manualShort = shortDescription.trim();
        const short = manualShort || (c.length > SHORT_DESC_MAX ? c.slice(0, SHORT_DESC_MAX) : c);
        return {
            title: t,
            content: c,
            short_description: short,
            topic_id: selectedTopic,
            tags: selectedTags,
        };
    };

    const notify = (payload: BlogNoticePayload) => {
        onBlogNotify?.(payload);
    };

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async () => {
        if (!article?.id) return;
        if (!isFormValid) {
            notify({
                variant: 'error',
                title: 'Missing information',
                message: formError ?? 'Please check the form and try again.',
            });
            return;
        }

        try {
            await updateMutation.mutateAsync({ id: article.id, body: buildPayload() });
            handleClose();
            onSuccess?.();
            notify({
                variant: 'success',
                title: 'Post updated',
                message: 'Your changes have been saved.',
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Could not update your post';
            notify({ variant: 'error', title: 'Update failed', message: msg });
        }
    };

    if (!visible || !article) {
        return null;
    }

    const isSubmitting = updateMutation.isPending;

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleClose}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />

                <Animated.View
                    style={{
                        width: '90%',
                        maxHeight: '90%',
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        borderRadius: 20,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 20,
                        zIndex: 1000,
                        transform: [
                            {
                                scale: scaleAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1],
                                }),
                            },
                        ],
                        opacity: opacityAnim,
                    }}
                >
                    <View
                        className={`flex-row items-center justify-between px-5 py-4 border-b ${
                            isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                        <Text
                            className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        >
                            Edit blog post
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={{ zIndex: 2 }}
                            disabled={isSubmitting}
                        >
                            <X size={24} color={isDark ? '#E2E8F0' : '#1F2937'} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={{ padding: 16, gap: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {article.thumbnail ? (
                            <View>
                                <Text
                                    className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Current cover
                                </Text>
                                <Image
                                    source={{ uri: article.thumbnail }}
                                    style={{ width: '100%', height: 150, borderRadius: 10 }}
                                />
                            </View>
                        ) : null}

                        <View>
                            <Text
                                className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Title *
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter blog title..."
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                style={{
                                    borderWidth: 1,
                                    borderColor: isDark ? '#374151' : '#D1D5DB',
                                    borderRadius: 10,
                                    padding: 12,
                                    fontSize: 16,
                                    color: isDark ? '#F3F4F6' : '#1F2937',
                                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                                }}
                                editable={!isSubmitting}
                            />
                        </View>

                        <View>
                            <View className="flex-row items-center justify-between mb-2">
                                <Text
                                    className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Short description (optional)
                                </Text>
                                <Text
                                    className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                                >
                                    {shortDescription.length}/{SHORT_DESC_MAX}
                                </Text>
                            </View>
                            <TextInput
                                value={shortDescription}
                                onChangeText={(text) =>
                                    setShortDescription(
                                        text.length <= SHORT_DESC_MAX
                                            ? text
                                            : text.slice(0, SHORT_DESC_MAX),
                                    )
                                }
                                placeholder="Shown on cards..."
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                multiline
                                numberOfLines={3}
                                style={{
                                    borderWidth: 1,
                                    borderColor: isDark ? '#374151' : '#D1D5DB',
                                    borderRadius: 10,
                                    padding: 12,
                                    fontSize: 15,
                                    color: isDark ? '#F3F4F6' : '#1F2937',
                                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                                    textAlignVertical: 'top',
                                    minHeight: 72,
                                }}
                                editable={!isSubmitting}
                            />
                        </View>

                        <View>
                            <Text
                                className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Content *
                            </Text>
                            <TextInput
                                value={content}
                                onChangeText={setContent}
                                placeholder="Write your blog content here..."
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                multiline
                                numberOfLines={6}
                                style={{
                                    borderWidth: 1,
                                    borderColor: isDark ? '#374151' : '#D1D5DB',
                                    borderRadius: 10,
                                    padding: 12,
                                    fontSize: 16,
                                    color: isDark ? '#F3F4F6' : '#1F2937',
                                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                                    textAlignVertical: 'top',
                                }}
                                editable={!isSubmitting}
                            />
                        </View>

                        <View>
                            <Text
                                className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Topic *
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {BLOG_CREATE_TOPIC_OPTIONS.map((tab) => {
                                    const active = selectedTopic === tab.value;
                                    return (
                                        <TouchableOpacity
                                            key={tab.value}
                                            onPress={() => setSelectedTopic(tab.value)}
                                            disabled={isSubmitting}
                                            className={`rounded-full px-3 py-2 border ${
                                                active
                                                    ? 'bg-purple-600 border-purple-500'
                                                    : isDark
                                                      ? 'border-slate-600 bg-slate-800'
                                                      : 'border-gray-300 bg-white'
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-medium ${
                                                    active
                                                        ? 'text-white'
                                                        : isDark
                                                          ? 'text-gray-200'
                                                          : 'text-gray-800'
                                                }`}
                                            >
                                                {tab.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View>
                            <View className="flex-row items-center justify-between mb-2">
                                <Text
                                    className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Tags * (1–5)
                                </Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2 mb-3">
                                {selectedTags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag}
                                        onPress={() =>
                                            setSelectedTags(selectedTags.filter((t) => t !== tag))
                                        }
                                        disabled={isSubmitting}
                                        className="bg-purple-600 rounded-full px-3 py-1.5 flex-row items-center gap-1"
                                    >
                                        <Text className="text-white text-xs font-medium">
                                            {tag}
                                        </Text>
                                        <X size={12} color="white" strokeWidth={3} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {AVAILABLE_TAGS.filter((tag) => !selectedTags.includes(tag)).map(
                                    (tag) => (
                                        <TouchableOpacity
                                            key={tag}
                                            onPress={() => {
                                                if (selectedTags.length < 5) {
                                                    setSelectedTags([...selectedTags, tag]);
                                                }
                                            }}
                                            disabled={isSubmitting}
                                            className={`border rounded-full px-3 py-1.5 ${
                                                isDark
                                                    ? 'border-slate-600 bg-slate-700'
                                                    : 'border-gray-300 bg-gray-100'
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                            >
                                                + {tag}
                                            </Text>
                                        </TouchableOpacity>
                                    ),
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View className={`px-5 pt-2 pb-1 ${isDark ? 'bg-slate-900/30' : 'bg-gray-50'}`}>
                        {formError ? (
                            <Text
                                className={`text-xs text-center mb-2 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}
                            >
                                {formError}
                            </Text>
                        ) : null}
                    </View>
                    <View
                        className={`flex-row gap-3 px-5 py-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}
                    >
                        <TouchableOpacity
                            onPress={handleClose}
                            disabled={isSubmitting}
                            className={`flex-1 py-3 px-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}
                        >
                            <Text
                                className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                            className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
                                !isFormValid && !isSubmitting
                                    ? isDark
                                        ? 'bg-slate-600'
                                        : 'bg-gray-300'
                                    : 'bg-purple-600'
                            }`}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Save
                                        size={18}
                                        color={
                                            !isFormValid ? (isDark ? '#94A3B8' : '#4B5563') : '#fff'
                                        }
                                        strokeWidth={2}
                                    />
                                    <Text
                                        className={`text-center font-semibold ${
                                            !isFormValid
                                                ? isDark
                                                    ? 'text-slate-300'
                                                    : 'text-gray-600'
                                                : 'text-white'
                                        }`}
                                    >
                                        Save changes
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
