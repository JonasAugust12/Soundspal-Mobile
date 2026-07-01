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
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View className="bg-card rounded-2xl p-2 mx-4 border border-border shadow-lg">
                        {/* Copy */}
                        <Pressable
                            onPress={() => {
                                onCopy();
                                onClose();
                            }}
                            className="active:bg-secondary"
                        >
                            <View className="flex-row items-center gap-3 p-3 rounded-xl">
                                <Copy size={20} color="#09090b" />
                                <Text className="text-base text-foreground">Sao chép</Text>
                            </View>
                        </Pressable>

                        {/* Edit */}
                        {canEdit && (
                            <Pressable
                                onPress={() => {
                                    onEdit();
                                    onClose();
                                }}
                                className="active:bg-secondary"
                            >
                                <View className="flex-row items-center gap-3 p-3 rounded-xl">
                                    <Edit3 size={20} color="#7C3BED" />
                                    <Text className="text-base text-foreground">Chỉnh sửa</Text>
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
                                className="active:bg-secondary"
                            >
                                <View className="flex-row items-center gap-3 p-3 rounded-xl">
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
});
