import React from 'react';
import { View, Image, Text } from 'react-native';

export function LogoHeader() {
    return (
        <View className="flex-row items-center gap-3">
            <Image
                source={require('@/assets/images/icon.png')}
                className="w-12 h-12"
                resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-purple-600 uppercase">Soundspal</Text>
        </View>
    );
}
