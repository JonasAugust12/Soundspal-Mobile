import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface MenuItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
}

export function MenuItem({ icon, title, subtitle, onPress, showChevron = true }: MenuItemProps) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="active:bg-black/5">
            <View className="flex-row items-center px-4 py-3.5 gap-3">
                {/* Icon (tự quản kích thước, vd: GradientIcon) */}
                {icon}

                {/* Content */}
                <View className="flex-1 gap-0.5">
                    <Text className="text-base font-semibold text-gray-900">{title}</Text>
                    {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
                </View>

                {/* Chevron */}
                {showChevron && <ChevronRight size={20} color="#9CA3AF" />}
            </View>
        </TouchableOpacity>
    );
}
