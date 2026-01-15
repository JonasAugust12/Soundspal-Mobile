import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Building2, Phone, Clock, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import { AvatarFrame, CoverImage } from '@/components/editprofile';
import {
    useGetCurrentUser,
    useUpdateVenueBasic,
    useUpdateVenueContact,
    useUpdateVenueAdditional,
    useUploadUserAvatar,
    useUploadUserCover,
} from '@/hooks/useUserApi';
import { useAuthStore } from '@/stores/authStore';

type TabKey = 'basic' | 'contact' | 'additional';

const TABS = [
    { key: 'basic' as TabKey, label: 'Cơ bản', icon: Building2 },
    { key: 'contact' as TabKey, label: 'Liên hệ', icon: Phone },
    { key: 'additional' as TabKey, label: 'Hoạt động', icon: Clock },
];

const BUSINESS_TYPES = [
    'Quán Bar',
    'Pub',
    'Café',
    'Nhà hàng',
    'Club',
    'Sân khấu',
    'Phòng trà',
    'Khác',
];
const FACILITIES = [
    'WiFi',
    'Điều hòa',
    'Bãi đỗ xe',
    'Sân khấu',
    'Âm thanh',
    'Ánh sáng',
    'VIP Room',
    'Ngoài trời',
];

export default function VenueEditProfileScreen() {
    const router = useRouter();
    const { updateAvatarUrl, updateDisplayName } = useAuthStore();

    const [activeTab, setActiveTab] = useState<TabKey>('basic');
    const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();
    const [selectedCover, setSelectedCover] = useState<string | undefined>();

    // Form states
    const [displayName, setDisplayName] = useState('');
    const [briefBio, setBriefBio] = useState('');
    const [capacity, setCapacity] = useState('');
    const [businessTypes, setBusinessTypes] = useState<string[]>([]);

    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [detailedAddress, setDetailedAddress] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');

    const [openHour, setOpenHour] = useState('');
    const [rentPrice, setRentPrice] = useState('');
    const [facilities, setFacilities] = useState<string[]>([]);

    // Queries & Mutations
    const { data: userData, isLoading: isLoadingUser, refetch } = useGetCurrentUser();
    const updateBasic = useUpdateVenueBasic();
    const updateContact = useUpdateVenueContact();
    const updateAdditional = useUpdateVenueAdditional();
    const uploadAvatar = useUploadUserAvatar();
    const uploadCover = useUploadUserCover();

    // Load initial data
    useEffect(() => {
        if (userData) {
            setSelectedAvatar(userData.avatar_url);
            setSelectedCover(userData.cover_url);
            setDisplayName(userData.display_name || '');
            setBriefBio(userData.brief_bio || '');
            setEmail(userData.email || '');
            setPhoneNumber(userData.phone_number || '');
            setCity(userData.city || '');
            setCountry(userData.country || '');

            // Venue specific
            //eslint-disable-next-line
            const venueData = userData as any;
            setCapacity(venueData.capacity || '');
            setBusinessTypes(venueData.business_types || []);
            setDetailedAddress(venueData.detailed_address || '');
            setWebsiteUrl(venueData.website_url || '');
            setOpenHour(venueData.open_hour || '');
            setRentPrice(venueData.rent_price || '');
            setFacilities(venueData.convenient_facilities || []);
        }
    }, [userData]);

    const pickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 0.8,
            aspect: [1, 1],
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedAvatar(uri);
            try {
                const formData = new FormData();
                //eslint-disable-next-line
                formData.append('file', { uri, type: 'image/jpeg', name: 'avatar.jpg' } as any);
                const uploadResult = await uploadAvatar.mutateAsync(formData);
                updateAvatarUrl(uploadResult.file_url);
                Toast.show({ type: 'success', text1: 'Đã cập nhật ảnh đại diện' });
                //eslint-disable-next-line
            } catch (error) {
                setSelectedAvatar(userData?.avatar_url);
                Toast.show({ type: 'error', text1: 'Không thể tải lên ảnh đại diện' });
            }
        }
    };

    const pickCover = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 0.8,
            aspect: [16, 9],
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedCover(uri);
            try {
                const formData = new FormData();
                //eslint-disable-next-line
                formData.append('file', { uri, type: 'image/jpeg', name: 'cover.jpg' } as any);
                await uploadCover.mutateAsync(formData);
                Toast.show({ type: 'success', text1: 'Đã cập nhật ảnh bìa' });
                //eslint-disable-next-line
            } catch (error) {
                setSelectedCover(userData?.cover_url);
                Toast.show({ type: 'error', text1: 'Không thể tải lên ảnh bìa' });
            }
        }
    };

    const handleSaveBasic = async () => {
        try {
            await updateBasic.mutateAsync({
                display_name: displayName,
                brief_bio: briefBio,
                capacity,
                business_type: businessTypes,
            });
            updateDisplayName(displayName);
            Toast.show({ type: 'success', text1: 'Đã cập nhật thông tin cơ bản' });
            refetch();
            //eslint-disable-next-line
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Không thể cập nhật' });
        }
    };

    const handleSaveContact = async () => {
        try {
            await updateContact.mutateAsync({
                email,
                phone_number: phoneNumber,
                city,
                country,
                detailed_address: detailedAddress,
                website_url: websiteUrl,
            });
            Toast.show({ type: 'success', text1: 'Đã cập nhật thông tin liên hệ' });
            refetch();
            //eslint-disable-next-line
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Không thể cập nhật' });
        }
    };

    const handleSaveAdditional = async () => {
        try {
            await updateAdditional.mutateAsync({
                open_hour: openHour,
                rent_price: rentPrice,
                convenient_facilities: facilities,
            });
            Toast.show({ type: 'success', text1: 'Đã cập nhật thông tin hoạt động' });
            refetch();
            //eslint-disable-next-line
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Không thể cập nhật' });
        }
    };

    const toggleBusinessType = (type: string) => {
        setBusinessTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
        );
    };

    const toggleFacility = (facility: string) => {
        setFacilities((prev) =>
            prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility],
        );
    };

    if (isLoadingUser) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7C3BED" />
                </View>
            </SafeAreaView>
        );
    }

    const isLoading =
        updateBasic.isPending || updateContact.isPending || updateAdditional.isPending;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoadingUser}
                        onRefresh={refetch}
                        tintColor="#7C3BED"
                    />
                }
            >
                {/* Header */}
                <View className="flex-row items-center p-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="p-2 -ml-2 rounded-full active:bg-gray-100"
                    >
                        <ChevronLeft size={24} color="#09090b" />
                    </Pressable>
                    <Text className="text-xl font-bold text-foreground ml-2">
                        Chỉnh sửa địa điểm
                    </Text>
                </View>

                {/* Cover & Avatar */}
                <View className="relative mb-16">
                    <CoverImage coverUri={selectedCover} editable onPickCover={pickCover} />
                    <View className="absolute -bottom-14 left-0 right-0 items-center">
                        <AvatarFrame
                            avatarUri={selectedAvatar}
                            roleIcon="venue"
                            editable
                            onPickAvatar={pickAvatar}
                        />
                    </View>
                </View>

                {/* Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
                >
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const Icon = tab.icon;
                        return (
                            <Pressable
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full ${
                                    isActive
                                        ? 'bg-blue-600'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                <Icon size={16} color={isActive ? '#FFFFFF' : '#6B7280'} />
                                <Text
                                    className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Tab Content */}
                <View className="px-4 pb-8">
                    {activeTab === 'basic' && (
                        <View className="gap-5">
                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Tên địa điểm
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={displayName}
                                    onChangeText={setDisplayName}
                                    placeholder="Nhập tên địa điểm"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Mô tả ngắn
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={briefBio}
                                    onChangeText={setBriefBio}
                                    placeholder="Mô tả ngắn về địa điểm"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    style={{ minHeight: 80 }}
                                />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Sức chứa
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={capacity}
                                    onChangeText={setCapacity}
                                    placeholder="VD: 200-500 người"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View className="gap-2">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Loại hình kinh doanh
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {BUSINESS_TYPES.map((type) => {
                                        const isSelected = businessTypes.includes(type);
                                        return (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => toggleBusinessType(type)}
                                                className={`px-3 py-2 rounded-full ${
                                                    isSelected
                                                        ? 'bg-blue-600'
                                                        : 'bg-gray-100 dark:bg-gray-800'
                                                }`}
                                            >
                                                <Text
                                                    className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}
                                                >
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveBasic}
                                disabled={updateBasic.isPending}
                                className="py-4 rounded-xl bg-blue-600 items-center mt-2"
                            >
                                <Text className="text-white font-bold">
                                    {updateBasic.isPending ? 'Đang lưu...' : 'Lưu thông tin cơ bản'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {activeTab === 'contact' && (
                        <View className="gap-5">
                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Email
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="email@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Số điện thoại
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="0123 456 789"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View className="flex-row gap-3">
                                <View className="flex-1 gap-1.5">
                                    <Text className="text-sm font-semibold text-gray-500 ml-1">
                                        Thành phố
                                    </Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                        value={city}
                                        onChangeText={setCity}
                                        placeholder="TP. Hồ Chí Minh"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View className="flex-1 gap-1.5">
                                    <Text className="text-sm font-semibold text-gray-500 ml-1">
                                        Quốc gia
                                    </Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                        value={country}
                                        onChangeText={setCountry}
                                        placeholder="Việt Nam"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Địa chỉ chi tiết
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={detailedAddress}
                                    onChangeText={setDetailedAddress}
                                    placeholder="Số nhà, đường, phường/xã..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Website
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={websiteUrl}
                                    onChangeText={setWebsiteUrl}
                                    placeholder="https://..."
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="url"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveContact}
                                disabled={updateContact.isPending}
                                className="py-4 rounded-xl bg-blue-600 items-center mt-2"
                            >
                                <Text className="text-white font-bold">
                                    {updateContact.isPending
                                        ? 'Đang lưu...'
                                        : 'Lưu thông tin liên hệ'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {activeTab === 'additional' && (
                        <View className="gap-5">
                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Giờ mở cửa
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={openHour}
                                    onChangeText={setOpenHour}
                                    placeholder="VD: 18:00 - 02:00"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Giá thuê (tham khảo)
                                </Text>
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-foreground border border-gray-200 dark:border-gray-700"
                                    value={rentPrice}
                                    onChangeText={setRentPrice}
                                    placeholder="VD: 10.000.000 - 50.000.000 VND/buổi"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View className="gap-2">
                                <Text className="text-sm font-semibold text-gray-500 ml-1">
                                    Tiện ích
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {FACILITIES.map((facility) => {
                                        const isSelected = facilities.includes(facility);
                                        return (
                                            <TouchableOpacity
                                                key={facility}
                                                onPress={() => toggleFacility(facility)}
                                                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full ${
                                                    isSelected
                                                        ? 'bg-green-600'
                                                        : 'bg-gray-100 dark:bg-gray-800'
                                                }`}
                                            >
                                                {isSelected && <Check size={14} color="#FFFFFF" />}
                                                <Text
                                                    className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}
                                                >
                                                    {facility}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveAdditional}
                                disabled={updateAdditional.isPending}
                                className="py-4 rounded-xl bg-blue-600 items-center mt-2"
                            >
                                <Text className="text-white font-bold">
                                    {updateAdditional.isPending
                                        ? 'Đang lưu...'
                                        : 'Lưu thông tin hoạt động'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Loading overlay */}
            {(uploadAvatar.isPending || uploadCover.isPending) && (
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                    <View className="bg-background p-6 rounded-2xl items-center">
                        <ActivityIndicator size="large" color="#7C3BED" />
                        <Text className="text-foreground mt-3">Đang tải ảnh lên...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
