import { create } from 'zustand';
import { Audio } from 'expo-av';
import { type Beat } from '@/types/challenge.type';

interface AudioState {
    currentBeat: Beat | null;
    soundObject: Audio.Sound | null;
    isPlaying: boolean;
    isLoading: boolean;
    progress: number;
    duration: number;

    // Actions
    playBeat: (beat: Beat) => Promise<void>;
    togglePlay: () => Promise<void>;
    stop: () => Promise<void>;
    setVolume: (value: number) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    currentBeat: null,
    soundObject: null,
    isPlaying: false,
    isLoading: false,
    progress: 0,
    duration: 0,

    playBeat: async (beat: Beat) => {
        const { currentBeat, soundObject, stop } = get();

        // If clicking the same beat, just toggle play
        if (currentBeat?.id === beat.id && soundObject) {
            await get().togglePlay();
            return;
        }

        // Stop current before starting new
        if (soundObject) {
            await stop();
        }

        set({ isLoading: true, currentBeat: beat });

        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const { sound } = await Audio.Sound.createAsync(
                { uri: beat.audio_url },
                { shouldPlay: true },
                (status) => {
                    if (status.isLoaded) {
                        set({
                            isPlaying: status.isPlaying,
                            progress: status.positionMillis,
                            duration: status.durationMillis,
                        });

                        // Handle completion
                        if (status.didJustFinish) {
                            set({ isPlaying: false, progress: 0 });
                            sound.setPositionAsync(0);
                        }
                    }
                },
            );

            set({ soundObject: sound, isPlaying: true, isLoading: false });
        } catch (error) {
            console.error('Lỗi khi phát audio:', error);
            set({ isLoading: false, isPlaying: false, soundObject: null, currentBeat: null });
        }
    },

    togglePlay: async () => {
        const { soundObject, isPlaying } = get();
        if (!soundObject) return;

        try {
            if (isPlaying) {
                await soundObject.pauseAsync();
                set({ isPlaying: false });
            } else {
                await soundObject.playAsync();
                set({ isPlaying: true });
            }
        } catch (error) {
            console.error('Lỗi khi toggle audio:', error);
        }
    },

    stop: async () => {
        const { soundObject } = get();
        if (soundObject) {
            try {
                await soundObject.stopAsync();
                await soundObject.unloadAsync();
            } catch (error) {
                console.error('Lỗi khi dừng audio:', error);
            }
        }
        set({
            currentBeat: null,
            soundObject: null,
            isPlaying: false,
            progress: 0,
            duration: 0,
        });
    },

    setVolume: async (value: number) => {
        const { soundObject } = get();
        if (soundObject) {
            await soundObject.setVolumeAsync(value);
        }
    },
}));
