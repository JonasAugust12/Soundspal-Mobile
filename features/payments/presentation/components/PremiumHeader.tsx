import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Crown } from 'lucide-react-native';
import { premiumStyles } from './premiumStyles';

interface PremiumHeaderProps {
    onBack: () => void;
}

export function PremiumHeader({ onBack }: PremiumHeaderProps) {
    return (
        <View className="px-5 pt-2 pb-5 flex-row items-center justify-between">
            <TouchableOpacity
                onPress={onBack}
                className="w-10 h-10 rounded-full bg-white items-center justify-center"
                style={premiumStyles.iconButton}
            >
                <ArrowLeft size={21} color="#111827" />
            </TouchableOpacity>
            <View className="items-center">
                <Text className="text-lg font-black text-gray-900">Premium</Text>
                <Text className="text-xs text-gray-500">Thanh toán PayOS</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center">
                <Crown size={21} color="#D97706" />
            </View>
        </View>
    );
}
