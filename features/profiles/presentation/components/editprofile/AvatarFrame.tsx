import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { Camera } from 'lucide-react-native';

interface AvatarFrameProps {
    avatarUri?: string;
    roleIcon?: 'singer' | 'producer' | 'venue';
    editable?: boolean;
    onPickAvatar?: () => void;
}

const roleIcons = {
    singer: require('@/assets/images/Singer.png'),
    producer: require('@/assets/images/DJ.png'),
    venue: require('@/assets/images/Venue.png'),
};

export function AvatarFrame({
    avatarUri,
    roleIcon = 'singer',
    editable,
    onPickAvatar,
}: AvatarFrameProps) {
    return (
        <View className="relative">
            <View className="border-4 border-background rounded-2xl shadow-lg">
                <Image
                    source={
                        avatarUri ? { uri: avatarUri } : require('@/assets/images/user_profile.png')
                    }
                    className="w-28 h-28 rounded-xl"
                    resizeMode="cover"
                />
            </View>

            {/* Role Badge */}
            <Image
                source={roleIcons[roleIcon]}
                className="w-8 h-8 absolute -bottom-2 -right-2"
                resizeMode="contain"
            />

            {/* Edit Button */}
            {editable && (
                <Pressable
                    onPress={onPickAvatar}
                    className="absolute -bottom-1 -left-1 w-8 h-8 bg-primary rounded-full items-center justify-center shadow"
                >
                    <Camera size={16} color="#ffffff" />
                </Pressable>
            )}
        </View>
    );
}
