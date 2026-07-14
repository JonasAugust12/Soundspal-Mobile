import React from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

/**
 * Lớp phủ loading toàn màn hình (Modal native) — dùng cho các thao tác chặn UI
 * như đăng nhập / đăng xuất. Phủ cả status bar & tab bar, scrim tối đồng nhất.
 */
export function LoadingOverlay({ visible, message = 'Đang xử lý...' }: LoadingOverlayProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View className="flex-1 bg-black/50 items-center justify-center px-10">
                <View className="bg-white dark:bg-gray-900 px-8 py-7 rounded-3xl items-center gap-3 min-w-[180px]">
                    <ActivityIndicator size="large" color="#7C3BED" />
                    <Text className="text-base font-semibold text-gray-900 dark:text-white text-center">
                        {message}
                    </Text>
                </View>
            </View>
        </Modal>
    );
}
