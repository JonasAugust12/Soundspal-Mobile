import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import { Copy, Edit3, Trash2 } from 'lucide-react-native';

export type MessageAction = 'edit' | 'delete';

type MessageActionSheetProps = {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onCopy: () => void;
    canEdit: boolean;
    canDelete: boolean;
};

export function MessageActionSheet({
    visible,
    onClose,
    onEdit,
    onDelete,
    onCopy,
    canEdit,
    canDelete,
}: MessageActionSheetProps) {
    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                {/* Pressable lồng nhau đã tự chặn tap xuyên xuống overlay (responder system
                    của RN), không cần stopPropagation — nó không tồn tại trên event của RN. */}
                <Pressable>
                    <View style={styles.sheet}>
                        {/* Copy */}
                        <Pressable
                            onPress={() => {
                                onCopy();
                                onClose();
                            }}
                            android_ripple={{ color: '#ede9fe' }}
                        >
                            <View className="flex-row items-center gap-3 px-4 py-3.5">
                                <Copy size={20} color="#374151" />
                                <Text className="text-base text-gray-900">Sao chép</Text>
                            </View>
                        </Pressable>

                        {/* Edit */}
                        {canEdit && (
                            <Pressable
                                onPress={() => {
                                    onEdit();
                                    onClose();
                                }}
                                android_ripple={{ color: '#ede9fe' }}
                            >
                                <View className="flex-row items-center gap-3 px-4 py-3.5 border-t border-gray-100">
                                    <Edit3 size={20} color="#7C3BED" />
                                    <Text className="text-base text-gray-900">Chỉnh sửa</Text>
                                </View>
                            </Pressable>
                        )}

                        {/* Delete */}
                        {canDelete && (
                            <Pressable
                                onPress={() => {
                                    onDelete();
                                    onClose();
                                }}
                                android_ripple={{ color: '#fee2e2' }}
                            >
                                <View className="flex-row items-center gap-3 px-4 py-3.5 border-t border-gray-100">
                                    <Trash2 size={20} color="#ef4444" />
                                    <Text className="text-base text-red-500">Xóa</Text>
                                </View>
                            </Pressable>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    // Đặt bằng StyleSheet thay vì className: 'bg-card' là token kiểu shadcn nhưng
    // KHÔNG được định nghĩa trong tailwind.config.js → Tailwind bỏ qua im lặng và
    // sheet mất hẳn nền, nhìn xuyên thấu xuống đoạn chat.
    sheet: {
        minWidth: 220,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
});
