import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    useGetBattleSettings,
    useGetBeatById,
} from '@/features/challenge/presentation/hooks/useChallengeApi';
import {
    HeaderInfo,
    WaveformCanvas,
    StudioDashboard,
} from '@/features/challenge/presentation/components/recordStudio';
import { CommonHeader } from '@/shared/presentation/ui';

export default function RecordStudioScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: beatData, isLoading } = useGetBeatById(id);
    const { data: battleSettings, isLoading: settingsLoading } = useGetBattleSettings();
    const beat = beatData;
    const entriesUploadEnabled = battleSettings?.entries_upload_enabled !== false;
    const canSubmitEntry = Boolean(beat?.is_active) && entriesUploadEnabled;

    const [durationMillis, setDurationMillis] = useState(0);
    const [isRecording, setIsRecording] = useState(false);

    const goBeatDetail = () => {
        if (!id) {
            router.back();
            return;
        }
        router.back();
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <CommonHeader />

            <ScrollView
                contentContainerStyle={{ paddingTop: 64, paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                className="flex-1"
            >
                {isLoading || settingsLoading ? (
                    <View className="flex-1 items-center justify-center pt-20">
                        <ActivityIndicator size="large" color="#7d3bed" />
                    </View>
                ) : !canSubmitEntry ? (
                    <View className="mx-5 mt-10 rounded-3xl border border-gray-200 bg-gray-50 p-6">
                        <Text className="text-center font-heading text-xl font-black text-gray-900">
                            Tạm khóa nộp bài
                        </Text>
                        <Text className="mt-2 text-center text-sm text-gray-500">
                            Admin đã tắt nộp bài challenge. Bạn vẫn có thể quay lại chi tiết beat
                            hoặc xem bảng xếp hạng.
                        </Text>
                        <View className="mt-5 gap-3">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="rounded-full bg-primary py-3.5"
                                onPress={goBeatDetail}
                            >
                                <Text className="text-center font-heading font-bold text-white">
                                    Quay lại chi tiết beat
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="rounded-full border border-primary/30 py-3.5"
                                onPress={() =>
                                    router.push({
                                        pathname: '/(challenge)/leaderboard',
                                        params: { id },
                                    })
                                }
                            >
                                <Text className="text-center font-heading font-bold text-primary">
                                    Xem bảng xếp hạng
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <HeaderInfo
                            beat={beat}
                            durationMillis={durationMillis}
                            isRecording={isRecording}
                        />
                        <WaveformCanvas isRecording={isRecording} />
                        <StudioDashboard
                            beat={beat}
                            onDurationUpdate={setDurationMillis}
                            onRecordingStateChange={setIsRecording}
                        />
                    </>
                )}
            </ScrollView>
        </View>
    );
}
