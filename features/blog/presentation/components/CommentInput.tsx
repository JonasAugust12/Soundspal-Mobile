import React, { useState, useCallback, useEffect } from 'react';
import { defaultCommentAvatarPng } from './CommentItem';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { Mic, Play } from 'lucide-react-native';

interface CommentInputProps {
    userAvatar: string;
    onSendText?: (text: string) => void;
    onSendVoice?: () => void;
    disabled?: boolean;
}

export function CommentInput({ userAvatar, onSendText, onSendVoice, disabled }: CommentInputProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [text, setText] = useState('');
    const [avatarUri, setAvatarUri] = useState(
        userAvatar?.trim() ? userAvatar : defaultCommentAvatarPng({ id: 'me', name: 'me' }),
    );

    useEffect(() => {
        const t = userAvatar?.trim();
        setAvatarUri(t || defaultCommentAvatarPng({ id: 'me', name: 'me' }));
    }, [userAvatar]);

    const onAvatarError = useCallback(() => {
        setAvatarUri(defaultCommentAvatarPng({ id: 'me', name: 'me' }));
    }, []);

    const handleSendText = () => {
        if (disabled) return;
        if (text.trim()) {
            onSendText?.(text);
            setText('');
        }
    };

    const handleMicPress = () => {
        onSendVoice?.();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-row items-center gap-3 p-4 border-t ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}
        >
            {/* User avatar */}
            <Image
                source={{ uri: avatarUri }}
                style={{ width: 32, height: 32, borderRadius: 16 }}
                onError={onAvatarError}
            />

            {/* Input field */}
            <View
                className={`flex-1 flex-row items-center px-4 py-2 rounded-full border ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'
                }`}
            >
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Write a comment or tap mic..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                    className={`flex-1 py-2 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                    multiline={false}
                    editable={!disabled}
                />

                {onSendVoice ? (
                    <TouchableOpacity
                        onPress={handleMicPress}
                        className="ml-2"
                        activeOpacity={0.7}
                        disabled={disabled}
                    >
                        <Mic size={18} color="#9CA3AF" strokeWidth={2} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Send button */}
            {text.trim() && !disabled && (
                <TouchableOpacity
                    onPress={handleSendText}
                    className="w-12 h-12 rounded-full bg-purple-600 items-center justify-center"
                    activeOpacity={0.8}
                >
                    <Play size={20} color="white" fill="white" />
                </TouchableOpacity>
            )}
        </KeyboardAvoidingView>
    );
}
