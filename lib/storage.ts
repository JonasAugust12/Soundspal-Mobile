import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'talentlink-storage',
  encryptionKey: 'talentlink-secret-key',
});
