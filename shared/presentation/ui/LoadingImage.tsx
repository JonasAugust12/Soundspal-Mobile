import React, { useEffect, useMemo, useState } from 'react';
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
 * Khoá nhận diện ảnh ổn định giữa các lần render. Truyền `source={{ uri }}` inline sẽ
 * tạo object mới mỗi render — nếu reset theo tham chiếu object thì `loaded` bị đặt lại
 * liên tục làm shimmer nhấp nháy. Rút ra chuỗi khoá để chỉ reset khi ảnh thật sự đổi.
 */
function getSourceKey(uri?: string | null, source?: ImageSourcePropType): string {
    if (uri) return uri;
    if (typeof source === 'number') return `local:${source}`;
    if (source && typeof source === 'object' && !Array.isArray(source) && 'uri' in source) {
        return String((source as { uri?: string }).uri ?? '');
    }
    return source ? JSON.stringify(source) : '';
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

    const sourceKey = getSourceKey(uri, source);
    // Giữ nguyên tham chiếu `source` khi ảnh không đổi — tránh Image tải lại mỗi lần render.
    const resolvedSource = useMemo<ImageSourcePropType | undefined>(
        () => source ?? (uri ? { uri } : undefined),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sourceKey],
    );

    // Chỉ reset khi ảnh thật sự đổi (theo khoá chuỗi) — tránh nhấp nháy do object mới mỗi render.
    useEffect(() => {
        setLoaded(false);
        setFailed(false);
    }, [sourceKey]);

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

            {/* Lớp shimmer phủ khi ảnh chưa sẵn sàng; ẩn hẳn khi đã load. */}
            {hasImage && !loaded && (
                <Shimmer
                    style={StyleSheet.absoluteFill}
                    borderRadius={borderRadius}
                    baseColor={shimmerBase ?? DEFAULT_SHIMMER_BASE}
                    highlightColor={shimmerHighlight ?? DEFAULT_SHIMMER_HIGHLIGHT}
                />
            )}

            {/* Không có ảnh (hoặc lỗi): hiện fallback, else nền shimmer. */}
            {!hasImage &&
                (fallback ?? (
                    <Shimmer
                        style={StyleSheet.absoluteFill}
                        borderRadius={borderRadius}
                        baseColor={shimmerBase ?? DEFAULT_SHIMMER_BASE}
                        highlightColor={shimmerHighlight ?? DEFAULT_SHIMMER_HIGHLIGHT}
                    />
                ))}
        </View>
    );
}

// Nền xám nhạt + nhịp sáng dịu để khung ảnh "đang tải" nhấp nháy nhẹ nhàng, không đậm màu.
const DEFAULT_SHIMMER_BASE = '#ECEDEF';
const DEFAULT_SHIMMER_HIGHLIGHT = 'rgba(255,255,255,0.6)';

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#ECEDEF',
    },
});
