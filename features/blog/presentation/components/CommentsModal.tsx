import React, { useEffect, useRef, memo } from 'react';
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
    onSendComment?: (text: string) => void | Promise<void>;
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
    const screenHeight = Dimensions.get('window').height;
    // Bottom sheet chiếm full chiều ngang, cao ~80% — ô nhập nằm đáy nên bàn phím đẩy lên
    // vừa khít, không bị che (khác thiết kế card ở giữa cũ hay bị bàn phím che ô nhập).
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
                            height: modalHeight,
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
                                data={comments}
                                extraData={comments.length + (currentUserId ?? '')}
                                renderItem={({ item }) => (
                                    <CommentItem
                                        comment={item}
                                        isOwn={Boolean(
                                            currentUserId &&
                                            item.author.id === String(currentUserId),
                                        )}
                                        onReplyPress={() => {
                                            // Reply flow can be added later
                                        }}
                                        onLikePress={() => {
                                            // Like API not provided
                                        }}
                                        onDelete={onDeleteComment}
                                        onUpdate={onUpdateComment}
                                    />
                                )}
                                keyExtractor={(item) => item.id}
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

                        <CommentInput
                            userAvatar={userAvatar}
                            onSendText={onSendComment}
                            onSendVoice={allowVoice ? onSendVoiceComment : undefined}
                            disabled={isSending}
                        />
                    </Animated.View>
                </View>
            </KeyboardAwareModalOverlay>
        </Modal>
    );
}
