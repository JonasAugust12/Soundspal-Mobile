import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
    id: 'soundspal-storage',
    encryptionKey: 'soundspal-secret-key',
});
