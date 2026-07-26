import {
    ACCEPTED_UPLOAD_AUDIO_EXTENSIONS,
    formatRecordingTime,
    getRecordingFileName,
    getUploadAudioExtension,
    isAcceptedUploadAudioFile,
    getBeatAudioExtension,
    getBeatDownloadFileName,
} from '@/features/challenge/domain/utils/recording';

describe('formatRecordingTime', () => {
    it('formats MM:SS and pads', () => {
        expect(formatRecordingTime(0)).toBe('00:00');
        expect(formatRecordingTime(65)).toBe('01:05');
    });

    it('adds hours only when needed', () => {
        expect(formatRecordingTime(3661)).toBe('01:01:01');
        expect(formatRecordingTime(59, { includeHours: true })).toBe('00:00:59');
    });

    it('guards non-finite / negative input', () => {
        expect(formatRecordingTime(-5)).toBe('00:00');
        expect(formatRecordingTime(Number.NaN)).toBe('00:00');
    });
});

describe('upload extension helpers', () => {
    it('extracts lowercase extension', () => {
        expect(getUploadAudioExtension('Song.MP3')).toBe('mp3');
        expect(getUploadAudioExtension('noext')).toBe('');
        expect(getUploadAudioExtension('.hidden')).toBe('');
    });

    it('accepts only whitelisted audio extensions', () => {
        for (const ext of ACCEPTED_UPLOAD_AUDIO_EXTENSIONS) {
            expect(isAcceptedUploadAudioFile({ name: `take.${ext}` })).toBe(true);
        }
        expect(isAcceptedUploadAudioFile({ name: 'take.txt' })).toBe(false);
        expect(isAcceptedUploadAudioFile({ name: 'take.webm' })).toBe(false);
    });
});

describe('recording / download file names', () => {
    it('builds a stable recording file name', () => {
        expect(getRecordingFileName('abc')).toBe('soundspal-entry-abc.m4a');
        expect(getRecordingFileName('abc', 'wav')).toBe('soundspal-entry-abc.wav');
    });

    it('derives beat audio extension with mp3 fallback', () => {
        expect(getBeatAudioExtension('https://cdn/x/beat.wav?token=1')).toBe('wav');
        expect(getBeatAudioExtension('https://cdn/x/beat.webm')).toBe('mp3');
    });

    it('slugifies title for the download file name and falls back to id', () => {
        expect(
            getBeatDownloadFileName({ id: 'b1', title: 'Neon Rain', audio_url: 'a/x.mp3' }),
        ).toBe('neon-rain.mp3');
        expect(getBeatDownloadFileName({ id: 'b1', title: '!!!', audio_url: 'a/x.flac' })).toBe(
            'beat-b1.flac',
        );
    });
});
