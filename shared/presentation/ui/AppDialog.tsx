import React from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type DialogTone = 'brand' | 'danger';

interface ToneConfig {
    gradient: readonly [string, string, ...string[]];
    iconColor: string;
    blobClass: string;
    outlineBtnClass: string;
    outlineTextClass: string;
}

const TONES: Record<DialogTone, ToneConfig> = {
    // Màu chủ đạo của app: tím (primary01) → hồng (primary02)
    brand: {
        gradient: ['#7C3BED', '#F471B7'],
        iconColor: '#7C3BED',
        blobClass: 'bg-purple-100 dark:bg-purple-900/30',
        outlineBtnClass: 'border-2 border-purple-500',
        outlineTextClass: 'text-purple-600 dark:text-purple-400',
    },
    danger: {
        gradient: ['#F87171', '#DC2626'],
        iconColor: '#EF4444',
        blobClass: 'bg-red-100 dark:bg-red-900/30',
        outlineBtnClass: 'border-2 border-red-400',
        outlineTextClass: 'text-red-600 dark:text-red-400',
    },
};

export interface AppDialogProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message?: string;
    /** Icon tự truyền — render trong khối tròn phía trên (vd: <Trash2 size={32} color="#EF4444" />). */
    icon?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    tone?: DialogTone;
    loading?: boolean;
    confirmDisabled?: boolean;
    /** Chạm ra nền tối để đóng (mặc định true). */
    dismissOnBackdrop?: boolean;
}

/**
 * Modal xác nhận dùng chung theo màu chủ đạo của app.
 * Nút nằm ngang: Hủy (viền) bên trái, Xác nhận (gradient) bên phải.
 */
export function AppDialog({
    visible,
    onConfirm,
    onCancel,
    title,
    message,
    icon,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    tone = 'brand',
    loading = false,
    confirmDisabled = false,
    dismissOnBackdrop = true,
}: AppDialogProps) {
    const t = TONES[tone];
    const confirmBlocked = loading || confirmDisabled;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <Pressable
                className="flex-1 bg-black/50 items-center justify-center px-6"
                onPress={dismissOnBackdrop && !loading ? onCancel : undefined}
            >
                {/* Chặn sự kiện chạm lan ra nền khi bấm vào card */}
                <Pressable
                    onPress={() => {}}
                    style={styles.card}
                    className="w-full max-w-[380px] bg-white dark:bg-gray-900 rounded-3xl p-6 items-center"
                >
                    {/* Icon blob */}
                    {!!icon && (
                        <View
                            className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${t.blobClass}`}
                        >
                            {icon}
                        </View>
                    )}

                    {/* Title */}
                    <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
                        {title}
                    </Text>

                    {/* Message */}
                    {!!message && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center leading-6 mt-2">
                            {message}
                        </Text>
                    )}

                    {/* Actions (nằm ngang) */}
                    <View className="flex-row gap-3 mt-6 w-full">
                        <TouchableOpacity
                            onPress={onCancel}
                            disabled={loading}
                            activeOpacity={0.7}
                            className={`flex-1 py-3.5 rounded-2xl items-center bg-white dark:bg-gray-900 ${t.outlineBtnClass} ${loading ? 'opacity-50' : ''}`}
                        >
                            <Text className={`text-base font-bold ${t.outlineTextClass}`}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            disabled={confirmBlocked}
                            activeOpacity={0.85}
                            style={{
                                borderRadius: 16,
                                overflow: 'hidden',
                                opacity: confirmBlocked ? 0.6 : 1,
                            }}
                            className="flex-1"
                        >
                            <LinearGradient
                                colors={t.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.confirmGradient}
                            >
                                {loading && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <Text className="text-base font-bold text-white">
                                    {confirmText}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    card: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 24,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    confirmGradient: {
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
