import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { MapPin, BadgeCheck, MicVocal, Disc2, Building2, Music2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { cardShadow } from '@/shared/presentation/ui/shadows';
import { Shimmer, PremiumBadge } from '@/shared/presentation/ui';
import { isPremiumActive } from '@/shared/domain/utils/premium';
import { getDefaultCoverUrl } from '@/features/explore/domain/constants/defaultCoverImages';
import type { UserProfile } from '@/features/explore/domain/entities/search.type';

type RoleConfig = {
    label: string;
    /** Màu đại diện — dùng cho ảnh bìa dự phòng, đổ bóng badge và sheen của kính. */
    color: string;
    /** Gradient nền cho badge, phối theo tông màu role. */
    gradient: readonly [string, string];
    Icon: React.ElementType;
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
    singer: { label: 'Ca sĩ', color: '#EC4899', gradient: ['#F472B6', '#DB2777'], Icon: MicVocal },
    producer: {
        label: 'Nhà sản xuất',
        color: '#3B82F6',
        gradient: ['#60A5FA', '#4F46E5'],
        Icon: Disc2,
    },
    venue: {
        label: 'Nhà tuyển dụng',
        color: '#F59E0B',
        gradient: ['#FBBF24', '#F97316'],
        Icon: Building2,
    },
};

const FALLBACK_ROLE_GRADIENT: readonly [string, string] = ['#A78BFA', '#7C3AED'];

/**
 * Android không blur thật: `experimentalBlurMethod` mặc định là 'none' nên BlurView chỉ là
 * một lớp bán trong suốt. Bật 'dimezisBlurView' sẽ blur thật nhưng expo cảnh báo tụt hiệu năng,
 * mà thẻ này nằm trong FlatList cuộn vô hạn. Vì vậy lớp kính sáng dựa vào scrim trắng bên dưới
 * để luôn ra dáng "frosted glass" và giữ chữ tối đọc rõ, không dựa vào độ mờ.
 */
const GLASS_INTENSITY = Platform.OS === 'ios' ? 70 : 90;

type Props = {
    item: UserProfile;
    onPress: (user: UserProfile) => void;
};

export const ExploreUserCard = React.memo(function ExploreUserCard({ item, onPress }: Props) {
    const [coverFailed, setCoverFailed] = useState(false);
    const [coverLoaded, setCoverLoaded] = useState(false);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const hasRemoteAvatar = !!item.avatar_url;

    const location = [item.city, item.country].filter(Boolean).join(', ') || 'Chưa cập nhật';
    const role: RoleConfig = ROLE_CONFIG[item.role] ?? {
        label: item.role,
        color: '#7C3AED',
        gradient: FALLBACK_ROLE_GRADIENT,
        Icon: Music2,
    };
    const RoleIcon = role.Icon;
    const isPremium = isPremiumActive(item);

    // Chưa có ảnh bìa thật thì mượn ảnh mock theo role; gradient chỉ dùng khi ảnh tải lỗi.
    const coverUrl =
        item.cover_url?.trim() || getDefaultCoverUrl(item.id || item.username, item.role);

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            style={styles.card}
            className="bg-gray-100 rounded-2xl overflow-hidden"
            activeOpacity={0.9}
        >
            {/* Ảnh bìa phủ toàn thẻ — nửa dưới nằm sau lớp kính, đó là thứ được làm mờ. */}
            <LinearGradient
                colors={[role.color, `${role.color}99`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            {!coverFailed && (
                <Image
                    source={{ uri: coverUrl }}
                    onLoadStart={() => setCoverLoaded(false)}
                    onLoad={() => setCoverLoaded(true)}
                    onError={() => setCoverFailed(true)}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
            )}
            {/* Skeleton khi ảnh bìa đang tải */}
            {!coverFailed && !coverLoaded && (
                <Shimmer
                    style={StyleSheet.absoluteFill}
                    baseColor="rgba(0,0,0,0.06)"
                    highlightColor="rgba(255,255,255,0.45)"
                />
            )}

            {/* Phần ảnh bìa để trần */}
            <View className="h-24" />

            {/* Lớp kính sáng chứa thông tin nghệ sĩ */}
            <BlurView intensity={GLASS_INTENSITY} tint="light" style={styles.glass}>
                {/* Scrim trắng tan dần ở mép trên: tránh vạch cứng nơi ảnh bìa gặp kính,
                    vẫn đủ trắng ở dưới để chữ tối đọc rõ kể cả khi Android không blur. */}
                <LinearGradient
                    colors={[
                        'rgba(255,255,255,0)',
                        'rgba(255,255,255,0.34)',
                        'rgba(255,255,255,0.60)',
                    ]}
                    locations={[0, 0.16, 1]}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
                {/* Sheen màu theo role — cho kính có tông "liquid" thay vì trắng phẳng. */}
                <LinearGradient
                    colors={[`${role.color}22`, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
                {/* Dải sáng bóng ở mép trên — ánh gloss mềm, tan dần nên không thành vạch. */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                    style={styles.glassGloss}
                    pointerEvents="none"
                />

                <View className="pt-10 px-4 pb-4">
                    <View className="flex-row items-center justify-between">
                        <View style={styles.nameCol}>
                            <View className="flex-row items-center gap-1.5">
                                <Text
                                    className="text-base font-bold text-gray-900 shrink"
                                    numberOfLines={1}
                                >
                                    {item.display_name}
                                </Text>
                                {isPremium && <PremiumBadge size="sm" showLabel={false} />}
                            </View>
                            <Text className="text-xs text-gray-600" numberOfLines={1}>
                                @{item.username}
                            </Text>
                        </View>
                        <LinearGradient
                            colors={role.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.roleBadge, { shadowColor: role.color }]}
                        >
                            <RoleIcon size={12} color="#FFFFFF" strokeWidth={2.4} />
                            <Text style={styles.roleBadgeText} numberOfLines={1}>
                                {role.label}
                            </Text>
                        </LinearGradient>
                    </View>

                    {item.brief_bio ? (
                        <Text className="text-sm text-gray-700 mt-2" numberOfLines={2}>
                            {item.brief_bio}
                        </Text>
                    ) : null}

                    <View className="flex-row items-center gap-1 mt-2">
                        <MapPin size={12} color="#6B7280" />
                        <Text className="text-xs text-gray-500" numberOfLines={1}>
                            {location}
                        </Text>
                    </View>
                </View>
            </BlurView>

            {/* Avatar đặt cuối cùng để nổi lên trên lớp kính. */}
            <View className="absolute top-16 left-4">
                <View style={styles.avatarContainer}>
                    <Image
                        source={
                            item.avatar_url
                                ? { uri: item.avatar_url }
                                : require('@/assets/images/user-default.jpg')
                        }
                        onLoadStart={() => setAvatarLoaded(false)}
                        onLoad={() => setAvatarLoaded(true)}
                        className="w-16 h-16 rounded-full"
                    />
                    {/* Skeleton khi avatar (remote) đang tải */}
                    {hasRemoteAvatar && !avatarLoaded && (
                        <Shimmer style={StyleSheet.absoluteFill} borderRadius={999} />
                    )}
                    {item.is_verified && (
                        <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                            <BadgeCheck size={16} color="white" fill="#7C3AED" />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: cardShadow,
    glass: {
        overflow: 'hidden',
    },
    glassGloss: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 28,
    },
    nameCol: {
        flex: 1,
        marginRight: 10,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        // Đổ bóng theo màu role để badge nổi hẳn khỏi lớp kính.
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    roleBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    avatarContainer: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        borderRadius: 999,
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
