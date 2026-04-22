import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Zustand `persist` rehydrates from MMKV. Rehydration is often synchronous before the
 * first paint, so `onFinishHydration` may fire before we subscribe — always re-check
 * `hasHydrated()` inside the effect to avoid staying on a blank loading state forever.
 */
export function useAuthHydration(): boolean {
    const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setHydrated(true);
            return undefined;
        }
        return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    }, []);

    return hydrated;
}
