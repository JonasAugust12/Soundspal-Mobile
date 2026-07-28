import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { FileAudio, FileText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';

export type UploadKind = 'image' | 'video' | 'audio' | 'file';

interface UploadProgressProps {
    visible: boolean;
    /** Tên tệp đang tải — bỏ trống thì chỉ hiện tiêu đề. */
    fileName?: string;
    kind?: UploadKind;
    title?: string;
    hint?: string;
}

const BAR_RATIO = 0.4;
const CYCLE_MS = 1100;

function KindIcon({ kind }: { kind: UploadKind }) {
    const props = { size: 20, color: '#7C3BED' } as const;
    if (kind === 'image') return <ImageIcon {...props} />;
    if (kind === 'video') return <VideoIcon {...props} />;
    if (kind === 'audio') return <FileAudio {...props} />;
    return <FileText {...props} />;
}

/**
 * Thẻ báo đang tải tệp lên, đặt inline ngay cạnh nút bấm.
 *
 * Thanh chạy là loại KHÔNG xác định (chạy qua chạy lại) chứ không phải phần trăm thật:
 * đường upload đi qua `fetch`, mà `fetch` không phát sự kiện tiến độ. Muốn có % thật phải
 * đổi sang XMLHttpRequest — xem ghi chú trong multipartUpload.ts trước khi làm.
 */
export function UploadProgress({
    visible,
    fileName,
    kind = 'file',
    title = 'Đang tải lên',
    hint = 'Tệp lớn có thể mất một lúc — vui lòng giữ ứng dụng mở',
}: UploadProgressProps) {
    const [trackWidth, setTrackWidth] = useState(0);
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible || trackWidth === 0) return undefined;

        anim.setValue(0);
        const loop = Animated.loop(
            Animated.timing(anim, {
                toValue: 1,
                duration: CYCLE_MS,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        );
        loop.start();

        return () => loop.stop();
    }, [visible, trackWidth, anim]);

    if (!visible) return null;

    const barWidth = trackWidth * BAR_RATIO;
    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-barWidth, trackWidth],
    });

    return (
        <View className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 px-4 py-3 gap-2.5">
            <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 items-center justify-center">
                    <KindIcon kind={kind} />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        {title}
                    </Text>
                    {fileName ? (
                        <Text
                            numberOfLines={1}
                            className="text-xs text-gray-600 dark:text-gray-400 mt-0.5"
                        >
                            {fileName}
                        </Text>
                    ) : null}
                </View>
            </View>

            <View
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                style={styles.track}
                className="bg-purple-200 dark:bg-purple-900/50"
            >
                {trackWidth > 0 && (
                    <Animated.View
                        style={[styles.bar, { width: barWidth, transform: [{ translateX }] }]}
                    />
                )}
            </View>

            {hint ? <Text className="text-xs text-gray-500 dark:text-gray-400">{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        height: 6,
        borderRadius: 999,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: '#7C3BED',
    },
});
