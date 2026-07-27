import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_SAFE_AREA_EDGES, LoadingOverlay } from '@/shared/presentation/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
    UserSquare,
    QrCode,
    Cloud,
    BriefcaseBusiness,
    Shield,
    Lock,
    Mail,
    LogOut,
    ChevronRight,
    Settings,
    BadgeCheck,
    Crown,
    MicVocal,
    Disc2,
    Building2,
    Music2,
    Bookmark,
    Handshake,
    CalendarDays,
} from 'lucide-react-native';
import { useLogout } from '@/features/auth/presentation/hooks/useAuthApi';
import { useGetCurrentUser } from '@/features/profiles/presentation/hooks/useUserApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { PremiumBadge } from '@/shared/presentation/ui';
import { getPremiumState } from '@/shared/domain/utils/premium';
import { useRouter } from 'expo-router';
import {
    MenuItem,
    GlassCard,
    GradientIcon,
} from '@/features/profiles/presentation/components/profile';
import {
    AUTH_ERROR_CONTEXT_FALLBACKS,
    AuthErrorContext,
} from '@/features/auth/domain/constants/authApiErrorCode';
import {
    AUTH_COMMON,
    AuthLoadingLabel,
    AuthSuccessToast,
    AuthToastTitle,
} from '@/features/auth/domain/constants/authMessages';

type RoleAccent = {
    gradient: readonly [string, string];
    /** Màu đặc để làm chữ tag trên nền pill trắng. */
    hex: string;
    Icon: React.ElementType;
    label: string;
};

const ROLE_ACCENT: Record<string, RoleAccent> = {
    singer: { gradient: ['#7C3BED', '#9333EA'], hex: '#7C3BED', Icon: MicVocal, label: 'Ca sĩ' },
    producer: {
        gradient: ['#2563EB', '#3B82F6'],
        hex: '#2563EB',
        Icon: Disc2,
        label: 'Nhà sản xuất',
    },
    venue: {
        gradient: ['#DC2626', '#EF4444'],
        hex: '#DC2626',
        Icon: Building2,
        label: 'Nhà tuyển dụng',
    },
};

const DEFAULT_ACCENT: RoleAccent = {
    gradient: ['#6B7280', '#9CA3AF'],
    hex: '#6B7280',
    Icon: Music2,
    label: 'Người dùng',
};

/**
 * Copy của mục Premium theo từng trạng thái gói — bám sát thẻ "Gói của tôi" bên web
 * (/billing): chưa mua → mời nâng cấp, còn hạn → nhắc hạn, hết hạn → cảnh báo mất
 * quyền lợi và mời gia hạn.
 */
function getPremiumMenuCopy(state: 'none' | 'active' | 'expired', expiresAt: string | null) {
    if (state === 'active') {
        return {
            title: 'Premium đang hoạt động',
            subtitle: expiresAt
                ? `Có hiệu lực đến ${expiresAt} — huy hiệu và ưu tiên hiển thị đang bật`
                : 'Huy hiệu và ưu tiên hiển thị đang bật',
        };
    }

    if (state === 'expired') {
        return {
            title: 'Premium đã hết hạn',
            subtitle: expiresAt
                ? `Hết hạn ngày ${expiresAt} — gia hạn để bật lại huy hiệu và ưu tiên hiển thị`
                : 'Gia hạn để bật lại huy hiệu và ưu tiên hiển thị',
        };
    }

    return {
        title: 'Nâng cấp Premium',
        subtitle: 'Nhận huy hiệu Premium và luôn xuất hiện ở đầu trang Khám phá',
    };
}

function formatDate(value?: string | null): string | null {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function PersonalScreen() {
    const { mutateAsync: logoutApi, isPending: isLoggingOut } = useLogout();
    const { user } = useAuthStore();
    const { data: currentUser } = useGetCurrentUser();
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const [coverFailed, setCoverFailed] = useState(false);
    // Trạng thái Premium đọc từ is_premium + premium_expired_at (nguồn chuẩn, giống web);
    // chỉ fallback về `tier` khi backend chưa trả 2 field mới.
    const currentTier = String(currentUser?.tier || user?.tier || 'free').toLowerCase();
    const premiumState =
        currentUser?.is_premium !== undefined
            ? getPremiumState(currentUser)
            : currentTier === 'premium'
              ? 'active'
              : 'none';
    const isPremium = premiumState === 'active';
    const premiumExpiresAt = formatDate(
        currentUser?.premium_expired_at || currentUser?.subscription_expires_at || null,
    );
    const premiumMenuCopy = getPremiumMenuCopy(premiumState, premiumExpiresAt);

    const accent = ROLE_ACCENT[user?.role ?? ''] ?? DEFAULT_ACCENT;
    const RoleIcon = accent.Icon;
    const avatarUrl = currentUser?.avatar_url || user?.avatar_url;
    const coverUrl = currentUser?.cover_url?.trim();
    const showCover = !!coverUrl && !coverFailed;

    const handleLogout = async () => {
        // useLogout (onSettled) đã tự xóa session + cache dù API thành công hay lỗi.
        // Điều hướng về màn đăng nhập do useProtectedRoute lo → chỉ 1 lần, tránh vào login 2 lần.
        try {
            await logoutApi();
            showSuccess(AuthSuccessToast.LogoutTitle, AuthSuccessToast.LogoutBody);
        } catch {
            showError(AuthToastTitle.Error, AUTH_ERROR_CONTEXT_FALLBACKS[AuthErrorContext.Logout]);
        }
    };

    const handleEditProfile = () => {
        if (user?.role === 'venue') {
            router.push('/(editprofile)/venueEditProfile');
        } else {
            router.push('/(editprofile)/editProfile');
        }
    };

    const handleViewProfile = () => {
        if (user?.role === 'singer' || user?.role === 'producer') {
            router.push({
                pathname: '/(profiles)/artistProfile',
                params: { username: user.username },
            });
        } else if (user?.role === 'venue') {
            router.push({
                pathname: '/(profiles)/venueProfile',
                params: { username: user.username },
            });
        }
    };

    const handleManageCollaborations = () => {
        router.push('/(profiles)/collaboration');
    };

    const handleCollabRequests = () => {
        router.push({
            pathname: '/(profiles)/collab-requests',
            params: { tab: 'manage' },
        });
    };

    const handleCollabCalendar = () => {
        router.push({
            pathname: '/(profiles)/collab-requests',
            params: { tab: 'calendar' },
        });
    };

    const handlePremiumPayment = () => {
        router.push('/(payments)/premium' as `${string}`);
    };

    const handleSavedChallenges = () => {
        router.push('/(challenge)/myContent?tab=saved' as `${string}`);
    };

    const handleMyChallenges = () => {
        router.push('/(challenge)/myContent' as `${string}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={SCREEN_SAFE_AREA_EDGES}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
                    <Text className="text-2xl font-black text-gray-900">Cá nhân</Text>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white items-center justify-center"
                        style={styles.iconButton}
                    >
                        <Settings size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Premium Profile Card */}
                <TouchableOpacity
                    onPress={handleViewProfile}
                    activeOpacity={0.9}
                    style={styles.profileCard}
                    className="mx-5 rounded-3xl overflow-hidden"
                >
                    {/* Nền: ảnh bìa nếu đã cập nhật, phủ lớp kính để chữ rõ; chưa có thì gradient theo role. */}
                    {showCover ? (
                        <>
                            <Image
                                source={{ uri: coverUrl }}
                                onError={() => setCoverFailed(true)}
                                style={StyleSheet.absoluteFill}
                                resizeMode="cover"
                            />
                            {/* Lớp kính mờ trên ảnh bìa. */}
                            <BlurView
                                intensity={Platform.OS === 'ios' ? 22 : 30}
                                tint="dark"
                                style={StyleSheet.absoluteFill}
                            />
                            {/* Scrim tối + ám màu role để chữ trắng luôn đọc rõ (kể cả Android không blur thật). */}
                            <LinearGradient
                                colors={[`${accent.hex}59`, 'rgba(0,0,0,0.55)']}
                                start={{ x: 1, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </>
                    ) : (
                        <LinearGradient
                            colors={accent.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        >
                            {/* Background Pattern */}
                            <View className="absolute top-0 right-0 opacity-20">
                                <View
                                    className="w-40 h-40 rounded-full bg-white"
                                    style={{ marginTop: -60, marginRight: -60 }}
                                />
                            </View>
                        </LinearGradient>
                    )}

                    <View className="flex-row items-center gap-4 p-5">
                        {/* Avatar */}
                        <View className="relative">
                            <Image
                                source={
                                    avatarUrl
                                        ? { uri: avatarUrl }
                                        : require('@/assets/images/user_profile.png')
                                }
                                className="w-20 h-20 rounded-2xl"
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                            {user?.is_verified && (
                                <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                    <BadgeCheck size={18} color="white" fill={accent.hex} />
                                </View>
                            )}
                        </View>

                        {/* User Info */}
                        <View className="flex-1">
                            {/* Tên + tag highlight trên cùng một hàng */}
                            <View className="flex-row items-center gap-2">
                                <Text
                                    className="text-xl font-bold text-white shrink"
                                    numberOfLines={1}
                                >
                                    {user?.display_name || 'Tên người dùng'}
                                </Text>
                                <View
                                    className="flex-row items-center gap-1 bg-white px-2.5 py-1 rounded-full shrink-0"
                                    style={styles.roleTag}
                                >
                                    <RoleIcon size={12} color={accent.hex} strokeWidth={2.5} />
                                    <Text
                                        className="text-xs font-bold"
                                        style={{ color: accent.hex }}
                                        numberOfLines={1}
                                    >
                                        {accent.label}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-2 mt-1">
                                <Text className="text-white/80 text-sm shrink" numberOfLines={1}>
                                    @{user?.username || 'username'}
                                </Text>
                                {isPremium && <PremiumBadge size="sm" />}
                            </View>
                        </View>

                        {/* Arrow */}
                        <View className="w-8 h-8 rounded-full bg-white/25 items-center justify-center">
                            <ChevronRight size={18} color="#FFFFFF" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Quick Actions */}
                <View className="flex-row gap-3 mx-5 mt-4">
                    <GlassCard
                        onPress={handleEditProfile}
                        className="flex-1 py-4 items-center gap-2"
                    >
                        <GradientIcon Icon={UserSquare} size={24} box={48} />
                        <Text className="text-sm font-semibold text-gray-800">Chỉnh sửa</Text>
                    </GlassCard>

                    <GlassCard
                        onPress={() => router.push('/(profiles)/mediaGallery')}
                        className="flex-1 py-4 items-center gap-2"
                    >
                        <GradientIcon Icon={Cloud} size={24} box={48} />
                        <Text className="text-sm font-semibold text-gray-800">Media</Text>
                    </GlassCard>

                    <GlassCard
                        onPress={() => console.warn('QR Share')}
                        className="flex-1 py-4 items-center gap-2"
                    >
                        <GradientIcon Icon={QrCode} size={24} box={48} />
                        <Text className="text-sm font-semibold text-gray-800">QR Code</Text>
                    </GlassCard>
                </View>

                {/* Menu Section - Premium */}
                <View className="mx-5 mt-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        Premium
                    </Text>
                    <GlassCard>
                        <MenuItem
                            icon={<GradientIcon Icon={Crown} />}
                            title={premiumMenuCopy.title}
                            subtitle={premiumMenuCopy.subtitle}
                            onPress={handlePremiumPayment}
                        />
                    </GlassCard>
                </View>

                {/* Menu Section - Thử thách */}
                <View className="mx-5 mt-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        Thử thách
                    </Text>
                    <GlassCard>
                        <MenuItem
                            icon={<GradientIcon Icon={Bookmark} />}
                            title="Thử thách đã lưu"
                            subtitle="Xem lại các beat bạn đã lưu"
                            onPress={handleSavedChallenges}
                        />
                        <View className="h-px bg-black/5 mx-4" />
                        <MenuItem
                            icon={<GradientIcon Icon={Music2} />}
                            title="Beat & bài dự thi của tôi"
                            subtitle="Quản lý beat đã đăng và bài dự thi"
                            onPress={handleMyChallenges}
                        />
                    </GlassCard>
                </View>

                {/* Menu Section - Collaboration */}
                <View className="mx-5 mt-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        Công việc
                    </Text>
                    <GlassCard>
                        <MenuItem
                            icon={<GradientIcon Icon={BriefcaseBusiness} />}
                            title="Quản lý hợp tác"
                            subtitle="Ứng tuyển & tin đăng của bạn"
                            onPress={handleManageCollaborations}
                        />
                        <View className="h-px bg-black/5 mx-4" />
                        <MenuItem
                            icon={<GradientIcon Icon={Handshake} />}
                            title="Đề nghị hợp tác"
                            subtitle="Gửi / nhận đề nghị 1-1"
                            onPress={handleCollabRequests}
                        />
                        <View className="h-px bg-black/5 mx-4" />
                        <MenuItem
                            icon={<GradientIcon Icon={CalendarDays} />}
                            title="Lịch hợp tác"
                            subtitle="Các hợp tác đã được chấp nhận"
                            onPress={handleCollabCalendar}
                        />
                    </GlassCard>
                </View>

                {/* Menu Section - Settings */}
                <View className="mx-5 mt-4">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        Cài đặt
                    </Text>
                    <GlassCard>
                        <MenuItem
                            icon={<GradientIcon Icon={Mail} />}
                            title="Đổi email"
                            subtitle={user?.email}
                            onPress={() =>
                                router.push('/(editprofile)/change-email' as `${string}`)
                            }
                        />
                        <View className="h-px bg-black/5 mx-4" />
                        <MenuItem
                            icon={<GradientIcon Icon={Shield} />}
                            title="Tài khoản và bảo mật"
                            onPress={() => console.warn('Account Security')}
                        />
                        <View className="h-px bg-black/5 mx-4" />
                        <MenuItem
                            icon={<GradientIcon Icon={Lock} />}
                            title="Quyền riêng tư"
                            onPress={() => console.warn('Privacy')}
                        />
                    </GlassCard>
                </View>

                {/* Logout Button */}
                <View className="mx-5 mt-6 mb-4">
                    <TouchableOpacity
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        className="bg-red-50 rounded-2xl p-4 flex-row items-center justify-center gap-2"
                        style={styles.logoutButton}
                    >
                        <LogOut size={20} color="#DC2626" />
                        <Text className="text-red-600 font-bold text-base">
                            {isLoggingOut ? AuthLoadingLabel.LoggingOut : AUTH_COMMON.logout}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <View className="items-center pb-8">
                    <Text className="text-xs text-gray-400">Soundspal v1.0.0</Text>
                </View>

                {/* Bottom Spacing */}
                <View className="h-20" />
            </ScrollView>

            {/* Loading khi đang đăng xuất */}
            <LoadingOverlay visible={isLoggingOut} message="Đang đăng xuất..." />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    profileCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    avatar: {
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    roleTag: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    logoutButton: {
        ...Platform.select({
            ios: {
                shadowColor: '#DC2626',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
