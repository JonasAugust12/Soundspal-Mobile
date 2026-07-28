import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { showAppDialog, UploadProgress, type UploadKind } from '@/shared/presentation/ui';
import * as ImagePicker from 'expo-image-picker';
import { Upload, Trash2 } from 'lucide-react-native';
import {
    useGetMyMedia,
    useUploadMedia,
    useDeleteMedia,
} from '@/features/profiles/presentation/hooks/useMediaApi';
import type { Media } from '@/features/profiles/domain/entities/media.type';

const COLUMN_COUNT = 3;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / COLUMN_COUNT;

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
        return '🖼️';
    } else if (mimeType.startsWith('video/')) {
        return '🎬';
    } else if (mimeType.startsWith('audio/')) {
        return '🎵';
    }
    return '📄';
};

const MediaCard = ({
    item,
    onDelete,
    isDeleting,
}: {
    item: Media;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) => {
    const isImage = item.mime_type.startsWith('image/');

    return (
        <View
            className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative"
            style={{ width: CARD_WIDTH, height: CARD_WIDTH }}
        >
            {/* Media Preview */}
            {isImage ? (
                <Image
                    source={{ uri: item.file_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                    <Text className="text-4xl">{getFileIcon(item.mime_type)}</Text>
                </View>
            )}

            {/* File Name Overlay */}
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                    {item.file_name}
                </Text>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
                onPress={() => onDelete(item.id)}
                disabled={isDeleting}
                className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
            >
                {isDeleting ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Trash2 size={14} color="white" />
                )}
            </TouchableOpacity>
        </View>
    );
};

export const MediaUploadSection = () => {
    const [_selectedMediaId, _setSelectedMediaId] = useState<string | undefined>();
    const [pending, setPending] = useState<{ name: string; kind: UploadKind } | null>(null);

    const {
        data: mediaData,
        isLoading: mediaLoading,
        error: mediaError,
    } = useGetMyMedia({ enabled: true });
    const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
    const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

    const mediaList = mediaData?.media || [];

    const handlePickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: false,
            quality: 0.8,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        const isVideo = asset.type === 'video' || !!asset.mimeType?.startsWith('video/');

        // Ưu tiên mimeType thật của tệp; chỉ đoán khi picker không trả về, kẻo ảnh png/heic
        // hay video mov đều bị gắn nhầm nhãn jpeg/mp4.
        const mimeType = asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');
        const fileName = asset.fileName || `media.${isVideo ? 'mp4' : 'jpg'}`;

        const formData = new FormData();
        formData.append('file', {
            uri: asset.uri,
            type: mimeType,
            name: fileName,
        } as unknown as Blob);

        setPending({ name: fileName, kind: isVideo ? 'video' : 'image' });

        uploadMedia(formData, {
            onSuccess: () => {
                showAppDialog('Thành công', `Tải lên ${isVideo ? 'video' : 'ảnh'} thành công`);
            },
            onError: (error: unknown) => {
                const err = error as { message?: string };
                console.error('Upload media lỗi:', err);
                showAppDialog('Lỗi', err?.message || 'Không thể tải lên phương tiện');
            },
            onSettled: () => setPending(null),
        });
    };

    const handleDeleteMedia = (id: string) => {
        showAppDialog('Xác nhận', 'Bạn có chắc chắn muốn xóa phương tiện này?', [
            { text: 'Hủy' },
            {
                text: 'Xóa',
                onPress: () => {
                    deleteMedia(id);
                },
                style: 'destructive',
            },
        ]);
    };

    return (
        <View className="gap-4">
            {/* Header */}
            <View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    Tệp dùng khi ứng tuyển
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Kho riêng để đính kèm lúc nộp đơn — không hiển thị trên hồ sơ
                </Text>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
                onPress={handlePickMedia}
                disabled={isUploading}
                className="bg-purple-600 rounded-lg py-3 flex-row items-center justify-center gap-2"
                style={{ opacity: isUploading ? 0.5 : 1 }}
            >
                {isUploading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Upload size={20} color="white" />
                )}
                <Text className="text-white font-bold">
                    {isUploading ? 'Đang tải...' : 'Tải ảnh hoặc video'}
                </Text>
            </TouchableOpacity>

            <UploadProgress
                visible={isUploading}
                kind={pending?.kind ?? 'file'}
                fileName={pending?.name}
            />

            {/* Media Grid */}
            {mediaLoading ? (
                <View className="items-center justify-center py-8">
                    <ActivityIndicator size="large" color="#7C3BED" />
                    <Text className="text-gray-600 dark:text-gray-400 mt-2">Đang tải...</Text>
                </View>
            ) : mediaError ? (
                <View className="bg-red-50 dark:bg-red-900/20 rounded-lg py-8 px-4 items-center">
                    <Text className="text-red-600 dark:text-red-400 text-center font-semibold">
                        Lỗi tải phương tiện
                    </Text>
                    <Text className="text-red-500 dark:text-red-300 text-xs mt-1 text-center">
                        {mediaError?.message || 'Vui lòng thử lại sau'}
                    </Text>
                </View>
            ) : mediaList.length === 0 ? (
                <View className="bg-gray-50 dark:bg-gray-800 rounded-lg py-8 items-center">
                    <Text className="text-gray-600 dark:text-gray-400 text-center">
                        Chưa có phương tiện nào
                    </Text>
                </View>
            ) : (
                <View className="flex-row flex-wrap gap-3">
                    {mediaList.map((media) => (
                        <MediaCard
                            key={media.id}
                            item={media}
                            onDelete={handleDeleteMedia}
                            isDeleting={isDeleting}
                        />
                    ))}
                </View>
            )}

            {/* Media Count */}
            {mediaList.length > 0 && (
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Tổng: {mediaList.length} phương tiện
                </Text>
            )}
        </View>
    );
};
