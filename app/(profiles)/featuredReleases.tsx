import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, X } from 'lucide-react-native';

import { YoutubeEmbed } from '@/components/profile';
import { useGetCurrentUser, useGetUserByUsername, useUpdateFeaturedReleases } from '@/hooks/useUserApi';

export default function FeaturedReleasesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ username?: string }>();

    const isMe = !params.username;

    const { data: currentUser, isLoading: isLoadingCurrent, refetch } = useGetCurrentUser({
        enabled: isMe,
    });
    const { data: otherUser, isLoading: isLoadingOther } = useGetUserByUsername(params.username || '', {
        enabled: !isMe,
    });

    const updateFeaturedReleases = useUpdateFeaturedReleases();

    const userData = isMe ? currentUser : otherUser;
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
            <View className="flex-row items-center p-4 border-b border-border">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft size={24} color="#09090b" />
                </Pressable>
                <Text className="text-lg font-bold text-foreground flex-1 ml-2">Featured Releases</Text>
                {isMe && (
                    <Pressable onPress={() => setShowAddModal(true)} className="p-2 bg-primary rounded-full">
                        <Plus size={20} color="#ffffff" />
                    </Pressable>
                )}
            </View>

            {/* Links List */}
            <FlatList
                data={links}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ padding: 16, gap: 16 }}
                renderItem={({ item, index }) => (
                    <View className="relative">
                        <YoutubeEmbed url={item} />
                        {isMe && (
                            <Pressable
                                onPress={() => handleRemoveLink(index)}
                                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full"
                            >
                                <Trash2 size={16} color="#ffffff" />
                            </Pressable>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center p-20">
                        <Text className="text-muted-foreground">Chưa có featured releases</Text>
                    </View>
                }
            />

            {/* Add Modal */}
            {showAddModal && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center p-6">
                    <View className="w-full bg-background rounded-2xl p-4 gap-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-foreground">Thêm YouTube Link</Text>
                            <Pressable onPress={() => setShowAddModal(false)}>
                                <X size={24} color="#71717a" />
                            </Pressable>
                        </View>

                        <TextInput
                            value={newUrl}
                            onChangeText={setNewUrl}
                            placeholder="https://youtube.com/watch?v=..."
                            className="px-4 py-3 bg-secondary rounded-xl text-foreground"
                            placeholderTextColor="#71717a"
                            autoCapitalize="none"
                        />

                        <Pressable
                            onPress={handleAddLink}
                            disabled={updateFeaturedReleases.isPending}
                            className="py-3 bg-primary rounded-xl items-center"
                        >
                            <Text className="text-white font-semibold">
                                {updateFeaturedReleases.isPending ? 'Đang thêm...' : 'Thêm'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
