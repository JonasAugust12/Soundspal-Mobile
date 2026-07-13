import { create } from 'zustand';

type RedirectParams = Record<string, string>;

interface RedirectState {
    /** Đường dẫn người dùng định vào trước khi bị đá về màn Login (giống returnTo bên web). */
    pendingPath: string | null;
    pendingParams?: RedirectParams;
    setPending: (path: string, params?: RedirectParams) => void;
    clearPending: () => void;
}

/**
 * Lưu tạm điểm đến khi guard chặn người dùng chưa đăng nhập, để sau khi đăng nhập
 * thành công điều hướng lại đúng màn thay vì luôn về `/(tabs)`.
 */
export const useRedirectStore = create<RedirectState>((set) => ({
    pendingPath: null,
    pendingParams: undefined,
    setPending: (pendingPath, pendingParams) => set({ pendingPath, pendingParams }),
    clearPending: () => set({ pendingPath: null, pendingParams: undefined }),
}));
