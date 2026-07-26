import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    Pressable,
    Dimensions,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { KeyboardAwareModalOverlay } from '@/shared/presentation/ui';
import type { BlogComment } from '@/features/blog/domain/entities/blog.type';

interface CommentsModalProps {
    visible: boolean;
    comments: BlogComment[];
    articleTitle: string;
    userAvatar: string;
    onClose: () => void;
    onSendComment?: (text: string, parentId?: string | null) => void | Promise<void>;
    onSendVoiceComment?: () => void;
    isLoading?: boolean;
    isSending?: boolean;
    currentUserId?: string | null;
    onUpdateComment?: (commentId: string, newText: string) => void | Promise<void>;
    onDeleteComment?: (commentId: string) => void | Promise<void>;
    allowVoice?: boolean;
}

export const CommentsModal = memo(
    function CommentsMemo(props: CommentsModalProps) {
        return <CommentModalContent {...props} />;
    },
    (prevProps, nextProps) => {
        return (
            prevProps.visible === nextProps.visible &&
            prevProps.comments === nextProps.comments &&
            prevProps.isLoading === nextProps.isLoading &&
            prevProps.isSending === nextProps.isSending &&
            prevProps.articleTitle === nextProps.articleTitle &&
            prevProps.userAvatar === nextProps.userAvatar
        );
    },
);

function CommentModalContent({
    visible,
    comments,
    articleTitle,
    userAvatar,
    onClose,
    onSendComment,
    onSendVoiceComment,
    isLoading,
    isSending,
    currentUserId,
    onUpdateComment,
    onDeleteComment,
    allowVoice = false,
}: CommentsModalProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get('window').height;

    // Bình luận đang được trả lời (chỉ trả lời được bình luận CHA/gốc → tối đa 2 tầng).
    const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

    // Gom bình luận thành 2 tầng: mỗi bình luận gốc kèm danh sách trả lời ngay bên dưới.
    // Mọi trả lời (kể cả dữ liệu cũ lồng sâu hơn) đều được kéo về đúng bình luận gốc của nó.
    const commentRows = useMemo(() => {
        const byId = new Map(comments.map((c) => [c.id, c]));
        const rootIdOf = (c: BlogComment): string => {
            let cur = c;
            let guard = 0;
            while (cur.parentId && byId.has(cur.parentId) && guard < 10) {
                cur = byId.get(cur.parentId) as BlogComment;
                guard += 1;
            }
            return cur.id;
        };
        const repliesByRoot = new Map<string, BlogComment[]>();
        const roots: BlogComment[] = [];
        for (const c of comments) {
            if (c.parentId && byId.has(c.parentId)) {
                const rootId = rootIdOf(c);
                if (rootId !== c.id) {
                    const arr = repliesByRoot.get(rootId) ?? [];
                    arr.push(c);
                    repliesByRoot.set(rootId, arr);
                    continue;
                }
            }
            roots.push(c);
        }
        const rows: { comment: BlogComment; isReply: boolean }[] = [];
        for (const root of roots) {
            rows.push({ comment: root, isReply: false });
            for (const reply of repliesByRoot.get(root.id) ?? []) {
                rows.push({ comment: reply, isReply: true });
            }
        }
        return rows;
    }, [comments]);

    const handleSendText = useCallback(
        (text: string) => {
            void onSendComment?.(text, replyingTo?.id ?? null);
            setReplyingTo(null);
        },
        [onSendComment, replyingTo],
    );
    // Bottom sheet chiếm full chiều ngang, cao TỐI ĐA ~80% (dùng maxHeight + flex chứ KHÔNG cố
    // định height): khi bàn phím mở, KeyboardAvoidingView chèn đệm đáy → vùng chứa co lại → sheet
    // TỰ co theo (thay vì bị đẩy nguyên khối lên tràn khỏi mép trên, để lộ khoảng trắng).
    const modalHeight = screenHeight * 0.8;

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
            setReplyingTo(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
            <KeyboardAwareModalOverlay>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    {/* Overlay pressable */}
                    <Pressable
                        onPress={onClose}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />

                    {/* Bottom-sheet container (trượt lên từ đáy) */}
                    <Animated.View
                        style={{
                            width: '100%',
                            flex: 1,
                            maxHeight: modalHeight,
                            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 12,
                            elevation: 15,
                            zIndex: 1000,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transform: [
                                {
                                    translateY: scaleAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [modalHeight, 0],
                                    }),
                                },
                            ],
                            opacity: opacityAnim,
                        }}
                    >
                        {/* Header */}
                        <View
                            className={`flex-row items-center justify-between px-4 py-4 border-b ${
                                isDark ? 'border-slate-800' : 'border-gray-200'
                            }`}
                        >
                            <View className="flex-1">
                                <Text
                                    className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                                >
                                    Bình luận
                                </Text>
                                <Text
                                    className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                    numberOfLines={1}
                                >
                                    Thảo luận: {articleTitle}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="p-2"
                                style={{ zIndex: 2 }}
                            >
                                <X
                                    size={20}
                                    color={isDark ? '#E2E8F0' : '#1F2937'}
                                    strokeWidth={2}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Comments list */}
                        {isLoading ? (
                            <View className="flex-1 items-center justify-center py-12">
                                <ActivityIndicator
                                    size="large"
                                    color={isDark ? '#A78BFA' : '#7C3AED'}
                                />
                            </View>
                        ) : (
                            <FlatList
                                style={{ flex: 1 }}
                                data={commentRows}
                                extraData={
                                    commentRows.length +
                                    (currentUserId ?? '') +
                                    (replyingTo?.id ?? '')
                                }
                                renderItem={({ item: row }) => (
                                    <View
                                        style={
                                            row.isReply
                                                ? {
                                                      paddingLeft: 40,
                                                      borderLeftWidth: 2,
                                                      borderLeftColor: isDark
                                                          ? '#334155'
                                                          : '#E5E7EB',
                                                      marginLeft: 20,
                                                  }
                                                : undefined
                                        }
                                    >
                                        <CommentItem
                                            comment={row.comment}
                                            isReply={row.isReply}
                                            isOwn={Boolean(
                                                currentUserId &&
                                                row.comment.author.id === String(currentUserId),
                                            )}
                                            onReplyPress={() =>
                                                setReplyingTo({
                                                    id: row.comment.id,
                                                    name: row.comment.author.name,
                                                })
                                            }
                                            onDelete={onDeleteComment}
                                            onUpdate={onUpdateComment}
                                        />
                                    </View>
                                )}
                                keyExtractor={(row) => row.comment.id}
                                contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
                                scrollEnabled={true}
                                removeClippedSubviews={true}
                                maxToRenderPerBatch={8}
                                updateCellsBatchingPeriod={30}
                                initialNumToRender={3}
                                scrollEventThrottle={32}
                                decelerationRate="fast"
                                ListEmptyComponent={
                                    <View className="flex-1 items-center justify-center py-8">
                                        <Text
                                            className={`text-sm ${
                                                isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}
                                        >
                                            Chưa có bình luận. Hãy là người đầu tiên chia sẻ.
                                        </Text>
                                    </View>
                                }
                            />
                        )}

                        {/* Chừa chỗ cho thanh điều hướng dưới cùng (edge-to-edge) để ô nhập không
                            bị nav bar che khi bàn phím đóng. */}
                        <View style={{ paddingBottom: insets.bottom }}>
                            {replyingTo ? (
                                <View
                                    className={`flex-row items-center justify-between px-4 py-2 border-t ${
                                        isDark
                                            ? 'border-slate-800 bg-slate-800/50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <Text
                                        className={`flex-1 text-xs ${
                                            isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                        numberOfLines={1}
                                    >
                                        Đang trả lời{' '}
                                        <Text className="font-semibold">{replyingTo.name}</Text>
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setReplyingTo(null)}
                                        hitSlop={8}
                                    >
                                        <X size={16} color={isDark ? '#94A3B8' : '#6B7280'} />
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                            <CommentInput
                                userAvatar={userAvatar}
                                onSendText={handleSendText}
                                onSendVoice={allowVoice ? onSendVoiceComment : undefined}
                                disabled={isSending}
                            />
                        </View>
                    </Animated.View>
                </View>
            </KeyboardAwareModalOverlay>
        </Modal>
    );
}
