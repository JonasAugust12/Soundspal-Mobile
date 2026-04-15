import { create } from 'zustand';
import { Audio } from 'expo-av';
import { type Beat, type BeatEntry } from '@/types/challenge.type';

interface AudioState {
    // ------ Beat (background music) ------
    currentBeat: Beat | null;
    soundObject: Audio.Sound | null;
    isPlaying: boolean;
    isLoading: boolean;
    progress: number;
    duration: number;

    // ------ Entry preview ------
    currentEntry: BeatEntry | null;
    entrySound: Audio.Sound | null;
    isEntryPlaying: boolean;
    isEntryLoading: boolean;

    // ------ Beat actions ------
    playBeat: (beat: Beat) => Promise<void>;
    togglePlay: () => Promise<void>;
    stop: () => Promise<void>;
    setVolume: (value: number) => Promise<void>;

    // ------ Entry actions ------
    playEntry: (entry: BeatEntry) => Promise<void>;
    stopEntry: () => Promise<void>;

    // ------ Global ------
    stopAll: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    currentBeat: null,
    soundObject: null,
    isPlaying: false,
    isLoading: false,
    progress: 0,
    duration: 0,

    currentEntry: null,
    entrySound: null,
    isEntryPlaying: false,
    isEntryLoading: false,

    // ---------- Beat ----------

    playBeat: async (beat: Beat) => {
        const { currentBeat, soundObject, stop, stopEntry } = get();

        // Stop any entry preview first
        await stopEntry();

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
            } catch {
                /* ignore */
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

    // ---------- Entry ----------

    playEntry: async (entry: BeatEntry) => {
        const { currentEntry, entrySound, stopEntry } = get();

        // Pause the beat player while previewing an entry
        const { soundObject, isPlaying } = get();
        if (soundObject && isPlaying) {
            await soundObject.pauseAsync();
            set({ isPlaying: false });
        }

        // Toggle if same entry
        if (currentEntry?.id === entry.id && entrySound) {
            const status = await entrySound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
                await entrySound.pauseAsync();
                set({ isEntryPlaying: false });
            } else if (status.isLoaded) {
                await entrySound.playAsync();
                set({ isEntryPlaying: true });
            }
            return;
        }

        // Stop old entry
        await stopEntry();

        if (!entry.audio_url) return;
        set({ isEntryLoading: true, currentEntry: entry });

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });
            const { sound } = await Audio.Sound.createAsync(
                { uri: entry.audio_url },
                { shouldPlay: true },
                (status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        set({ isEntryPlaying: false });
                        sound.setPositionAsync(0);
                    }
                },
            );
            set({ entrySound: sound, isEntryPlaying: true, isEntryLoading: false });
        } catch (err) {
            console.error('Entry playback failed', err);
            set({
                isEntryLoading: false,
                isEntryPlaying: false,
                entrySound: null,
                currentEntry: null,
            });
        }
    },

    stopEntry: async () => {
        const { entrySound } = get();
        if (entrySound) {
            try {
                await entrySound.stopAsync();
                await entrySound.unloadAsync();
            } catch {
                /* ignore */
            }
        }
        set({ entrySound: null, currentEntry: null, isEntryPlaying: false, isEntryLoading: false });
    },

    stopAll: async () => {
        const { stop, stopEntry } = get();
        await stopEntry();
        await stop();
    },
}));
