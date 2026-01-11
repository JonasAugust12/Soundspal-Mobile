import React from 'react';
import { View, TextInput, Pressable, ViewStyle } from 'react-native';
import { Image as ImageIcon, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type MessageInputProps = {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    onSend?: () => void;
    onImagePick?: () => void;
    disabled?: boolean;
    style?: ViewStyle;
};

export function MessageInput({
    value,
    onChangeText,
    placeholder = 'Send Message',
    onSend,
    onImagePick,
    disabled,
    style,
}: MessageInputProps) {
    const canSend = !!value && value.trim().length > 0 && !disabled;

    return (
        <View className="flex-row items-center gap-2 px-4 py-2" style={style}>
            {/* Image picker button */}
            {onImagePick && (
                <Pressable onPress={onImagePick} disabled={disabled}>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-secondary">
                        <ImageIcon size={20} color="#7C3BED" />
                    </View>
                </Pressable>
            )}

            {/* Rounded input */}
            <View className="flex-1 rounded-full bg-secondary px-3.5 h-11 justify-center">
                <TextInput
                    className="flex-1 text-foreground"
                    placeholder={placeholder}
                    placeholderTextColor="#71717a"
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>

            {/* Gradient send button */}
            <Pressable onPress={onSend} disabled={!canSend} style={{ opacity: canSend ? 1 : 0.5 }}>
                <LinearGradient
                    colors={['#7C3BED', '#F471B7']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 9999,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ArrowRight size={18} color="#fff" />
                </LinearGradient>
            </Pressable>
        </View>
    );
}
