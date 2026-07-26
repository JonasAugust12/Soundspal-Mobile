import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MediaUploader } from './MediaUploader';
import { useGetAllGenres } from '@/features/profiles/presentation/hooks/useUserApi';
import { challengeApi } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { MAX_BEAT_GENRES, toggleSelectedGenre } from '@/features/challenge/domain/utils/challenge';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

export function CreateChallengeForm() {
    const router = useRouter();
    const { data: genreData, isLoading: isLoadingGenres } = useGetAllGenres();
    const genres = genreData?.genres || [];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [bpm, setBpm] = useState('120');
    const [keySig, setKeySig] = useState('C');
    // Nhiều thể loại (tối đa MAX_BEAT_GENRES) — gửi lặp field `genres` cho backend.
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    const handleToggleGenre = (name: string) => {
        setSelectedGenres((prev) => {
            const alreadySelected = prev.some((g) => g.toLowerCase() === name.toLowerCase());
            // Chặn vượt quá giới hạn khi thêm mới (bỏ chọn thì luôn cho phép).
            if (!alreadySelected && prev.length >= MAX_BEAT_GENRES) {
                Toast.show({
                    type: 'info',
                    text1: 'Đã đạt giới hạn',
                    text2: `Chỉ chọn tối đa ${MAX_BEAT_GENRES} thể loại.`,
                });
                return prev;
            }
            return toggleSelectedGenre(prev, name);
        });
    };

    const [audio, setAudio] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || selectedGenres.length === 0 || !audio) {
            Toast.show({
                type: 'error',
                text1: 'Thiếu thông tin',
                text2: 'Vui lòng điền đủ Tên Beat, Thể loại và File Âm thanh.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('bpm', bpm);
            formData.append('key_signature', keySig);
            // Lặp field `genres` cho từng thể loại (backend match OR) — xem swagger POST /beats.
            selectedGenres.forEach((g) => formData.append('genres', g));

            formData.append('audio', {
                uri: audio.uri,
                name: audio.name,
                type: audio.type,
            } as unknown as Blob);

            if (image) {
                formData.append('cover_image', {
                    uri: image.uri,
                    name: image.name,
                    type: image.type,
                } as unknown as Blob);
            }

            await challengeApi.createBeat(formData);

            Toast.show({
                type: 'success',
                text1: 'Tạo thử thách thành công',
                text2: 'Beat của bạn đã được đưa lên Cộng đồng.',
            });

            setTimeout(() => {
                router.back();
            }, 1500);
        } catch (error) {
            console.error('Submit error:', error);
            Toast.show({
                type: 'error',
                text1: 'Tạo thử thách thất bại',
                text2: 'Vui lòng kiểm tra lại kết nối mạng hoặc server.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="px-6 mb-10 pb-6">
            <View className="mb-6 w-full flex-row">
                <View className="flex-[0.4] pr-2">
                    <MediaUploader type="image" currentUri={image?.uri} onMediaSelect={setImage} />
                </View>
                <View className="flex-[0.6] pl-2">
                    <View className="mb-4">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 font-body">
                            Tên Thử Thách
                        </Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Vd: Cyberpunk Drift"
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 font-heading font-bold text-gray-900 border-l-4 border-l-primary"
                        />
                    </View>
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-body">
                                BPM
                            </Text>
                            <TextInput
                                value={bpm}
                                onChangeText={setBpm}
                                keyboardType="number-pad"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-body">
                                Khóa
                            </Text>
                            <TextInput
                                value={keySig}
                                onChangeText={setKeySig}
                                placeholder="Vd: Am"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-900"
                            />
                        </View>
                    </View>
                </View>
            </View>

            <View className="mb-6">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 font-body ml-1">
                    File Audio (Bắt buộc)
                </Text>
                <MediaUploader
                    type="audio"
                    currentUri={audio?.uri}
                    currentName={audio?.name}
                    onMediaSelect={setAudio}
                />
            </View>

            <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2 ml-1">
                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest font-body">
                        Thể loại (chọn nhiều)
                    </Text>
                    <Text className="text-[10px] font-bold text-gray-400 font-body">
                        {selectedGenres.length}/{MAX_BEAT_GENRES}
                    </Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="py-1 flex-row"
                >
                    {isLoadingGenres ? (
                        <ActivityIndicator color="#7d3bed" className="ml-4" />
                    ) : (
                        genres.map((genre) => {
                            const isSelected = selectedGenres.some(
                                (g) => g.toLowerCase() === genre.name.toLowerCase(),
                            );
                            return (
                                <TouchableOpacity
                                    key={genre.id}
                                    activeOpacity={0.7}
                                    onPress={() => handleToggleGenre(genre.name)}
                                    className={`px-5 py-2.5 rounded-full mr-3 border ${
                                        isSelected
                                            ? 'bg-primary/10 border-primary'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-bold font-body tracking-wide ${
                                            isSelected ? 'text-primary' : 'text-gray-600'
                                        }`}
                                    >
                                        {genre.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            </View>

            <View className="mb-8">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 font-body ml-1">
                    Mô tả thêm
                </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholder="Giới thiệu về cảm hứng, nguồn gốc hoặc mẹo cho người thu âm..."
                    className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-body text-gray-900 border-l-4 border-l-[#f471b7]"
                    textAlignVertical="top"
                />
            </View>

            <TouchableOpacity
                activeOpacity={0.8}
                disabled={isSubmitting}
                onPress={handleSubmit}
                className="w-full relative shadow-md shadow-primary/30 rounded-full"
                style={{ borderRadius: 100 }}
            >
                <LinearGradient
                    colors={['#7d3bed', '#f471b7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full py-4 rounded-full flex-row items-center justify-center gap-3"
                    style={{ borderRadius: 100, overflow: 'hidden' }}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-heading font-black text-lg uppercase tracking-widest">
                            Đăng tải Thử thách
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}
