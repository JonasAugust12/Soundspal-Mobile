import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    Pressable,
    FlatList,
    Dimensions,
    StatusBar,
    StyleSheet,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { X } from 'lucide-react-native';

export interface ImageViewerItem {
    id: string;
    uri: string;
}

interface ImageViewerModalProps {
    visible: boolean;
    images: ImageViewerItem[];
    /** Ảnh được mở đầu tiên; vuốt ngang để xem các ảnh còn lại. */
    initialIndex?: number;
    onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Xem ảnh toàn màn: nền đen, ảnh giữ nguyên tỉ lệ, vuốt ngang qua lại giữa các ảnh.
export function ImageViewerModal({
    visible,
    images,
    initialIndex = 0,
    onClose,
}: ImageViewerModalProps) {
    const listRef = useRef<FlatList<ImageViewerItem>>(null);
    const [index, setIndex] = useState(initialIndex);

    // Mỗi lần mở lại phải nhảy đúng ảnh vừa bấm, không giữ vị trí của lần mở trước.
    useEffect(() => {
        if (visible) setIndex(initialIndex);
    }, [visible, initialIndex]);

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        if (next !== index) setIndex(next);
    };

    if (!images.length) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <View style={styles.backdrop}>
                <FlatList
                    ref={listRef}
                    data={images}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={initialIndex}
                    getItemLayout={(_, i) => ({
                        length: screenWidth,
                        offset: screenWidth * i,
                        index: i,
                    })}
                    onMomentumScrollEnd={handleScrollEnd}
                    renderItem={({ item }) => (
                        // Chạm vào vùng ảnh để đóng — thao tác quen thuộc của trình xem ảnh.
                        <Pressable style={styles.page} onPress={onClose}>
                            <Image
                                source={{ uri: item.uri }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </Pressable>
                    )}
                />

                {images.length > 1 && (
                    <View style={styles.counter} pointerEvents="none">
                        <Text style={styles.counterText}>
                            {index + 1} / {images.length}
                        </Text>
                    </View>
                )}

                <Pressable
                    onPress={onClose}
                    style={styles.close}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Đóng ảnh"
                >
                    <X size={22} color="#ffffff" />
                </Pressable>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#000000',
    },
    page: {
        width: screenWidth,
        height: screenHeight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: screenWidth,
        height: screenHeight * 0.8,
    },
    counter: {
        position: 'absolute',
        top: 56,
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    counterText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '500',
    },
    close: {
        position: 'absolute',
        top: 48,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
});
