import React, { useState, useEffect, useRef, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { RotateCcw, Check, Play, Square, Mic, Music2, Upload, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { challengeApi } from '@/features/challenge/presentation/hooks/useChallengeApi';
import { useAudioStore } from '@/features/challenge/presentation/store/audioStore';
import type { Beat } from '@/features/challenge/domain/entities/challenge.type';
import {
    getRecordingFileName,
    getUploadAudioExtension,
    isAcceptedUploadAudioFile,
    type RecordingMode,
} from '@/features/challenge/domain/utils/recording';

interface StudioDashboardProps {
    beat?: Beat;
    onDurationUpdate?: (durationMillis: number) => void;
    onRecordingStateChange?: (isRecording: boolean) => void;
}

/** MIME đoán theo đuôi file để đính vào FormData (backend đọc bằng đuôi, không bắt buộc chuẩn). */
function guessAudioMime(extension: string): string {
    switch (extension) {
        case 'mp3':
            return 'audio/mpeg';
        case 'wav':
            return 'audio/wav';
        case 'flac':
            return 'audio/flac';
        case 'ogg':
            return 'audio/ogg';
        case 'aac':
            return 'audio/aac';
        case 'm4a':
        default:
            return 'audio/m4a';
    }
}

export const StudioDashboard = memo(function StudioDashboard({
    beat,
    onDurationUpdate,
    onRecordingStateChange,
}: StudioDashboardProps) {
    const router = useRouter();
    const stopEntry = useAudioStore((s) => s.stopEntry);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreparingRecord, setIsPreparingRecord] = useState(false);

    // Chế độ thu: hát trên nền beat vs hát chay — giống toggle with-beat/no-beat của web.
    const [mode, setMode] = useState<RecordingMode>('with-beat');
    // Bản thu/lên hiện tại: uri + tên file + mime để nộp. Có thể đến từ mic hoặc upload.
    const [take, setTake] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Audio refs để tránh chồng tiếng
    const backgroundSoundRef = useRef<Audio.Sound | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const isProcessing = useRef(false);

    const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    // Xin quyền micro khi mở màn; dừng preview entry còn sót từ bảng xếp hạng.
    useEffect(() => {
        stopEntry();
        (async () => {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Quyền truy cập',
                    text2: 'Vui lòng cấp quyền Micro để bắt đầu thu âm.',
                });
            }
        })();

        return () => {
            if (recordingRef.current) recordingRef.current.stopAndUnloadAsync();
            if (previewSound) previewSound.unloadAsync();
            if (backgroundSoundRef.current) backgroundSoundRef.current.unloadAsync();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const safeUnloadAll = async () => {
        if (recordingRef.current) {
            try {
                await recordingRef.current.stopAndUnloadAsync();
            } catch {
                /* ignore */
            }
            recordingRef.current = null;
        }
        if (previewSound) {
            try {
                await previewSound.unloadAsync();
            } catch {
                /* ignore */
            }
            setPreviewSound(null);
        }
        if (backgroundSoundRef.current) {
            try {
                await backgroundSoundRef.current.unloadAsync();
            } catch {
                /* ignore */
            }
            backgroundSoundRef.current = null;
        }
        setIsPlayingPreview(false);
    };

    const startRecording = async () => {
        if (isProcessing.current) return;
        isProcessing.current = true;
        setIsPreparingRecord(true);

        try {
            await safeUnloadAll();
            setTake(null);

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                playThroughEarpieceAndroid: false,
            });

            // Chỉ nạp beat nền khi chọn chế độ "hát có beat".
            let bgSoundInstance: Audio.Sound | null = null;
            if (mode === 'with-beat' && beat?.audio_url) {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: beat.audio_url },
                    { shouldPlay: false, isLooping: true, volume: 0.7 },
                );
                bgSoundInstance = sound;
            }

            // Người dùng có thể huỷ trong lúc đang nạp.
            if (!isProcessing.current) {
                if (bgSoundInstance) await bgSoundInstance.unloadAsync();
                setIsPreparingRecord(false);
                return;
            }

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
                (status) => {
                    if (status.isRecording && onDurationUpdate) {
                        onDurationUpdate(status.durationMillis);
                    }
                },
                100,
            );

            recordingRef.current = newRecording;
            setIsRecording(true);
            onRecordingStateChange?.(true);

            if (bgSoundInstance) {
                backgroundSoundRef.current = bgSoundInstance;
                await bgSoundInstance.playAsync();
            }
        } catch (err) {
            console.error('Failed to start recording', err);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể khởi động micro.' });
            await safeUnloadAll();
            setIsRecording(false);
            onRecordingStateChange?.(false);
        } finally {
            isProcessing.current = false;
            setIsPreparingRecord(false);
        }
    };

    const stopRecording = async () => {
        if (isProcessing.current || !recordingRef.current) return;
        isProcessing.current = true;

        try {
            setIsRecording(false);
            onRecordingStateChange?.(false);

            if (backgroundSoundRef.current) {
                await backgroundSoundRef.current.stopAsync();
            }

            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            if (uri) {
                setTake({
                    uri,
                    name: getRecordingFileName(beat?.id || 'beat', 'm4a'),
                    type: 'audio/m4a',
                });
            }
            recordingRef.current = null;

            if (backgroundSoundRef.current) {
                await backgroundSoundRef.current.unloadAsync();
                backgroundSoundRef.current = null;
            }

            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (err) {
            console.error('Failed to stop recording', err);
        } finally {
            isProcessing.current = false;
        }
    };

    // Chọn file audio có sẵn để nộp thay cho thu trực tiếp — tương đương nút "Tải lên" của web.
    const handleUpload = async () => {
        if (isRecording) return;
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
                multiple: false,
            });
            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset) return;

            const name = asset.name || `upload-${beat?.id || 'beat'}.m4a`;
            if (!isAcceptedUploadAudioFile({ name })) {
                Toast.show({
                    type: 'error',
                    text1: 'Định dạng không hỗ trợ',
                    text2: 'Chỉ chấp nhận mp3, wav, flac, m4a, ogg, aac.',
                });
                return;
            }

            await safeUnloadAll();
            const extension = getUploadAudioExtension(name);
            setTake({
                uri: asset.uri,
                name,
                type: asset.mimeType || guessAudioMime(extension),
            });
            onDurationUpdate?.(0);
        } catch (err) {
            console.error('Upload pick failed', err);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể chọn file âm thanh.' });
        }
    };

    // Tải beat gốc về máy — mở URL công khai của beat bằng trình duyệt hệ thống để lưu/nghe.
    const handleDownloadBeat = async () => {
        if (!beat?.audio_url) {
            Toast.show({ type: 'error', text1: 'Không có beat', text2: 'Beat này chưa có audio.' });
            return;
        }
        try {
            const canOpen = await Linking.canOpenURL(beat.audio_url);
            if (!canOpen) throw new Error('cannot open url');
            await Linking.openURL(beat.audio_url);
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Không thể tải beat',
                text2: 'Vui lòng thử lại sau.',
            });
        }
    };

    const togglePreview = async () => {
        if (isProcessing.current || !take) return;
        isProcessing.current = true;

        try {
            if (isPlayingPreview && previewSound) {
                await previewSound.pauseAsync();
                setIsPlayingPreview(false);
            } else if (previewSound) {
                await previewSound.playAsync();
                setIsPlayingPreview(true);
            } else {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: take.uri },
                    { shouldPlay: true },
                    (status) => {
                        if (status.isLoaded && status.didJustFinish) {
                            setIsPlayingPreview(false);
                            sound.stopAsync();
                        }
                    },
                );
                setPreviewSound(sound);
                setIsPlayingPreview(true);
            }
        } catch (err) {
            console.error('Playback failed', err);
        } finally {
            isProcessing.current = false;
        }
    };

    const resetRecording = async () => {
        if (isProcessing.current) return;
        isProcessing.current = true;
        try {
            await safeUnloadAll();
            setTake(null);
            recordingRef.current = null;
            setIsRecording(false);
            onRecordingStateChange?.(false);
            onDurationUpdate?.(0);
        } finally {
            isProcessing.current = false;
        }
    };

    const handleSubmit = async () => {
        if (!beat) return;
        if (!take) {
            Toast.show({
                type: 'error',
                text1: 'Khoan đã!',
                text2: 'Vui lòng thu âm hoặc tải lên trước khi nộp.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('audio', {
                uri: take.uri,
                name: take.name,
                type: take.type,
            } as unknown as Blob);

            const entry = await challengeApi.submitEntry(beat.id, formData);
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Bài dự thi của bạn đã được gửi.',
            });
            await resetRecording();

            router.push({
                pathname: '/(challenge)/result',
                params: { data: JSON.stringify(entry), beatId: beat.id },
            });
        } catch (error) {
            console.error('Entry submit error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi nộp bài',
                text2: 'Gặp sự cố khi nộp bài dự thi.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusLabel = isRecording ? 'ĐANG THU...' : take ? 'ĐÃ THU' : 'SẴN SÀNG';

    return (
        <View className="px-6 mb-8">
            <View
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                style={styles.cardShadow}
            >
                {/* Trạng thái */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-[10px] font-body uppercase tracking-widest text-gray-500 font-bold">
                            Trạng thái
                        </Text>
                        <Text className="text-xs font-mono text-primary font-bold">
                            {statusLabel}
                        </Text>
                    </View>
                    <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <LinearGradient
                            colors={['#7d3bed', '#f471b7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className={`h-full ${isRecording ? 'opacity-100 w-full' : take ? 'opacity-50 w-full' : 'w-0'}`}
                        />
                    </View>
                </View>

                {/* Chọn chế độ thu — ẩn khi đã có bản thu để tập trung vào nghe lại/nộp. */}
                {!take && (
                    <View className="flex-row gap-3 mb-6">
                        <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={isRecording}
                            onPress={() => setMode('with-beat')}
                            className={`flex-1 rounded-2xl py-3 px-3 border flex-row items-center justify-center gap-2 ${
                                mode === 'with-beat'
                                    ? 'bg-primary/10 border-primary/40'
                                    : 'bg-gray-50 border-gray-200'
                            } ${isRecording ? 'opacity-50' : ''}`}
                        >
                            <Music2
                                size={16}
                                color={mode === 'with-beat' ? '#7d3bed' : '#6b7280'}
                            />
                            <Text
                                className={`text-xs font-bold font-body ${
                                    mode === 'with-beat' ? 'text-primary' : 'text-gray-600'
                                }`}
                            >
                                Hát có beat
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={isRecording}
                            onPress={() => setMode('vocal-only')}
                            className={`flex-1 rounded-2xl py-3 px-3 border flex-row items-center justify-center gap-2 ${
                                mode === 'vocal-only'
                                    ? 'bg-primary/10 border-primary/40'
                                    : 'bg-gray-50 border-gray-200'
                            } ${isRecording ? 'opacity-50' : ''}`}
                        >
                            <Mic size={16} color={mode === 'vocal-only' ? '#7d3bed' : '#6b7280'} />
                            <Text
                                className={`text-xs font-bold font-body ${
                                    mode === 'vocal-only' ? 'text-primary' : 'text-gray-600'
                                }`}
                            >
                                Hát chay
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Hub thao tác chính: Nghe lại/Làm mới · Thu âm · Nộp bài */}
                <View className="flex-row items-center justify-between px-2 mb-6 mt-2">
                    <View className="items-center gap-2">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"
                            onPress={take && !isRecording ? togglePreview : resetRecording}
                            disabled={isPreparingRecord}
                        >
                            {take && !isRecording ? (
                                isPlayingPreview ? (
                                    <Square size={24} color="#7d3bed" fill="#7d3bed" />
                                ) : (
                                    <Play
                                        size={24}
                                        color="#7d3bed"
                                        fill="#7d3bed"
                                        style={{ marginLeft: 3 }}
                                    />
                                )
                            ) : (
                                <RotateCcw size={24} color={isRecording ? '#d1d5db' : '#6b7280'} />
                            )}
                        </TouchableOpacity>
                        <Text className="text-[10px] font-bold font-body uppercase text-gray-500 tracking-wider">
                            {take && !isRecording ? 'Nghe Lại' : 'Làm mới'}
                        </Text>
                    </View>

                    <View className="flex items-center justify-center gap-2">
                        <View className="relative flex items-center justify-center">
                            <View
                                className={`absolute w-24 h-24 rounded-full ${isRecording ? 'bg-red-500/30' : 'bg-primary/20'}`}
                            />
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={[styles.recordShadow, { borderRadius: 9999 }]}
                                onPress={isRecording ? stopRecording : startRecording}
                                disabled={isPreparingRecord}
                            >
                                <LinearGradient
                                    colors={
                                        isRecording
                                            ? ['#ef4444', '#dc2626']
                                            : ['#7d3bed', '#f471b7']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ borderRadius: 9999 }}
                                    className="w-20 h-20 rounded-full flex items-center justify-center z-10"
                                >
                                    {isPreparingRecord ? (
                                        <ActivityIndicator size={'large'} color="#ffffff" />
                                    ) : isRecording ? (
                                        <View className="w-8 h-8 bg-white rounded-[4px]" />
                                    ) : take ? (
                                        <RotateCcw size={32} color="#ffffff" />
                                    ) : (
                                        <Mic size={32} color="white" />
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-[10px] font-bold font-body uppercase text-gray-500 tracking-wider">
                            {isPreparingRecord
                                ? 'Đang Tải'
                                : isRecording
                                  ? 'Dừng Thu'
                                  : take
                                    ? 'Thu Lại'
                                    : 'Thu Âm'}
                        </Text>
                    </View>

                    <View className="items-center gap-2">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-sm ${take && !isSubmitting ? 'bg-primary/10 border-primary/30' : 'bg-gray-50 border-gray-100'}`}
                            onPress={handleSubmit}
                            disabled={isSubmitting || !take}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#7d3bed" />
                            ) : (
                                <Check size={28} color={take ? '#7d3bed' : '#d1d5db'} />
                            )}
                        </TouchableOpacity>
                        <Text
                            className={`text-[10px] font-bold font-body uppercase tracking-wider ${take ? 'text-primary' : 'text-gray-400'}`}
                        >
                            Nộp bài
                        </Text>
                    </View>
                </View>

                {/* Thao tác phụ thật sự: Tải lên file · Tải beat về */}
                <View className="flex-row gap-3 pt-4 border-t border-gray-100">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        disabled={isRecording}
                        onPress={handleUpload}
                        className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 border border-gray-200 ${isRecording ? 'opacity-50' : ''}`}
                    >
                        <Upload size={17} color="#7d3bed" />
                        <Text className="text-xs font-bold font-body text-gray-700 uppercase tracking-wide">
                            Tải lên file
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        disabled={!beat?.audio_url}
                        onPress={handleDownloadBeat}
                        className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 border border-gray-200 ${!beat?.audio_url ? 'opacity-50' : ''}`}
                    >
                        <Download size={17} color="#7d3bed" />
                        <Text className="text-xs font-bold font-body text-gray-700 uppercase tracking-wide">
                            Tải beat về
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    recordShadow: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
});
