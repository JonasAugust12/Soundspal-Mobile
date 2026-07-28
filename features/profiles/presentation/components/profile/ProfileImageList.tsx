import React from 'react';
import {
    View,
    Text,
    Image,
    Pressable,
    Dimensions,
    Platform,
    StyleSheet,
    ImageSourcePropType,
} from 'react-native';
import { Images, ChevronRight } from 'lucide-react-native';
import { ImageViewerModal, type ImageViewerItem } from '@/shared/presentation/ui/ImageViewerModal';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 32 - 24) / 3; // px-4 (32) + 2 gaps of 12px (24)

type ImageItem = { id: string; cover: ImageSourcePropType };

type Props = {
    title?: string;
    data?: ImageItem[];
    onPressSeeAll?: () => void;
    showSeeAll?: boolean;
    hideHeader?: boolean;
};

export function ProfileImageList({
    title = 'Ảnh Portfolio',
    data = [],
    onPressSeeAll,
    showSeeAll = true,
    hideHeader = false,
}: Props) {
    const items = React.useMemo(() => data.slice(0, 6), [data]);
    const hasMore = data.length > 6;
    const remainingCount = data.length - 6;

    const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);

    // Trình xem ảnh vuốt qua được TẤT CẢ ảnh, không chỉ 6 ô đang hiện trên lưới.
    const viewerImages = React.useMemo<ImageViewerItem[]>(
        () =>
            data
                .map((item) => ({
                    id: item.id,
                    uri:
                        typeof item.cover === 'object' && item.cover !== null && 'uri' in item.cover
                            ? String(item.cover.uri ?? '')
                            : '',
                }))
                .filter((item) => item.uri.length > 0),
        [data],
    );

    return (
        <View className="gap-4">
            {/* Header */}
            {!hideHeader && (
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                            <Images size={18} color="#7C3AED" />
                        </View>
                        <Text className="text-lg font-bold text-foreground">{title}</Text>
                    </View>
                    {showSeeAll && onPressSeeAll && (
                        <Pressable
                            onPress={onPressSeeAll}
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 active:bg-primary/20"
                        >
                            <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
                            <ChevronRight size={14} color="#7C3AED" />
                        </Pressable>
                    )}
                </View>
            )}

            {/* Image Grid - Clean layout without card container */}
            {items.length > 0 ? (
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                    {items.map((item, index) => {
                        const isLastItem = index === 5 && hasMore;

                        return (
                            <Pressable
                                key={item.id}
                                onPress={isLastItem ? onPressSeeAll : () => setViewerIndex(index)}
                                className="active:scale-95"
                            >
                                <View
                                    style={[
                                        styles.imageWrapper,
                                        { width: imageSize, height: imageSize },
                                    ]}
                                    className="rounded-2xl overflow-hidden"
                                >
                                    <Image
                                        source={item.cover}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />

                                    {/* Show remaining count on last visible image */}
                                    {isLastItem && (
                                        <View className="absolute inset-0 bg-black/60 items-center justify-center">
                                            <Text className="text-white text-2xl font-bold">
                                                +{remainingCount}
                                            </Text>
                                            <Text className="text-white/80 text-xs mt-1">
                                                Xem thêm
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            ) : (
                <View className="py-12 items-center gap-3 bg-muted/30 rounded-2xl">
                    <View className="w-16 h-16 rounded-2xl bg-muted/60 items-center justify-center">
                        <Images size={32} color="#9CA3AF" />
                    </View>
                    <Text className="text-sm text-muted-foreground">Chưa có ảnh portfolio</Text>
                </View>
            )}

            <ImageViewerModal
                visible={viewerIndex !== null}
                images={viewerImages}
                initialIndex={viewerIndex ?? 0}
                onClose={() => setViewerIndex(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    imageWrapper: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});
