import React, { useState, useEffect, useRef, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import {
    RotateCcw,
    Check,
    BarChart2,
    Clock,
    FileText,
    Play,
    Square,
    Mic,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { challengeApi } from '@/hooks/useChallengeApi';
import Toast from 'react-native-toast-message';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import type { Beat } from '@/types/challenge.type';
import { useAudioStore } from '@/stores/audioStore';

interface StudioDashboardProps {
    beat?: Beat;
    onDurationUpdate?: (durationMillis: number) => void;
    onRecordingStateChange?: (isRecording: boolean) => void;
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

    // Recording States
    const [recordURI, setRecordURI] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Audio Ref Management to prevent overlaps
    const backgroundSoundRef = useRef<Audio.Sound | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const isProcessing = useRef(false);

    // Preview playback states
    const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    // Request permissions on mount; stop any entry preview from leaderboard
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
            // Cleanup on unmount
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
            setRecordURI(null);

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                playThroughEarpieceAndroid: false,
            });

            // Prepare background beat first if exists
            let bgSoundInstance: Audio.Sound | null = null;
            if (beat?.audio_url) {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: beat.audio_url },
                    { shouldPlay: false, isLooping: true },
                );
                bgSoundInstance = sound;
            }

            // check if user interrupted during loading
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

            // Stop background beat quickly
            if (backgroundSoundRef.current) {
                await backgroundSoundRef.current.stopAsync();
            }

            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            setRecordURI(uri);
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

    const togglePreview = async () => {
        if (isProcessing.current || !recordURI) return;
        isProcessing.current = true;

        try {
            if (isPlayingPreview && previewSound) {
                await previewSound.pauseAsync();
                setIsPlayingPreview(false);
            } else {
                if (previewSound) {
                    await previewSound.playAsync();
                    setIsPlayingPreview(true);
                } else {
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: recordURI },
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
            setRecordURI(null);
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
        if (!recordURI) {
            Toast.show({
                type: 'error',
                text1: 'Khoan đã!',
                text2: 'Vui lòng thu âm trước khi nộp.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Extract filename from URI
            const uriParts = recordURI.split('/');
            const fileName = uriParts[uriParts.length - 1] || 'recording.m4a';

            formData.append('audio', {
                uri: recordURI,
                name: fileName,
                type: 'audio/m4a', // Standard expo-av recording MIME type
            } as unknown as Blob);
            formData.append('explanation', 'Recorded using Sonic Pulse Studio');

            const entry = await challengeApi.submitEntry(beat.id, formData);
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Bài dự thi của bạn đã được gửi.',
            });
            resetRecording();

            // Navigate to result screen with entry data
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

    return (
        <View className="px-6 mb-8">
            <View
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                style={styles.cardShadow}
            >
                {/* Sliders Mockup */}
                <View className="flex-row gap-6 mb-8">
                    <View className="flex-1 space-y-2">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-[10px] font-body uppercase tracking-widest text-gray-500 font-bold">
                                Trạng thái
                            </Text>
                            <Text className="text-xs font-mono text-primary font-bold">
                                {isRecording ? 'ĐANG THU...' : recordURI ? 'ĐÃ THU' : 'SẴN SÀNG'}
                            </Text>
                        </View>
                        <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <LinearGradient
                                colors={['#7d3bed', '#f471b7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className={`h-full ${isRecording ? 'opacity-100 w-full' : recordURI ? 'opacity-50 w-full' : 'w-0'}`}
                            />
                        </View>
                    </View>
                </View>

                {/* Main Action Hub */}
                <View className="flex-row items-center justify-between px-2 mb-6 mt-4">
                    <View className="items-center gap-2">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"
                            onPress={recordURI && !isRecording ? togglePreview : resetRecording}
                            disabled={isPreparingRecord}
                        >
                            {recordURI && !isRecording ? (
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
                            {recordURI && !isRecording ? 'Nghe Lại' : 'Làm mới'}
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
                                    ) : recordURI ? (
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
                                  : recordURI
                                    ? 'Thu Lại'
                                    : 'Thu Âm'}
                        </Text>
                    </View>

                    <View className="items-center gap-2">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-sm ${recordURI && !isSubmitting ? 'bg-primary/10 border-primary/30' : 'bg-gray-50 border-gray-100'}`}
                            onPress={handleSubmit}
                            disabled={isSubmitting || !recordURI}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#7d3bed" />
                            ) : (
                                <Check size={28} color={recordURI ? '#7d3bed' : '#d1d5db'} />
                            )}
                        </TouchableOpacity>
                        <Text
                            className={`text-[10px] font-bold font-body uppercase tracking-wider ${recordURI ? 'text-primary' : 'text-gray-400'}`}
                        >
                            Nộp bài
                        </Text>
                    </View>
                </View>

                {/* Secondary Controls */}
                <View className="flex-row justify-center gap-10 items-center">
                    <TouchableOpacity className="flex items-center gap-1.5" activeOpacity={0.7}>
                        <BarChart2 size={22} color="#6b7280" />
                        <Text className="text-[10px] uppercase font-bold tracking-widest font-body text-gray-500">
                            Hiệu ứng
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex items-center gap-1.5" activeOpacity={0.7}>
                        <Clock size={22} color="#6b7280" />
                        <Text className="text-[10px] uppercase font-bold tracking-widest font-body text-gray-500">
                            Nhịp độ
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex items-center gap-1.5" activeOpacity={0.7}>
                        <FileText size={22} color="#6b7280" />
                        <Text className="text-[10px] uppercase font-bold tracking-widest font-body text-gray-500">
                            Lời bài hát
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
