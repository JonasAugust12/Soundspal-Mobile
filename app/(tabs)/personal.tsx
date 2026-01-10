import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    UserSquare,
    QrCode,
    Cloud,
    BriefcaseBusiness,
    Shield,
    Lock,
    LogOut
} from 'lucide-react-native';
import { useLogout } from '@/hooks/useAuthApi';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';
import { MenuItem } from '@/components/profile';

export default function PersonalScreen() {
    const { mutateAsync: logoutApi, isPending: isLoggingOut } = useLogout();
    const { user, logout: clearAuthState } = useAuthStore();
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logoutApi();
            showSuccess('Đăng xuất thành công! 👋', 'Hẹn gặp lại bạn.');
            clearAuthState();
            router.replace('/(auth)/login');
        } catch (error: any) {
            // Even if API fails, still logout locally
            showError('Lỗi', 'Không thể đăng xuất từ server, nhưng đã xóa session local.');
            clearAuthState();
            router.replace('/(auth)/login');
        }
    };

    const handleEditProfile = () => {
        if (user?.role === 'singer' || user?.role === 'producer') {
            router.push('/(editprofile)/artistEditProfile');
        } else if (user?.role === 'venue') {
            router.push('/(editprofile)/venueEditProfile');
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
        router.push('/(profiles)/collabRequests');
    };

    // Get role icon based on user role
    const getRoleIcon = () => {
        switch (user?.role) {
            case 'singer':
                return require('@/assets/images/Singer.png');
            case 'producer':
                return require('@/assets/images/DJ.png');
            case 'venue':
                return require('@/assets/images/Venue.png');
            default:
                return require('@/assets/images/user_profile.png');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <TouchableOpacity
                    onPress={handleViewProfile}
                    activeOpacity={0.7}
                    className="bg-white dark:bg-gray-800 mx-4 mt-4 p-4 rounded-2xl active:scale-[0.98]"
                >
                    <View className="flex-row items-center gap-3">
                        {/* Avatar */}
                        <View className="relative">
                            <Image
                                source={
                                    user?.avatar_url
                                        ? { uri: user.avatar_url }
                                        : require('@/assets/images/user_profile.png')
                                }
                                className="w-16 h-16 rounded-full"
                                resizeMode="cover"
                            />
                        </View>

                        {/* User Info */}
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user?.display_name || 'Tên người dùng'}
                            </Text>
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                                Xem trang cá nhân
                            </Text>
                        </View>

                        {/* Role Icon */}
                        <Image
                            source={getRoleIcon()}
                            className="w-12 h-12"
                            resizeMode="cover"
                        />
                    </View>
                </TouchableOpacity>

                {/* Menu Section 1 */}
                <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg overflow-hidden">
                    <MenuItem
                        icon={<UserSquare size={20} color="#7C3BED" />}
                        title="Chỉnh sửa hồ sơ"
                        subtitle="Cập nhật thông tin cá nhân và chuyên môn"
                        onPress={handleEditProfile}
                    />
                    <MenuItem
                        icon={<QrCode size={20} color="#7C3BED" />}
                        title="QR chia sẻ hồ sơ"
                        subtitle="Chia sẻ hồ sơ TalentLink của bạn qua mã QR"
                        onPress={() => console.log('QR Share')}
                    />
                </View>

                {/* Menu Section 2 */}
                <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg overflow-hidden">
                    <MenuItem
                        icon={<Cloud size={20} color="#7C3BED" />}
                        title="Đa phương tiện"
                        subtitle="Lưu trữ và quản lý các tệp đa phương tiện của bạn"
                        onPress={() => router.push('/(profiles)/mediaGallery')}
                    />
                    <MenuItem
                        icon={<BriefcaseBusiness size={20} color="#7C3BED" />}
                        title="Quản lý hợp tác"
                        subtitle="Quản lý các dự án và hợp tác của bạn"
                        onPress={handleManageCollaborations}
                    />
                </View>

                {/* Menu Section 3 */}
                <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-lg overflow-hidden">
                    <MenuItem
                        icon={<Shield size={20} color="#7C3BED" />}
                        title="Tài khoản và bảo mật"
                        onPress={() => console.log('Account Security')}
                    />
                    <MenuItem
                        icon={<Lock size={20} color="#7C3BED" />}
                        title="Quyền riêng tư"
                        onPress={() => console.log('Privacy')}
                    />
                </View>

                {/* Logout Section */}
                <View className="bg-white dark:bg-gray-800 mx-4 mt-4 mb-4 rounded-lg overflow-hidden">
                    <MenuItem
                        icon={<LogOut size={20} color="#DC2626" />}
                        title="Đăng xuất"
                        showChevron={false}
                        onPress={handleLogout}
                    />
                </View>

                {/* Bottom Spacing */}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
