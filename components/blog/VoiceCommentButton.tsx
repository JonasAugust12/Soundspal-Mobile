import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

interface VoiceCommentButtonProps {
    onPress?: () => void;
}

export function VoiceCommentButton({ onPress }: VoiceCommentButtonProps) {
    return (
        <View
            style={{
                position: 'absolute',
                bottom: 24,
                right: 16,
                zIndex: 100,
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                className="bg-purple-600 rounded-full items-center justify-center"
                activeOpacity={0.8}
                style={{
                    width: 56,
                    height: 56,
                    shadowColor: '#9333EA',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <MessageCircle size={24} color="white" strokeWidth={2} fill="white" />
            </TouchableOpacity>
        </View>
    );
}
