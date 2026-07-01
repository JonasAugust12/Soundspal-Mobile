import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useGetMyMedia } from '@/features/profiles/presentation/hooks/useMediaApi';
import type { Media } from '@/features/profiles/domain/entities/media.type';

interface MediaPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (media: Media) => void;
    selectedMediaId?: string;
}

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
    isSelected,
    onSelect,
}: {
    item: Media;
    isSelected: boolean;
    onSelect: () => void;
}) => {
    const isImage = item.mime_type.startsWith('image/');

    return (
        <TouchableOpacity
            onPress={onSelect}
            className={`rounded-lg overflow-hidden border-2 ${
                isSelected
                    ? 'border-purple-600 dark:border-purple-500'
                    : 'border-gray-200 dark:border-gray-700'
            }`}
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

            {/* Selected Badge */}
            {isSelected && (
                <View className="absolute top-1 right-1 bg-purple-600 rounded-full p-1">
                    <View className="w-4 h-4 bg-white rounded-full items-center justify-center">
                        <Text className="text-purple-600 font-bold text-xs">✓</Text>
                    </View>
                </View>
            )}

            {/* File Name Overlay */}
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                    {item.file_name}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export const MediaPicker = ({ visible, onClose, onSelect, selectedMediaId }: MediaPickerProps) => {
    const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(selectedMediaId);

    const {
        data: mediaData,
        isLoading,
        error,
    } = useGetMyMedia({
        enabled: visible,
    });

    const mediaList = useMemo(() => mediaData?.media || [], [mediaData]);

    const handleSelect = (media: Media) => {
        setLocalSelectedId(media.id);
    };

    const handleConfirm = () => {
        const selected = mediaList.find((m) => m.id === localSelectedId);
        if (!selected) {
            Alert.alert('Lỗi', 'Vui lòng chọn một file');
            return;
        }
        onSelect(selected);
        onClose();
    };

    const handleClear = () => {
        setLocalSelectedId(undefined);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/50">
                <View className="flex-1 bg-white dark:bg-gray-900 rounded-t-3xl mt-12">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">
                            Chọn phương tiện
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <X size={24} color="#7C3BED" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {isLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#7C3BED" />
                            <Text className="text-gray-600 dark:text-gray-400 mt-4">
                                Đang tải...
                            </Text>
                        </View>
                    ) : error || !mediaList || mediaList.length === 0 ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-gray-600 dark:text-gray-400 text-center px-4">
                                {error
                                    ? 'Không thể tải danh sách phương tiện'
                                    : 'Chưa có phương tiện nào. Vui lòng upload trước.'}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <ScrollView className="flex-1 px-4 py-4">
                                <View className="flex-row flex-wrap gap-3">
                                    {mediaList.map((media) => (
                                        <MediaCard
                                            key={media.id}
                                            item={media}
                                            isSelected={localSelectedId === media.id}
                                            onSelect={() => handleSelect(media)}
                                        />
                                    ))}
                                </View>
                            </ScrollView>

                            {/* Footer Actions */}
                            <View className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 gap-3">
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    disabled={!localSelectedId}
                                    className={`py-3 rounded-lg items-center ${
                                        localSelectedId
                                            ? 'bg-purple-600'
                                            : 'bg-gray-300 dark:bg-gray-700'
                                    }`}
                                >
                                    <Text className="text-white font-bold">Chọn</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleClear}
                                    className="py-3 rounded-lg items-center border-2 border-gray-300 dark:border-gray-700"
                                >
                                    <Text className="text-gray-700 dark:text-gray-300 font-bold">
                                        Hủy
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};
