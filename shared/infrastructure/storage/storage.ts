import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
    id: `${process.env.EXPO_PUBLIC_STORAGE_ID}`,
    encryptionKey: `${process.env.EXPO_PUBLIC_STORAGE_ENCRYPTION_KEY}`,
});
