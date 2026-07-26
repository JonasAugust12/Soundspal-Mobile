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
import { X, Image as ImageIcon, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import {
    createBlogPost,
    publishBlogPost,
    addBlogPostMedia,
    logBlogUploadFailure,
    useBlogTopics,
} from '@/features/blog/presentation/hooks/useBlogApi';
import { KeyboardAwareModalOverlay } from '@/shared/presentation/ui';
import type { CreatePostRequest } from '@/features/blog/domain/entities/blog.type';
import type { BlogNoticePayload } from './BlogSlidingNotice';

const TITLE_MIN_LEN = 3;
const CONTENT_MIN_LEN = 20;
const SHORT_DESC_MAX = 200;

function formatBlogFlowError(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_UPLOAD_AUTH_REFRESH') {
            return error.message;
        }
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
        }
        const data = error.response?.data as { message?: string; error?: string } | undefined;
        const serverMsg = data?.message ?? data?.error;
        if (typeof serverMsg === 'string' && serverMsg.trim()) {
            return serverMsg.trim();
        }
    }
    return error instanceof Error ? error.message : fallback;
}

interface CreateBlogModalProps {
    visible: boolean;
    onClose: () => void;
    /** After publish succeeds (e.g. refetch list) */
    onSuccess?: () => void;
    /** Top frosted banner for success / error */
    onBlogNotify?: (payload: BlogNoticePayload) => void;
}

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

export function CreateBlogModal({
    visible,
    onClose,
    onSuccess,
    onBlogNotify,
}: CreateBlogModalProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { data: topics = [], isLoading: topicsLoading } = useBlogTopics({ enabled: visible });

    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [content, setContent] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [draftPostId, setDraftPostId] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMediaWorking, setIsMediaWorking] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

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
            return `Tiêu đề cần ít nhất ${TITLE_MIN_LEN} ký tự`;
        }
        if (c.length < CONTENT_MIN_LEN) {
            return `Nội dung cần ít nhất ${CONTENT_MIN_LEN} ký tự`;
        }
        if (!selectedTopic) {
            return 'Chọn chủ đề cho bài viết';
        }
        if (selectedTags.length < 1) {
            return 'Chọn ít nhất một thẻ';
        }
        if (s.length > SHORT_DESC_MAX) {
            return `Mô tả ngắn tối đa ${SHORT_DESC_MAX} ký tự`;
        }
        return null;
    }, [title, content, shortDescription, selectedTopic, selectedTags]);

    const isFormValid = formError === null;

    const buildCreatePayload = (): CreatePostRequest => {
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

    const handlePickImage = async () => {
        if (!isFormValid) {
            notify({
                variant: 'error',
                title: 'Thiếu thông tin',
                message: formError ?? 'Điền đủ các trường bắt buộc trước khi thêm ảnh bìa.',
            });
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.9,
            });

            if (result.canceled || !result.assets[0]) return;

            const asset = result.assets[0];
            setIsMediaWorking(true);

            let postId = draftPostId;
            if (!postId) {
                const created = await createBlogPost(buildCreatePayload());
                postId = created.id;
                setDraftPostId(postId);
            }

            await addBlogPostMedia(postId, {
                uri: asset.uri,
                name: asset.fileName,
                mimeType: asset.mimeType,
            });
            setSelectedImage(asset.uri);
        } catch (error) {
            logBlogUploadFailure('CreateBlogModal.handlePickImage', error);
            const msg = formatBlogFlowError(error, 'Không thể thêm ảnh');
            notify({ variant: 'error', title: 'Không thêm được ảnh', message: msg });
        } finally {
            setIsMediaWorking(false);
        }
    };

    const handleSubmit = async () => {
        if (!isFormValid) {
            notify({
                variant: 'error',
                title: 'Thiếu thông tin',
                message: formError ?? 'Vui lòng kiểm tra lại biểu mẫu.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let postId = draftPostId;

            if (!postId) {
                const created = await createBlogPost(buildCreatePayload());
                postId = created.id;
                if (selectedImage) {
                    await addBlogPostMedia(postId, { uri: selectedImage, mimeType: 'image/jpeg' });
                }
            }

            if (!postId) {
                throw new Error('Không thể tạo bài viết');
            }

            await publishBlogPost(postId);
            resetForm();
            onClose();
            onSuccess?.();
            notify({
                variant: 'success',
                title: 'Đã đăng bài',
                message: 'Bài viết của bạn đã được đăng. Cảm ơn bạn đã chia sẻ!',
            });
        } catch (error) {
            logBlogUploadFailure('CreateBlogModal.handleSubmit', error);
            const msg = formatBlogFlowError(error, 'Không thể đăng bài');
            notify({ variant: 'error', title: 'Đăng bài thất bại', message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setShortDescription('');
        setContent('');
        setSelectedTopic('');
        setSelectedImage(null);
        setDraftPostId(null);
        setSelectedTags([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
            <KeyboardAwareModalOverlay>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    {/* Overlay */}
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

                    {/* Modal container */}
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
                        {/* Header */}
                        <View
                            className={`flex-row items-center justify-between px-5 py-4 border-b ${
                                isDark
                                    ? 'border-slate-700 bg-slate-800'
                                    : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                            <Text
                                className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                            >
                                Tạo bài viết
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={{ zIndex: 2 }}>
                                <X
                                    size={24}
                                    color={isDark ? '#E2E8F0' : '#1F2937'}
                                    strokeWidth={2}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView
                            contentContainerStyle={{ padding: 16, gap: 16 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Title input */}
                            <View>
                                <Text
                                    className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Tiêu đề *
                                </Text>
                                <TextInput
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Nhập tiêu đề bài viết..."
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
                                    editable={!isSubmitting && !isMediaWorking}
                                />
                                <Text
                                    className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                                >
                                    Tối thiểu {TITLE_MIN_LEN} ký tự
                                </Text>
                            </View>

                            {/* short_description; optional, falls back to start of body */}
                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text
                                        className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                    >
                                        Mô tả ngắn (không bắt buộc)
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
                                    placeholder="Hiển thị trên thẻ; để trống sẽ lấy phần đầu nội dung"
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
                                    editable={!isSubmitting && !isMediaWorking}
                                />
                            </View>

                            {/* Content input */}
                            <View>
                                <Text
                                    className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Nội dung *
                                </Text>
                                <TextInput
                                    value={content}
                                    onChangeText={setContent}
                                    placeholder="Viết nội dung bài viết ở đây..."
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
                                    editable={!isSubmitting && !isMediaWorking}
                                />
                                <Text
                                    className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                                >
                                    Tối thiểu {CONTENT_MIN_LEN} ký tự
                                </Text>
                            </View>

                            <View>
                                <Text
                                    className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Chủ đề *
                                </Text>
                                {topicsLoading && topics.length === 0 ? (
                                    <ActivityIndicator color={isDark ? '#A78BFA' : '#7C3AED'} />
                                ) : (
                                    <View className="flex-row flex-wrap gap-2">
                                        {topics.map((topic) => {
                                            const active = selectedTopic === topic.id;
                                            return (
                                                <TouchableOpacity
                                                    key={topic.id}
                                                    onPress={() => setSelectedTopic(topic.id)}
                                                    disabled={isSubmitting || isMediaWorking}
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
                                                        {topic.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text
                                        className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                    >
                                        Thẻ * (1–5)
                                    </Text>
                                </View>

                                {/* Show selected tags */}
                                <View className="flex-row flex-wrap gap-2 mb-3">
                                    {selectedTags.map((tag) => (
                                        <TouchableOpacity
                                            key={tag}
                                            onPress={() =>
                                                setSelectedTags(
                                                    selectedTags.filter((t) => t !== tag),
                                                )
                                            }
                                            className="bg-purple-600 rounded-full px-3 py-1.5 flex-row items-center gap-1"
                                        >
                                            <Text className="text-white text-xs font-medium">
                                                {tag}
                                            </Text>
                                            <X size={12} color="white" strokeWidth={3} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Show tag suggestions */}
                                <View className="flex-row flex-wrap gap-2">
                                    {AVAILABLE_TAGS.filter(
                                        (tag) => !selectedTags.includes(tag),
                                    ).map((tag) => (
                                        <TouchableOpacity
                                            key={tag}
                                            onPress={() => {
                                                if (selectedTags.length < 5) {
                                                    setSelectedTags([...selectedTags, tag]);
                                                }
                                            }}
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
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text
                                    className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Ảnh bìa (không bắt buộc)
                                </Text>
                                {!isFormValid ? (
                                    <Text
                                        className={`text-xs mb-2 ${isDark ? 'text-amber-400/90' : 'text-amber-700'}`}
                                    >
                                        Hoàn tất tiêu đề, nội dung, chủ đề và ít nhất một thẻ trước
                                        khi thêm ảnh bìa.
                                    </Text>
                                ) : null}
                                {selectedImage ? (
                                    <View className="relative">
                                        <Image
                                            source={{ uri: selectedImage }}
                                            style={{ width: '100%', height: 150, borderRadius: 10 }}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setSelectedImage(null)}
                                            className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5"
                                        >
                                            <X size={16} color="white" strokeWidth={3} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handlePickImage}
                                        disabled={isSubmitting || isMediaWorking || !isFormValid}
                                        className={`border-2 border-dashed rounded-10 py-6 items-center justify-center ${
                                            isDark ? 'border-slate-600' : 'border-gray-300'
                                        }`}
                                    >
                                        <ImageIcon
                                            size={32}
                                            color={isDark ? '#9CA3AF' : '#6B7280'}
                                        />
                                        <Text
                                            className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                        >
                                            Chạm để chọn ảnh
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>

                        {/* Footer buttons */}
                        <View
                            className={`px-5 pt-2 pb-1 ${isDark ? 'bg-slate-900/30' : 'bg-gray-50'}`}
                        >
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
                                disabled={isSubmitting || isMediaWorking}
                                className={`flex-1 py-3 px-4 rounded-lg ${
                                    isDark ? 'bg-slate-700' : 'bg-gray-200'
                                }`}
                            >
                                <Text
                                    className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                    Huỷ
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={!isFormValid || isSubmitting || isMediaWorking}
                                className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
                                    !isFormValid && !isSubmitting
                                        ? isDark
                                            ? 'bg-slate-600'
                                            : 'bg-gray-300'
                                        : 'bg-purple-600'
                                }`}
                            >
                                {isSubmitting || isMediaWorking ? (
                                    <ActivityIndicator
                                        color={!isFormValid && !isSubmitting ? '#9CA3AF' : '#fff'}
                                    />
                                ) : (
                                    <>
                                        <Plus
                                            size={18}
                                            color={
                                                !isFormValid
                                                    ? isDark
                                                        ? '#94A3B8'
                                                        : '#4B5563'
                                                    : '#fff'
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
                                            Đăng bài
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </KeyboardAwareModalOverlay>
        </Modal>
    );
}
