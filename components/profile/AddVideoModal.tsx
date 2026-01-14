import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { X, Upload, Image as ImageIcon, Video } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useUploadUserVideo } from '@/hooks/useUserApi';
import { useToast } from '@/hooks/useToast';

interface AddVideoModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddVideoModal({ visible, onClose, onSuccess }: AddVideoModalProps) {
    const { showSuccess, showError } = useToast();
    const uploadVideo = useUploadUserVideo();

    const [title, setTitle] = useState('');
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
    const [videoAsset, setVideoAsset] = useState<any>(null);
    const [thumbnailAsset, setThumbnailAsset] = useState<any>(null);

    const handlePickVideo = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setVideoUri(asset.uri);
                setVideoAsset(asset);
            }
        } catch {
            showError('Lỗi', 'Không thể chọn video');
        }
    };

    const handlePickThumbnail = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setThumbnailUri(asset.uri);
                setThumbnailAsset(asset);
            }
        } catch {
            showError('Lỗi', 'Không thể chọn ảnh thumbnail');
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            showError('Lỗi', 'Vui lòng nhập tiêu đề video');
            return;
        }

        if (!videoAsset) {
            showError('Lỗi', 'Vui lòng chọn video');
            return;
        }

        try {
            const formData = new FormData();

            // Add video file
            formData.append('file', {
                uri: videoAsset.uri,
                type: videoAsset.mimeType || 'video/mp4',
                name: videoAsset.fileName || 'video.mp4',
            } as any);

            // Add title
            formData.append('title', title.trim());

            // Add thumbnail if exists
            if (thumbnailAsset) {
                formData.append('thumbnail', {
                    uri: thumbnailAsset.uri,
                    type: thumbnailAsset.mimeType || 'image/jpeg',
                    name: thumbnailAsset.fileName || 'thumbnail.jpg',
                } as any);
            }

            await uploadVideo.mutateAsync(formData);
            showSuccess('Thành công', 'Đã thêm video vào thư viện');
            handleClose();
            onSuccess?.();
        } catch (error: any) {
            showError('Lỗi', error?.message || 'Không thể tải video lên');
        }
    };

    const handleClose = () => {
        setTitle('');
        setVideoUri(null);
        setThumbnailUri(null);
        setVideoAsset(null);
        setThumbnailAsset(null);
        onClose();
    };

    const isValid = title.trim() && videoAsset;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white dark:bg-gray-900 rounded-t-3xl h-[85%]" style={styles.sheet}>
                    {/* Handle */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <View>
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">Thêm video mới</Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Thêm video demo để giới thiệu tài năng
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleClose}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
                        >
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        className="flex-1 px-5"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 20 }}
                    >
                        {/* Title Input */}
                        <View className="gap-2 mb-5">
                            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                Tiêu đề video <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="VD: Cover bài hát yêu thích"
                                placeholderTextColor="#9CA3AF"
                                className="px-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                            />
                        </View>

                        {/* Video Picker */}
                        <View className="gap-2 mb-5">
                            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                Video <Text className="text-red-500">*</Text>
                            </Text>
                            {videoUri ? (
                                <View className="gap-3">
                                    <View className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden items-center justify-center border-2 border-purple-500">
                                        <Video size={48} color="#7C3AED" />
                                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">Video đã chọn</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={handlePickVideo}
                                        className="py-3 items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                                    >
                                        <Text className="text-sm font-semibold text-purple-600">Chọn video khác</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={handlePickVideo}
                                    className="py-10 items-center gap-3 border-2 border-dashed border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                                    activeOpacity={0.7}
                                >
                                    <Upload size={36} color="#7C3AED" />
                                    <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Nhấn để chọn video</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Thumbnail Picker */}
                        <View className="gap-2 mb-4">
                            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                Ảnh thumbnail (Tùy chọn)
                            </Text>
                            {thumbnailUri ? (
                                <View className="gap-3">
                                    <View className="aspect-video rounded-xl overflow-hidden border-2 border-purple-500">
                                        <Image
                                            source={{ uri: thumbnailUri }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={handlePickThumbnail}
                                        className="py-3 items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                                    >
                                        <Text className="text-sm font-semibold text-purple-600">Chọn ảnh khác</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={handlePickThumbnail}
                                    className="py-10 items-center gap-3 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                    activeOpacity={0.7}
                                >
                                    <ImageIcon size={36} color="#9CA3AF" />
                                    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">Nhấn để chọn ảnh</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.footer} className="flex-row gap-3 px-5 py-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <TouchableOpacity
                            onPress={handleClose}
                            disabled={uploadVideo.isPending}
                            className="flex-1 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 items-center"
                        >
                            <Text className="text-base font-bold text-gray-700 dark:text-gray-300">Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={uploadVideo.isPending || !isValid}
                            className={`flex-1 py-4 rounded-xl bg-purple-600 items-center ${(!isValid || uploadVideo.isPending) ? 'opacity-50' : ''}`}
                            activeOpacity={0.8}
                        >
                            <Text className="text-base font-bold text-white">
                                {uploadVideo.isPending ? 'Đang tải...' : 'Thêm video'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheet: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    footer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});
