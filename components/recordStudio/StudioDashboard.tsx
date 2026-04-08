import React, { useState, useEffect } from 'react';
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

interface StudioDashboardProps {
    beatId?: string;
}

export function StudioDashboard({ beatId }: StudioDashboardProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Recording States
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [recordURI, setRecordURI] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Preview playback states
    const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    // Request permissions on mount
    useEffect(() => {
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
            if (recording) recording.stopAndUnloadAsync();
            if (previewSound) previewSound.unloadAsync();
        };
    }, []);

    const startRecording = async () => {
        try {
            if (previewSound) {
                await previewSound.unloadAsync();
                setPreviewSound(null);
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
            );

            setRecording(newRecording);
            setIsRecording(true);
            setRecordURI(null); // Clear previous recording
        } catch (err) {
            console.error('Failed to start recording', err);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể khởi động micro.' });
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecordURI(uri);
            setRecording(null);

            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };

    const togglePreview = async () => {
        if (!recordURI) return;

        try {
            if (isPlayingPreview && previewSound) {
                await previewSound.pauseAsync();
                setIsPlayingPreview(false);
                return;
            }

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
                            sound.setPositionAsync(0);
                        }
                    },
                );
                setPreviewSound(sound);
                setIsPlayingPreview(true);
            }
        } catch (err) {
            console.error('Playback failed', err);
        }
    };

    const resetRecording = () => {
        if (recording) {
            stopRecording();
        }
        if (previewSound) {
            previewSound.unloadAsync();
        }
        setRecordURI(null);
        setRecording(null);
        setPreviewSound(null);
        setIsPlayingPreview(false);
        setIsRecording(false);
    };

    const handleSubmit = async () => {
        if (!beatId) return;
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

            await challengeApi.submitEntry(beatId, formData);
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Bài dự thi của bạn đã được gửi.',
            });
            resetRecording();
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
                <View className="flex-row items-center justify-between gap-4 mb-8">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100"
                        onPress={recordURI && !isRecording ? togglePreview : resetRecording}
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

                    <View className="relative flex items-center justify-center">
                        <View
                            className={`absolute w-24 h-24 rounded-full ${isRecording ? 'bg-red-500/30' : 'bg-primary/20'}`}
                        />
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={[styles.recordShadow, { borderRadius: 9999 }]}
                            onPress={isRecording ? stopRecording : startRecording}
                        >
                            <LinearGradient
                                colors={
                                    isRecording ? ['#ef4444', '#dc2626'] : ['#7d3bed', '#f471b7']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 9999 }}
                                className="w-20 h-20 rounded-full flex items-center justify-center z-10"
                            >
                                {isRecording ? (
                                    <View className="w-8 h-8 bg-white rounded-[4px]" />
                                ) : recordURI ? (
                                    <RotateCcw size={32} color="#ffffff" />
                                ) : (
                                    <Mic size={32} color="white" />
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border ${recordURI && !isSubmitting ? 'bg-primary/10 border-primary/20' : 'bg-gray-50 border-gray-100'}`}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !recordURI}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#7d3bed" />
                        ) : (
                            <Check size={28} color={recordURI ? '#7d3bed' : '#d1d5db'} />
                        )}
                    </TouchableOpacity>
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
}

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
