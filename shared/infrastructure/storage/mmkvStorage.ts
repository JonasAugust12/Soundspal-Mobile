import { StateStorage } from 'zustand/middleware';
import { storage } from './storage';

export const mmkvStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value);
    },
    getItem: (name) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: (name: string) => {
        return storage.remove(name);
    },
};

export { storage };
