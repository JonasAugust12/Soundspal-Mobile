import React from 'react';
import { create } from 'zustand';
import { AppDialog } from './AppDialog';

export interface AppDialogButton {
    text?: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface DialogConfig {
    title: string;
    message?: string;
    tone: 'brand' | 'danger';
    confirmText: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface DialogState {
    visible: boolean;
    config: DialogConfig | null;
    show: (config: DialogConfig) => void;
    hide: () => void;
}

const useDialogStore = create<DialogState>((set) => ({
    visible: false,
    config: null,
    show: (config) => set({ visible: true, config }),
    hide: () => set({ visible: false }),
}));

/**
 * Popup custom kiểu imperative — dùng THAY cho Alert.alert (cùng chữ ký).
 * - showAppDialog('Thành công', 'Đã gửi!')                       → 1 nút OK
 * - showAppDialog('Xóa', 'Chắc chưa?', [
 *       { text: 'Hủy', style: 'cancel' },
 *       { text: 'Xóa', style: 'destructive', onPress: doDelete },
 *   ])                                                            → 2 nút (destructive → tông đỏ)
 */
export function showAppDialog(title: string, message?: string, buttons?: AppDialogButton[]): void {
    const btns: AppDialogButton[] = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];

    let cancelBtn: AppDialogButton | undefined;
    let confirmBtn: AppDialogButton;
    if (btns.length === 1) {
        confirmBtn = btns[0];
    } else {
        cancelBtn = btns.find((b) => b.style === 'cancel') ?? btns[0];
        confirmBtn = btns.find((b) => b !== cancelBtn) ?? btns[btns.length - 1];
    }

    useDialogStore.getState().show({
        title,
        message,
        tone: confirmBtn.style === 'destructive' ? 'danger' : 'brand',
        confirmText: confirmBtn.text ?? 'OK',
        cancelText: cancelBtn?.text,
        onConfirm: confirmBtn.onPress,
        onCancel: cancelBtn?.onPress,
    });
}

/** Host render popup — gắn MỘT lần ở app/_layout.tsx. */
export function AppDialogHost() {
    const visible = useDialogStore((s) => s.visible);
    const config = useDialogStore((s) => s.config);
    const hide = useDialogStore((s) => s.hide);

    if (!config) return null;

    return (
        <AppDialog
            visible={visible}
            title={config.title}
            message={config.message}
            tone={config.tone}
            confirmText={config.confirmText}
            cancelText={config.cancelText ?? ''}
            hideCancel={!config.cancelText}
            dismissOnBackdrop={!!config.cancelText}
            onConfirm={() => {
                hide();
                config.onConfirm?.();
            }}
            onCancel={() => {
                hide();
                config.onCancel?.();
            }}
        />
    );
}
