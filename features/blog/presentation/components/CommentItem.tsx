import React, { memo, useState, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ThumbsUp, Pencil, Trash2 } from 'lucide-react-native';
import { VoicePlayer } from './VoicePlayer';
import type { BlogAuthor, BlogComment } from '@/features/blog/domain/entities/blog.type';

/** RN `Image` often fails on remote SVG; use PNG for generated faces. */
export function defaultCommentAvatarPng(author: Pick<BlogAuthor, 'id' | 'name'>): string {
    const seed = encodeURIComponent(author.id || author.name || 'user');
    return `https://api.dicebear.com/7.x/avataaars/png?size=128&seed=${seed}`;
}

function avatarUriForComment(author: BlogAuthor): string {
    const raw = (author.avatar && String(author.avatar).trim()) || '';
    if (raw) return raw;
    return defaultCommentAvatarPng(author);
}

interface CommentItemProps {
    comment: BlogComment;
    isOwn?: boolean;
    onReplyPress?: () => void;
    onLikePress?: () => void;
    onDelete?: (commentId: string) => void;
    onUpdate?: (commentId: string, newText: string) => void;
}

function CommentItemComponent({
    comment,
    isOwn,
    onReplyPress,
    onLikePress,
    onDelete,
    onUpdate,
}: CommentItemProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text ?? '');
    const [avatarUri, setAvatarUri] = useState(() => avatarUriForComment(comment.author));

    useEffect(() => {
        setAvatarUri(avatarUriForComment(comment.author));
    }, [comment.id, comment.author.id, comment.author.name, comment.author.avatar]);

    const onAvatarError = useCallback(() => {
        setAvatarUri(defaultCommentAvatarPng(comment.author));
    }, [comment.author]);

    const startEdit = useCallback(() => {
        setEditText(comment.text ?? '');
        setEditing(true);
    }, [comment.text]);

    const saveEdit = useCallback(() => {
        const t = editText.trim();
        if (!t) {
            return;
        }
        onUpdate?.(comment.id, t);
        setEditing(false);
    }, [comment.id, editText, onUpdate]);

    const confirmDelete = useCallback(() => {
        Alert.alert('Delete comment', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDelete?.(comment.id),
            },
        ]);
    }, [comment.id, onDelete]);

    return (
        <View className="flex-row gap-3 mb-6">
            <Image
                source={{ uri: avatarUri }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                onError={onAvatarError}
            />

            <View className="flex-1">
                <View className="flex-row items-baseline gap-2 mb-2 flex-wrap">
                    <Text
                        className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                        {comment.author.name}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {comment.timestamp}
                    </Text>
                </View>

                {comment.isVoiceMessage ? (
                    <View className="mb-3">
                        <VoicePlayer duration={comment.voiceDuration || 0} />
                    </View>
                ) : editing ? (
                    <View className="mb-3">
                        <TextInput
                            value={editText}
                            onChangeText={setEditText}
                            multiline
                            className={`text-base p-2 rounded-lg border ${
                                isDark
                                    ? 'text-gray-200 border-slate-600 bg-slate-800'
                                    : 'text-gray-800 border-gray-300 bg-white'
                            }`}
                        />
                        <View className="flex-row gap-2 mt-2">
                            <TouchableOpacity
                                onPress={saveEdit}
                                className="px-3 py-1.5 bg-purple-600 rounded-lg"
                            >
                                <Text className="text-white text-sm font-semibold">Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setEditing(false)}
                                className="px-3 py-1.5 rounded-lg border border-slate-500"
                            >
                                <Text
                                    className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <Text
                        className={`text-base leading-relaxed mb-3 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        {comment.text}
                    </Text>
                )}

                <View className="flex-row items-center gap-4 flex-wrap">
                    <TouchableOpacity
                        onPress={onLikePress}
                        className="flex-row items-center gap-1"
                        activeOpacity={0.7}
                    >
                        <ThumbsUp size={18} color="#7C3AED" fill="#7C3AED" strokeWidth={1.5} />
                        <Text className="text-purple-600 font-semibold text-sm">
                            {comment.likes}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onReplyPress}
                        className="flex-row items-center gap-1"
                        activeOpacity={0.7}
                    >
                        <Text
                            className={`font-semibold text-sm ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            Reply
                        </Text>
                    </TouchableOpacity>

                    {isOwn && !editing && !comment.isVoiceMessage ? (
                        <>
                            <TouchableOpacity
                                onPress={startEdit}
                                className="flex-row items-center gap-1"
                                hitSlop={8}
                            >
                                <Pencil size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                                <Text
                                    className={`text-sm ${
                                        isDark ? 'text-slate-400' : 'text-slate-600'
                                    }`}
                                >
                                    Edit
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmDelete}
                                className="flex-row items-center gap-1"
                                hitSlop={8}
                            >
                                <Trash2 size={16} color="#DC2626" />
                                <Text className="text-sm text-red-600">Delete</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

export const CommentItem = memo(CommentItemComponent, (prevProps, nextProps) => {
    return (
        prevProps.comment.id === nextProps.comment.id &&
        prevProps.comment.likes === nextProps.comment.likes &&
        prevProps.comment.text === nextProps.comment.text &&
        prevProps.comment.author?.avatar === nextProps.comment.author?.avatar &&
        prevProps.comment.author?.name === nextProps.comment.author?.name &&
        prevProps.isOwn === nextProps.isOwn
    );
});
