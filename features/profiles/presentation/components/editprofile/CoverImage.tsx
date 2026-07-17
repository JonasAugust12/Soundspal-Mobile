import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'lucide-react-native';

interface CoverImageProps {
    coverUri?: string;
    editable?: boolean;
    onPickCover?: () => void;
}

export function CoverImage({ coverUri, editable, onPickCover }: CoverImageProps) {
    return (
        <View className="h-44 w-full relative">
            <Image
                source={coverUri ? { uri: coverUri } : require('@/assets/images/background.png')}
                className="w-full h-full absolute"
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Edit Button */}
            {editable && (
                <Pressable
                    onPress={onPickCover}
                    className="absolute top-3 right-3 flex-row items-center gap-1.5 px-3 py-1.5 bg-black/50 rounded-full"
                >
                    <Camera size={14} color="#ffffff" />
                </Pressable>
            )}
        </View>
    );
}
