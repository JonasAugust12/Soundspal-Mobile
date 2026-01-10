import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, StyleSheet, Platform } from 'react-native';
import { MapPin, Mic2, Music2, Building2 } from 'lucide-react-native';
import type { UserRole } from '@/types/search.type';

export type ArtistItem = {
    id: string;
    name: string;
    description: string;
    location: string;
    skills: string;
    image: ImageSourcePropType;
    role?: UserRole;
};

type Props = {
    item: ArtistItem;
    width?: number;
    onPress?: () => void;
};

export const ArtistCard = React.memo(function ArtistCard({ item, width = 170, onPress }: Props) {
    // Get role badge config
    const getRoleBadge = () => {
        switch (item.role) {
            case 'SINGER':
                return { icon: Mic2, text: 'Singer', className: 'bg-purple-100', textColor: 'text-purple-600', iconColor: '#7C3AED' };
            case 'PRODUCER':
                return { icon: Music2, text: 'Producer', className: 'bg-blue-100', textColor: 'text-blue-600', iconColor: '#2563EB' };
            case 'VENUE':
                return { icon: Building2, text: 'Venue', className: 'bg-red-100', textColor: 'text-red-600', iconColor: '#DC2626' };
            default:
                return null;
        }
    };

    const roleBadge = getRoleBadge();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.92}
            style={[styles.shadow, { width }]}
            className="rounded-[20px] bg-white border border-gray-200 overflow-hidden"
        >
            {/* Artist Image */}
            <View className="w-full h-[140px] relative">
                <Image
                    source={item.image}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Role Badge on Image */}
                {roleBadge && (
                    <View
                        style={styles.roleBadgeShadow}
                        className={`absolute top-2 right-2 flex-row items-center gap-1 px-2 py-1 rounded-xl ${roleBadge.className}`}
                    >
                        <roleBadge.icon size={12} color={roleBadge.iconColor} />
                        <Text className={`text-[10px] font-bold ${roleBadge.textColor}`}>
                            {roleBadge.text}
                        </Text>
                    </View>
                )}
            </View>

            {/* Artist Info */}
            <View className="p-3 gap-1.5">
                <Text
                    className="text-base font-bold text-gray-900 text-center"
                    numberOfLines={1}
                >
                    {item.name}
                </Text>

                <Text
                    className="text-xs text-gray-600 text-center mb-1"
                    numberOfLines={1}
                >
                    {item.description}
                </Text>

                <View className="gap-2 items-center">
                    {/* Location */}
                    <View className="flex-row items-center gap-1.5">
                        <MapPin size={12} color="#7C3BED" />
                        <Text
                            className="text-xs text-gray-600 font-medium"
                            numberOfLines={1}
                        >
                            {item.location}
                        </Text>
                    </View>

                    {/* Skills Badge */}
                    <View className="bg-gray-100 px-2 py-1 rounded-lg">
                        <Text
                            className="text-xs font-bold text-purple-600"
                            numberOfLines={1}
                        >
                            {item.skills.split('/')[0]}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// Keep only shadow styles that NativeWind doesn't handle well
const styles = StyleSheet.create({
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    roleBadgeShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
});
