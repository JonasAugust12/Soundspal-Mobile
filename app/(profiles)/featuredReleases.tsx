import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    FlatList,
    TextInput,
    ActivityIndicator,
    Modal,
    TouchableOpacity,
    Platform,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, X, Music4 } from 'lucide-react-native';

import { YoutubeEmbed } from '@/components/profile';
import {
    useGetCurrentUser,
    useGetUserByUsername,
    useUpdateFeaturedReleases,
} from '@/hooks/useUserApi';
import { useAuthStore } from '@/stores/authStore';

export default function FeaturedReleasesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();
    const { user: currentUser } = useAuthStore();

    const isMe = !params.username || params.username === currentUser?.username;

    const {
        data: currentUserData,
        isLoading: isLoadingCurrent,
        refetch,
    } = useGetCurrentUser({
        enabled: isMe,
    });
    const { data: otherUser, isLoading: isLoadingOther } = useGetUserByUsername(
        params.username || '',
        {
            enabled: !isMe,
        },
    );

    const updateFeaturedReleases = useUpdateFeaturedReleases();

    const userData = isMe ? currentUserData : otherUser;
    const isLoading = isMe ? isLoadingCurrent : isLoadingOther;
    const links = userData?.featured_release_links || [];

    const [showAddModal, setShowAddModal] = useState(false);
    const [newUrl, setNewUrl] = useState('');

    const handleAddLink = async () => {
        if (!newUrl.trim()) return;

        try {
            await updateFeaturedReleases.mutateAsync({
                featured_release_links: [...links, newUrl.trim()],
            });
            setNewUrl('');
            setShowAddModal(false);
            refetch();
        } catch (error) {
            console.error('Failed to add link:', error);
        }
    };

    const handleRemoveLink = async (index: number) => {
        try {
            const newLinks = links.filter((_, i) => i !== index);
            await updateFeaturedReleases.mutateAsync({
                featured_release_links: newLinks,
            });
            refetch();
        } catch (error) {
            console.error('Failed to remove link:', error);
        }
    };

    if (isLoading) {
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
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-border">
                <Pressable
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-muted"
                >
                    <ChevronLeft size={24} color="#09090b" />
                </Pressable>
                <Text className="text-lg font-bold text-foreground flex-1 ml-2">
                    Featured Releases
                </Text>
            </View>

            {/* Links List */}
            <FlatList
                data={links}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ padding: 16, gap: 16 }}
                ListHeaderComponent={
                    isMe ? (
                        <TouchableOpacity
                            onPress={() => setShowAddModal(true)}
                            className="flex-row items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 mb-2"
                            activeOpacity={0.7}
                        >
                            <Plus size={24} color="#7C3AED" />
                            <Text className="text-purple-600 font-semibold">Thêm YouTube link</Text>
                        </TouchableOpacity>
                    ) : null
                }
                renderItem={({ item, index }) => (
                    <View className="relative">
                        <YoutubeEmbed url={item} />
                        {isMe && (
                            <Pressable
                                onPress={() => handleRemoveLink(index)}
                                className="absolute top-2 right-2 p-2 bg-red-500/90 rounded-full active:bg-red-600"
                            >
                                <Trash2 size={14} color="#ffffff" />
                            </Pressable>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-16">
                        <View className="w-20 h-20 rounded-2xl bg-muted/50 items-center justify-center mb-4">
                            <Music4 size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-muted-foreground text-base font-medium">
                            Chưa có featured releases
                        </Text>
                        {isMe && (
                            <Text className="text-muted-foreground/70 text-sm mt-1">
                                Nhấn nút + để thêm link
                            </Text>
                        )}
                    </View>
                }
            />

            {/* Add Modal */}
            <Modal
                visible={showAddModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowAddModal(false)}
            >
                <View className="flex-1 bg-black/40 items-center justify-center px-6">
                    <View
                        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl overflow-hidden"
                        style={styles.modalContainer}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                Thêm YouTube Link
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowAddModal(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
                            >
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View className="px-5 py-5 gap-5">
                            <View className="gap-2">
                                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                    YouTube URL <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    value={newUrl}
                                    onChangeText={setNewUrl}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="px-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Actions */}
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setShowAddModal(false)}
                                    className="flex-1 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 items-center"
                                >
                                    <Text className="text-base font-bold text-gray-700 dark:text-gray-300">
                                        Hủy
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleAddLink}
                                    disabled={updateFeaturedReleases.isPending || !newUrl.trim()}
                                    className={`flex-1 py-3.5 rounded-xl bg-purple-600 items-center ${!newUrl.trim() || updateFeaturedReleases.isPending ? 'opacity-50' : ''}`}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-base font-bold text-white">
                                        {updateFeaturedReleases.isPending ? 'Đang thêm...' : 'Thêm'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            },
            android: {
                elevation: 12,
            },
        }),
    },
});
