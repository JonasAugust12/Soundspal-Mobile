import React, { useRef, useState } from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';
import { ResizeMode, AVPlaybackStatus, Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { setStatusBarHidden } from 'expo-status-bar';
import ExpoVideoPlayer from 'expo-video-player';

interface VideoPlayerProps {
    videoUrl: string;
    thumbnailUrl?: string;
    title?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const cardWidth = (screenWidth - 48 - 12) / 2; // padding + gap
const cardHeight = cardWidth * 1.2;

export function VideoPlayer({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [inFullscreen, setInFullscreen] = useState(false);
    const refVideo = useRef<Video>(null!);

    const enterFullscreen = async () => {
        setStatusBarHidden(true, 'fade');
        setInFullscreen(true);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        refVideo.current?.setStatusAsync({
            shouldPlay: true,
        });
    };

    const exitFullscreen = async () => {
        setStatusBarHidden(false, 'fade');
        setInFullscreen(false);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };

    return (
        <View
            style={{
                width: inFullscreen ? screenHeight : cardWidth,
                height: inFullscreen ? screenWidth : cardHeight,
                borderRadius: inFullscreen ? 0 : 12,
                overflow: 'hidden',
                backgroundColor: '#000',
            }}
        >
            {/* Thumbnail - shows until video starts playing */}
            {!hasStarted && thumbnailUrl && !inFullscreen && (
                <Image
                    source={{ uri: thumbnailUrl }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                />
            )}

            {/* Video Player with controls */}
            <ExpoVideoPlayer
                videoProps={{
                    shouldPlay: false,
                    resizeMode: inFullscreen ? ResizeMode.CONTAIN : ResizeMode.COVER,
                    source: { uri: videoUrl },
                    ref: refVideo,
                }}
                playbackCallback={(status: AVPlaybackStatus) => {
                    if (status.isLoaded && status.isPlaying && !hasStarted) {
                        setHasStarted(true);
                    }
                    if (status.isLoaded && status.didJustFinish) {
                        setHasStarted(false);
                    }
                }}
                defaultControlsVisible={false}
                timeVisible={true}
                slider={{
                    visible: true,
                }}
                fullscreen={{
                    inFullscreen,
                    enterFullscreen,
                    exitFullscreen,
                    visible: true,
                }}
                style={{
                    width: inFullscreen ? screenHeight : cardWidth,
                    height: inFullscreen ? screenWidth : cardHeight,
                    videoBackgroundColor: 'black',
                    controlsBackgroundColor: 'rgba(0,0,0,0.4)',
                }}
                icon={{
                    size: inFullscreen ? 56 : 48,
                    color: '#ffffff',
                }}
                animation={{
                    fadeInDuration: 200,
                    fadeOutDuration: 300,
                }}
            />
        </View>
    );
}
