import React, { useEffect, useState } from 'react';
import {
    Image,
    View,
    StyleSheet,
    type ImageResizeMode,
    type ImageSourcePropType,
    type StyleProp,
    type ViewStyle,
    type ImageStyle,
} from 'react-native';
import { Shimmer } from './Shimmer';

interface LoadingImageProps {
    /** URL ảnh remote. Rỗng/null → hiển thị `fallback` (nếu có) hoặc nền shimmer tĩnh. */
    uri?: string | null;
    /** Nguồn ảnh trực tiếp (remote {uri} hoặc local require) — thay cho `uri` khi cần. */
    source?: ImageSourcePropType;
    /** Kích thước + bo góc của khung ảnh (bắt buộc để shimmer biết vùng phủ). */
    style?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    borderRadius?: number;
    resizeMode?: ImageResizeMode;
    /** Nội dung thay thế khi không có ảnh hoặc ảnh tải lỗi (vd icon "no image"). */
    fallback?: React.ReactNode;
    shimmerBase?: string;
    shimmerHighlight?: string;
    accessibilityLabel?: string;
}

/**
 * Ảnh remote kèm hiệu ứng loading: phủ `Shimmer` lên khung cho tới khi ảnh tải xong
 * (onLoad) hoặc lỗi. Dùng chung cho mọi thẻ có ảnh để người dùng luôn thấy trạng thái
 * đang tải thay vì khoảng trắng. Khung phải được cấp kích thước qua `style`.
 */
export function LoadingImage({
    uri,
    source,
    style,
    imageStyle,
    borderRadius,
    resizeMode = 'cover',
    fallback,
    shimmerBase,
    shimmerHighlight,
    accessibilityLabel,
}: LoadingImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    const resolvedSource: ImageSourcePropType | undefined = source ?? (uri ? { uri } : undefined);

    // Reset trạng thái khi đổi ảnh (vd list tái sử dụng component).
    useEffect(() => {
        setLoaded(false);
        setFailed(false);
    }, [uri, source]);

    const hasImage = !!resolvedSource && !failed;
    const radiusStyle = borderRadius != null ? { borderRadius } : null;

    return (
        <View style={[styles.container, radiusStyle, style]}>
            {hasImage && (
                <Image
                    source={resolvedSource as ImageSourcePropType}
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    resizeMode={resizeMode}
                    accessibilityLabel={accessibilityLabel}
                    style={[StyleSheet.absoluteFill, imageStyle]}
                />
            )}

            {/* Lớp shimmer phủ khi ảnh chưa sẵn sàng; ẩn khi đã load. */}
            {hasImage && !loaded && (
                <Shimmer
                    style={StyleSheet.absoluteFill}
                    borderRadius={borderRadius}
                    baseColor={shimmerBase}
                    highlightColor={shimmerHighlight}
                />
            )}

            {/* Không có ảnh (hoặc lỗi): hiện fallback, else nền shimmer nhẹ. */}
            {!hasImage &&
                (fallback ?? (
                    <Shimmer
                        style={StyleSheet.absoluteFill}
                        borderRadius={borderRadius}
                        baseColor={shimmerBase}
                        highlightColor={shimmerHighlight}
                    />
                ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },
});
