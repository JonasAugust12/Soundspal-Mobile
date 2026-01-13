import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Phone, Share2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import {
    BasicInfoForm,
    ContactInfoForm,
    SocialLinksForm,
    AvatarFrame,
    CoverImage,
} from '@/components/editprofile';
import {
    useGetCurrentUser,
    useUpdateBasicInfo,
    useUpdateContactInfo,
    useUpdateSocialLinks,
    useUploadUserAvatar,
    useUploadUserCover,
} from '@/hooks/useUserApi';
import { useAuthStore } from '@/stores/authStore';

type TabKey = 'basic' | 'contact' | 'social';

interface Tab {
    key: TabKey;
    label: string;
}

const TABS: Tab[] = [
    { key: 'basic', label: 'Cơ bản' },
    { key: 'contact', label: 'Liên hệ' },
    { key: 'social', label: 'Mạng XH' },
];

const TabIcon = ({ tabKey, isActive }: { tabKey: TabKey; isActive: boolean }) => {
    switch (tabKey) {
        case 'basic':
            return <User size={18} className={isActive ? 'text-foreground' : 'text-muted-foreground'} />;
        case 'contact':
            return <Phone size={18} className={isActive ? 'text-foreground' : 'text-muted-foreground'} />;
        case 'social':
            return <Share2 size={18} className={isActive ? 'text-foreground' : 'text-muted-foreground'} />;
    }
};

export default function EditProfileScreen() {
    const router = useRouter();
    const { updateAvatarUrl, updateDisplayName } = useAuthStore();

    const [activeTab, setActiveTab] = useState<TabKey>('basic');
    const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();
    const [selectedCover, setSelectedCover] = useState<string | undefined>();


    // Queries
    const { data: userData, isLoading: isLoadingUser, refetch } = useGetCurrentUser();

    // Mutations
    const updateBasicInfo = useUpdateBasicInfo();
    const updateContactInfo = useUpdateContactInfo();
    const updateSocialLinks = useUpdateSocialLinks();
    const uploadAvatar = useUploadUserAvatar();
    const uploadCover = useUploadUserCover();

    // Load initial data
    useEffect(() => {
        if (userData) {
            setSelectedAvatar(userData.avatar_url);
            setSelectedCover(userData.cover_url);
        }
    }, [userData]);

    // Pick Avatar
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
                formData.append('file', {
                    uri,
                    type: 'image/jpeg',
                    name: 'avatar.jpg',
                } as any);

                const uploadResult = await uploadAvatar.mutateAsync(formData);
                updateAvatarUrl(uploadResult.file_url);
                Toast.show({ type: 'success', text1: 'Đã cập nhật ảnh đại diện' });
            } catch (error) {
                console.error('Upload avatar failed:', error);
                setSelectedAvatar(userData?.avatar_url);
                Toast.show({ type: 'error', text1: 'Không thể tải lên ảnh đại diện' });
            }
        }
    };

    // Pick Cover
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
                formData.append('file', {
                    uri,
                    type: 'image/jpeg',
                    name: 'cover.jpg',
                } as any);

                await uploadCover.mutateAsync(formData);
                Toast.show({ type: 'success', text1: 'Đã cập nhật ảnh bìa' });
            } catch (error) {
                console.error('Upload cover failed:', error);
                setSelectedCover(userData?.cover_url);
                Toast.show({ type: 'error', text1: 'Không thể tải lên ảnh bìa' });
            }
        }
    };

    // Form Submit Handlers
    const handleSaveBasicInfo = async (data: any) => {
        await updateBasicInfo.mutateAsync(data);
        if (data.display_name) {
            updateDisplayName(data.display_name);
        }
        Toast.show({ type: 'success', text1: 'Đã cập nhật thông tin cơ bản' });
        refetch();
    };

    const handleSaveContactInfo = async (data: any) => {
        await updateContactInfo.mutateAsync(data);
        Toast.show({ type: 'success', text1: 'Đã cập nhật thông tin liên hệ' });
        refetch();
    };

    const handleSaveSocialLinks = async (data: any) => {
        await updateSocialLinks.mutateAsync(data);
        Toast.show({ type: 'success', text1: 'Đã cập nhật liên kết mạng xã hội' });
        refetch();
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
                        colors={['#7C3BED']}
                    />
                }
            >
                {/* Header */}
                <View className="flex-row items-center p-4">
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800">
                        <ChevronLeft size={24} className="text-foreground" />
                    </Pressable>
                    <Text className="text-xl font-bold text-foreground ml-2">Chỉnh sửa hồ sơ</Text>
                </View>

                {/* Cover & Avatar */}
                <View className="relative mb-16">
                    <CoverImage
                        coverUri={selectedCover}
                        editable
                        onPickCover={pickCover}
                    />
                    <View className="absolute -bottom-14 left-0 right-0 items-center">
                        <AvatarFrame
                            avatarUri={selectedAvatar}
                            roleIcon={userData?.role?.toLowerCase() as 'singer' | 'producer' | 'venue'}
                            editable
                            onPickAvatar={pickAvatar}
                        />
                    </View>
                </View>

                {/* Tabs */}
                <View className="flex-row mx-4 mb-6 bg-secondary dark:bg-gray-800 rounded-xl p-1.5">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <Pressable
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                                    shadowColor: isActive ? '#000' : 'transparent',
                                    shadowOpacity: isActive ? 0.1 : 0,
                                    shadowRadius: isActive ? 4 : 0,
                                    elevation: isActive ? 2 : 0,
                                }}
                            >
                                <TabIcon tabKey={tab.key} isActive={isActive} />
                                <Text
                                    className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'
                                        }`}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Tab Content */}
                <View className="px-4 pb-8">
                    {activeTab === 'basic' && (
                        <BasicInfoForm
                            defaultValues={{
                                display_name: userData?.display_name,
                                brief_bio: userData?.brief_bio,
                                detail_bio: userData?.detail_bio,
                                city: userData?.city,
                                country: userData?.country,
                            }}
                            onSubmit={handleSaveBasicInfo}
                            isLoading={updateBasicInfo.isPending}
                        />
                    )}

                    {activeTab === 'contact' && (
                        <ContactInfoForm
                            defaultValues={{
                                email: userData?.email,
                                phone_number: userData?.phone_number,
                            }}
                            onSubmit={handleSaveContactInfo}
                            isLoading={updateContactInfo.isPending}
                        />
                    )}

                    {activeTab === 'social' && (
                        <SocialLinksForm
                            defaultValues={{
                                facebook_url: userData?.facebook_url,
                                instagram_url: userData?.instagram_url,
                                youtube_url: userData?.youtube_url,
                            }}
                            onSubmit={handleSaveSocialLinks}
                            isLoading={updateSocialLinks.isPending}
                        />
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
