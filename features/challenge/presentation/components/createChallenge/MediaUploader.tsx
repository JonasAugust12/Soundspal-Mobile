import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Music, Image as ImageIcon, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface MediaUploaderProps {
    type: 'audio' | 'image';
    onMediaSelect: (file: { uri: string; name: string; type: string }) => void;
    currentUri?: string | null;
    currentName?: string | null;
}

export function MediaUploader({
    type,
    onMediaSelect,
    currentUri,
    currentName,
}: MediaUploaderProps) {
    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            onMediaSelect({
                uri: result.assets[0].uri,
                name: 'cover.jpg',
                type: 'image/jpeg',
            });
        }
    };

    const handlePickAudio = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            onMediaSelect({
                uri: result.assets[0].uri,
                name: result.assets[0].name,
                type: result.assets[0].mimeType || 'audio/mpeg',
            });
        }
    };

    const isAudio = type === 'audio';

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={isAudio ? handlePickAudio : handlePickImage}
            className={`w-full rounded-3xl border-2 border-dashed ${currentUri ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'} p-6 items-center justify-center`}
        >
            {currentUri ? (
                <>
                    {isAudio ? (
                        <View className="items-center">
                            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-3">
                                <CheckCircle2 size={32} color="#7d3bed" />
                            </View>
                            <Text className="font-heading font-bold text-gray-900 mb-1">
                                {currentName || 'Audio Selected'}
                            </Text>
                            <Text className="text-xs text-primary font-body uppercase tracking-wider font-bold">
                                Chạm để đổi file
                            </Text>
                        </View>
                    ) : (
                        <View className="items-center w-full relative">
                            <Image
                                source={{ uri: currentUri }}
                                className="w-full aspect-square rounded-2xl mb-3"
                            />
                            <View className="absolute inset-0 bg-black/40 rounded-2xl items-center justify-center opacity-0 hover:opacity-100">
                                <Text className="text-white font-bold font-body uppercase">
                                    Đổi ảnh
                                </Text>
                            </View>
                        </View>
                    )}
                </>
            ) : (
                <View className="items-center py-4">
                    <View className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 items-center justify-center mb-4">
                        {isAudio ? (
                            <Music size={28} color="#6b7280" />
                        ) : (
                            <ImageIcon size={28} color="#6b7280" />
                        )}
                    </View>
                    <Text className="font-heading font-bold text-gray-900 mb-2">
                        {isAudio ? 'Tải lên Beat âm thanh' : 'Tải lên Ảnh bìa'}
                    </Text>
                    <Text className="text-gray-500 font-body text-xs text-center px-4">
                        {isAudio
                            ? 'Hỗ trợ MP3, WAV, M4A max 20MB'
                            : 'Tỉ lệ 1:1, hỗ trợ JPG, PNG max 5MB'}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
