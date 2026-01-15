import React from 'react';
import { View, Text, Modal, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    visible,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    isDestructive = false,
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
            <View className="flex-1 bg-black/40 items-center justify-center px-6">
                <View
                    style={styles.modalContainer}
                    className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl overflow-hidden"
                >
                    {/* Header with icon */}
                    <View
                        className={`py-6 items-center ${isDestructive ? 'bg-red-50 dark:bg-red-950/30' : 'bg-purple-50 dark:bg-purple-950/30'}`}
                    >
                        <View
                            className={`w-16 h-16 rounded-full items-center justify-center ${isDestructive ? 'bg-red-100 dark:bg-red-900/50' : 'bg-purple-100 dark:bg-purple-900/50'}`}
                        >
                            <AlertTriangle
                                size={32}
                                color={isDestructive ? '#EF4444' : '#7C3AED'}
                            />
                        </View>
                    </View>

                    {/* Content */}
                    <View className="px-6 py-5">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            {title}
                        </Text>
                        <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6">
                            {message}
                        </Text>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-3 px-6 pb-6">
                        <TouchableOpacity
                            onPress={onCancel}
                            disabled={isLoading}
                            className="flex-1 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 items-center"
                        >
                            <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                {cancelText}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-3.5 rounded-xl items-center ${isDestructive ? 'bg-red-500' : 'bg-purple-600'} ${isLoading ? 'opacity-50' : ''}`}
                            activeOpacity={0.8}
                        >
                            <Text className="text-base font-semibold text-white">
                                {isLoading ? 'Đang xử lý...' : confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Close button */}
                    <TouchableOpacity
                        onPress={onCancel}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                    >
                        <X size={18} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            },
            android: {
                elevation: 12,
            },
        }),
    },
});
