import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    Pressable,
    Dimensions,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { ResizeMode, AVPlaybackStatus, Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { setStatusBarHidden } from 'expo-status-bar';
import ExpoVideoPlayer from 'expo-video-player';
import { Play, X } from 'lucide-react-native';

interface VideoPlayerProps {
    videoUrl: string;
    thumbnailUrl?: string;
    title?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const cardWidth = (screenWidth - 32 - 12) / 2; // px-4 (32) + gap-3 (12)
const cardHeight = cardWidth * 1.2;

/**
 * Thẻ video trong hồ sơ: chạm vào là mở trình phát toàn màn có nút tạm dừng.
 *
 * Trước đây trình phát nằm ngay trong thẻ nhỏ nên phải chạm để hiện điều khiển rồi mới bấm
 * được play, và muốn xem lớn phải tìm thêm nút phóng to. Giờ thẻ chỉ là ảnh đại diện, mọi
 * thao tác xem diễn ra trong modal — một chạm là xem được.
 */
export function VideoPlayer({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inLandscape, setInLandscape] = useState(false);
    const refVideo = useRef<Video>(null!);

    const enterFullscreen = async () => {
        setStatusBarHidden(true, 'fade');
        setInLandscape(true);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        refVideo.current?.setStatusAsync({ shouldPlay: true });
    };

    const exitFullscreen = async () => {
        setStatusBarHidden(false, 'fade');
        setInLandscape(false);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };

    // Đóng modal phải trả màn hình về dọc, kẻo thoát ra vẫn kẹt ở ngang.
    const closeViewer = async () => {
        if (inLandscape) await exitFullscreen();
        refVideo.current?.setStatusAsync({ shouldPlay: false });
        setIsOpen(false);
    };

    const playerWidth = inLandscape ? screenHeight : screenWidth;
    const playerHeight = inLandscape ? screenWidth : screenWidth * (9 / 16);

    return (
        <>
            <Pressable
                onPress={() => setIsOpen(true)}
                style={[styles.card, { width: cardWidth, height: cardHeight }]}
                accessibilityRole="button"
                accessibilityLabel={title ? `Phát video ${title}` : 'Phát video'}
            >
                {thumbnailUrl ? (
                    <Image
                        source={{ uri: thumbnailUrl }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                    />
                ) : null}

                <View style={styles.playBadge}>
                    <Play size={22} color="#ffffff" fill="#ffffff" />
                </View>

                {title ? (
                    <View style={styles.titleBar}>
                        <Text style={styles.titleText} numberOfLines={1}>
                            {title}
                        </Text>
                    </View>
                ) : null}
            </Pressable>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                statusBarTranslucent
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={closeViewer}
            >
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                <View style={styles.backdrop}>
                    <ExpoVideoPlayer
                        videoProps={{
                            shouldPlay: true,
                            resizeMode: ResizeMode.CONTAIN,
                            source: { uri: videoUrl },
                            ref: refVideo,
                        }}
                        playbackCallback={(_status: AVPlaybackStatus) => undefined}
                        // Hiện sẵn thanh điều khiển để nút tạm dừng nhìn thấy ngay, không phải chạm dò.
                        defaultControlsVisible
                        timeVisible
                        slider={{ visible: true }}
                        fullscreen={{
                            inFullscreen: inLandscape,
                            enterFullscreen,
                            exitFullscreen,
                            visible: true,
                        }}
                        style={{
                            width: playerWidth,
                            height: playerHeight,
                            videoBackgroundColor: 'black',
                            controlsBackgroundColor: 'rgba(0,0,0,0.4)',
                        }}
                        icon={{ size: 56, color: '#ffffff' }}
                        animation={{ fadeInDuration: 200, fadeOutDuration: 300 }}
                    />

                    {!inLandscape && (
                        <Pressable
                            onPress={closeViewer}
                            style={styles.close}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Đóng video"
                        >
                            <X size={22} color="#ffffff" />
                        </Pressable>
                    )}
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingLeft: 3,
    },
    titleBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    titleText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
    },
    backdrop: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    close: {
        position: 'absolute',
        top: 48,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
});
