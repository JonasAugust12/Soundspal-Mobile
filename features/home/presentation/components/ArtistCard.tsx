import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { MapPin, Mic2, Disc2, Building2 } from 'lucide-react-native';
import type { UserRole } from '@/features/explore/domain/entities/search.type';
import { cardShadow } from '@/shared/presentation/ui/shadows';

export type ArtistItem = {
    id: string;
    /** Dùng để điều hướng sang trang cá nhân (route nhận username, không phải id). */
    username?: string;
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

/** Số genre hiển thị tối đa; phần dư gom vào một chip "+N". */
const MAX_VISIBLE_SKILLS = 3;

export const ArtistCard = React.memo(function ArtistCard({ item, width = 170, onPress }: Props) {
    const getRoleBadge = () => {
        switch (item.role) {
            case 'singer':
                return {
                    icon: Mic2,
                    text: 'Singer',
                    className: 'bg-purple-100',
                    textColor: 'text-purple-600',
                    iconColor: '#7C3AED',
                };
            case 'producer':
                return {
                    icon: Disc2,
                    text: 'Producer',
                    className: 'bg-blue-100',
                    textColor: 'text-blue-600',
                    iconColor: '#2563EB',
                };
            case 'venue':
                return {
                    icon: Building2,
                    text: 'Venue',
                    className: 'bg-red-100',
                    textColor: 'text-red-600',
                    iconColor: '#DC2626',
                };
            default:
                return null;
        }
    };

    const roleBadge = getRoleBadge();

    const allSkills = item.skills
        .split('/')
        .map((skill) => skill.trim())
        .filter(Boolean);
    const visibleSkills = allSkills.slice(0, MAX_VISIBLE_SKILLS);
    const hiddenSkillCount = allSkills.length - visibleSkills.length;

    return (
        <View style={[styles.cardWrapper, { width }]}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.92}
                className="rounded-[20px] bg-white border border-gray-200 overflow-hidden"
            >
                {/* Artist Image */}
                <View className="w-full h-[140px] relative">
                    <Image source={item.image} className="w-full h-full" resizeMode="cover" />

                    {/* Role Badge on Image */}
                    {roleBadge && (
                        <View
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

                    <Text className="text-xs text-gray-600 text-center mb-1" numberOfLines={1}>
                        {item.description}
                    </Text>

                    <View className="gap-2 items-center">
                        {/* Location */}
                        <View className="flex-row items-center gap-1.5">
                            <MapPin size={12} color="#7C3BED" />
                            <Text className="text-xs text-gray-600 font-medium" numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>

                        {/* Skills Badges - Professional style */}
                        <View
                            style={styles.skillsRow}
                            className="flex-row flex-wrap justify-center gap-1"
                        >
                            {visibleSkills.map((skill) => (
                                <View
                                    key={skill}
                                    className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full"
                                >
                                    <Text className="text-[10px] font-semibold text-purple-700">
                                        {skill}
                                    </Text>
                                </View>
                            ))}
                            {hiddenSkillCount > 0 && (
                                <View className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                    <Text className="text-[10px] font-semibold text-gray-500">
                                        +{hiddenSkillCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
});

// Keep only shadow styles that NativeWind doesn't handle well
const styles = StyleSheet.create({
    cardWrapper: {
        ...cardShadow,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    /**
     * Chốt cứng chỗ cho đúng 2 hàng chip. Số genre mỗi nghệ sĩ chênh nhau rất nhiều
     * (có người 12, có người 3) nên để khối này tự co giãn thì các thẻ trong carousel
     * cao thấp lệch nhau. Mọi dòng khác đã numberOfLines={1}, nên cố định khối này là
     * đủ để mọi thẻ bằng nhau.
     */
    skillsRow: {
        height: 44,
        alignContent: 'center',
        overflow: 'hidden',
    },
});
