import React from 'react';
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
import { SCREEN_SAFE_AREA_EDGES } from '@/shared/presentation/ui';
import { LinearGradient } from 'expo-linear-gradient';
import {
    UserSquare,
    QrCode,
    Cloud,
    BriefcaseBusiness,
    Shield,
    Lock,
    LogOut,
    ChevronRight,
    Settings,
    BadgeCheck,
    Crown,
} from 'lucide-react-native';
import { useLogout } from '@/features/auth/presentation/hooks/useAuthApi';
import { useGetCurrentUser } from '@/features/profiles/presentation/hooks/useUserApi';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { useRouter } from 'expo-router';
import { MenuItem } from '@/features/profiles/presentation/components/profile';
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

export default function PersonalScreen() {
    const { mutateAsync: logoutApi, isPending: isLoggingOut } = useLogout();
    const { user, logout: clearAuthState } = useAuthStore();
    const { data: currentUser } = useGetCurrentUser();
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const currentTier = String(currentUser?.tier || user?.tier || 'free').toLowerCase();
    const isPremium = currentTier === 'premium';

    const handleLogout = async () => {
        try {
            await logoutApi();
            showSuccess(AuthSuccessToast.LogoutTitle, AuthSuccessToast.LogoutBody);
            clearAuthState();
            router.replace('/(auth)/login');
        } catch {
            showError(AuthToastTitle.Error, AUTH_ERROR_CONTEXT_FALLBACKS[AuthErrorContext.Logout]);
            clearAuthState();
            router.replace('/(auth)/login');
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

    const handlePremiumPayment = () => {
        router.push('/(payments)/premium' as `${string}`);
    };

    // Get role display text
    const getRoleDisplay = () => {
        switch (user?.role) {
            case 'singer':
                return 'Ca sĩ';
            case 'producer':
                return 'Nhà sản xuất';
            case 'venue':
                return 'Địa điểm';
            default:
                return 'Người dùng';
        }
    };

    // Get role color
    const getRoleColor = () => {
        switch (user?.role) {
            case 'singer':
                return ['#7C3BED', '#9333EA'];
            case 'producer':
                return ['#2563EB', '#3B82F6'];
            case 'venue':
                return ['#DC2626', '#EF4444'];
            default:
                return ['#6B7280', '#9CA3AF'];
        }
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
                    <LinearGradient
                        colors={getRoleColor() as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileGradient}
                    >
                        {/* Background Pattern */}
                        <View className="absolute top-0 right-0 opacity-20">
                            <View
                                className="w-40 h-40 rounded-full bg-white"
                                style={{ marginTop: -60, marginRight: -60 }}
                            />
                        </View>

                        <View className="flex-row items-center gap-4">
                            {/* Avatar */}
                            <View className="relative">
                                <Image
                                    source={
                                        user?.avatar_url
                                            ? { uri: user.avatar_url }
                                            : require('@/assets/images/user_profile.png')
                                    }
                                    className="w-20 h-20 rounded-2xl"
                                    style={styles.avatar}
                                    resizeMode="cover"
                                />
                                {user?.is_verified && (
                                    <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                        <BadgeCheck size={18} color="white" fill="#7C3BED" />
                                    </View>
                                )}
                            </View>

                            {/* User Info */}
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-white" numberOfLines={1}>
                                    {user?.display_name || 'Tên người dùng'}
                                </Text>
                                <Text className="text-white/70 text-sm mt-0.5">
                                    @{user?.username || 'username'}
                                </Text>
                                <View className="flex-row items-center gap-2 mt-2">
                                    <View className="bg-white/20 px-3 py-1 rounded-full">
                                        <Text className="text-white text-xs font-semibold">
                                            {getRoleDisplay()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Arrow */}
                            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                                <ChevronRight size={18} color="#FFFFFF" />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Quick Actions */}
                <View className="flex-row gap-3 mx-5 mt-4">
                    <TouchableOpacity
                        onPress={handleEditProfile}
                        className="flex-1 bg-white rounded-2xl p-4 items-center gap-2"
                        style={styles.quickAction}
                    >
                        <View className="w-12 h-12 rounded-xl bg-purple-50 items-center justify-center">
                            <UserSquare size={24} color="#7C3BED" />
                        </View>
                        <Text className="text-sm font-semibold text-gray-800">Chỉnh sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(profiles)/mediaGallery')}
                        className="flex-1 bg-white rounded-2xl p-4 items-center gap-2"
                        style={styles.quickAction}
                    >
                        <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center">
                            <Cloud size={24} color="#2563EB" />
                        </View>
                        <Text className="text-sm font-semibold text-gray-800">Media</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.warn('QR Share')}
                        className="flex-1 bg-white rounded-2xl p-4 items-center gap-2"
                        style={styles.quickAction}
                    >
                        <View className="w-12 h-12 rounded-xl bg-pink-50 items-center justify-center">
                            <QrCode size={24} color="#EC4899" />
                        </View>
                        <Text className="text-sm font-semibold text-gray-800">QR Code</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Section - Premium */}
                <View className="mx-5 mt-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        Premium
                    </Text>
                    <View
                        className="bg-white rounded-2xl overflow-hidden"
                        style={styles.menuSection}
                    >
                        <MenuItem
                            icon={<Crown size={20} color="#D97706" />}
                            title={isPremium ? 'Premium đang hoạt động' : 'Nâng cấp Premium'}
                            subtitle={
                                isPremium
                                    ? 'Gia hạn gói để tiếp tục dùng đầy đủ quyền lợi'
                                    : 'Mở khóa ứng tuyển không giới hạn và ưu tiên hiển thị'
                            }
                            onPress={handlePremiumPayment}
                        />
                    </View>
                </View>

                {/* Menu Section - Collaboration */}
                <View className="mx-5 mt-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        Công việc
                    </Text>
                    <View
                        className="bg-white rounded-2xl overflow-hidden"
                        style={styles.menuSection}
                    >
                        <MenuItem
                            icon={<BriefcaseBusiness size={20} color="#7C3BED" />}
                            title="Quản lý hợp tác"
                            subtitle="Xem các yêu cầu hợp tác"
                            onPress={handleManageCollaborations}
                        />
                    </View>
                </View>

                {/* Menu Section - Settings */}
                <View className="mx-5 mt-4">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        Cài đặt
                    </Text>
                    <View
                        className="bg-white rounded-2xl overflow-hidden"
                        style={styles.menuSection}
                    >
                        <MenuItem
                            icon={<Shield size={20} color="#10B981" />}
                            title="Tài khoản và bảo mật"
                            onPress={() => console.warn('Account Security')}
                        />
                        <View className="h-px bg-gray-100 mx-4" />
                        <MenuItem
                            icon={<Lock size={20} color="#F59E0B" />}
                            title="Quyền riêng tư"
                            onPress={() => console.warn('Privacy')}
                        />
                    </View>
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
    profileGradient: {
        padding: 20,
    },
    avatar: {
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    quickAction: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    menuSection: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
            },
            android: {
                elevation: 1,
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
