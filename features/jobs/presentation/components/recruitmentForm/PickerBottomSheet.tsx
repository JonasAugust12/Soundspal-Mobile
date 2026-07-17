import React, { type ReactNode } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_GRADIENT, RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface PickerBottomSheetProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmDisabled?: boolean;
    children: ReactNode;
}

export function PickerBottomSheet({
    visible,
    title,
    onClose,
    onConfirm,
    confirmDisabled = false,
    children,
}: PickerBottomSheetProps) {
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>{title}</Text>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </Pressable>
                    </View>

                    {children}

                    <Pressable
                        onPress={onConfirm}
                        disabled={confirmDisabled}
                        style={[styles.confirmWrap, confirmDisabled && styles.confirmDisabled]}
                    >
                        <LinearGradient
                            colors={
                                confirmDisabled ? ['#D1D5DB', '#9CA3AF'] : [...PRIMARY_GRADIENT]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.confirmButton}
                        >
                            <Text style={styles.confirmText}>Xác nhận</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    backdrop: {
        flex: 1,
    },
    sheet: {
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
        maxHeight: '88%',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sheetTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.textMuted,
    },
    confirmWrap: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 4,
    },
    confirmDisabled: {
        opacity: 0.75,
    },
    confirmButton: {
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
