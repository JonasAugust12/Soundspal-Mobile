import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    Animated,
    StyleSheet,
    useColorScheme,
    Pressable,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle } from 'lucide-react-native';

export type BlogNoticeVariant = 'success' | 'error';

export type BlogNoticePayload = {
    variant: BlogNoticeVariant;
    title: string;
    message?: string;
};

export interface BlogSlidingNoticeProps {
    variant: BlogNoticeVariant;
    title: string;
    message?: string;
    /** Invoked after slide-out animation completes (or on tap outside) */
    onDismiss: () => void;
    /** Time to show before auto slide-out (ms) */
    durationMs?: number;
}

const SLIDE_OFFSET = 140;
const DEFAULT_DURATION = 3800;

/**
 * Full-screen dim + frosted banner from the top (success / error).
 * Mount when you want to show; unmount by calling onDismiss after animation.
 */
export function BlogSlidingNotice({
    variant,
    title,
    message,
    onDismiss,
    durationMs = DEFAULT_DURATION,
}: BlogSlidingNoticeProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const translateY = useRef(new Animated.Value(-SLIDE_OFFSET)).current;
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const closing = useRef(false);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    const slideOut = (then: () => void) => {
        Animated.timing(translateY, {
            toValue: -SLIDE_OFFSET,
            duration: 220,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) then();
        });
    };

    useEffect(() => {
        closing.current = false;
        translateY.setValue(-SLIDE_OFFSET);
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 65,
        }).start();

        hideTimer.current = setTimeout(() => {
            if (closing.current) return;
            closing.current = true;
            slideOut(() => onDismissRef.current());
        }, durationMs);

        return () => {
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
                hideTimer.current = null;
            }
        };
    }, [durationMs, translateY]);

    const handleBackdrop = () => {
        if (closing.current) return;
        closing.current = true;
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        slideOut(() => onDismissRef.current());
    };

    const isSuccess = variant === 'success';
    const borderColor = isSuccess ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.5)';
    const iconColor = isSuccess ? '#22c55e' : '#ef4444';
    const tint: 'light' | 'dark' = isDark ? 'dark' : 'light';
    const titleColor = isDark ? '#f8fafc' : '#0f172a';
    const subColor = isDark ? 'rgba(226, 232, 240, 0.85)' : 'rgba(30, 41, 59, 0.85)';

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent>
            <Pressable style={styles.backdrop} onPress={handleBackdrop}>
                <Animated.View
                    style={[
                        styles.bannerWrap,
                        {
                            paddingTop: insets.top + 8,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <BlurView
                            intensity={Platform.OS === 'ios' ? 70 : 55}
                            tint={tint}
                            style={[styles.blur, { borderColor }]}
                        >
                            <View
                                pointerEvents="none"
                                style={[
                                    styles.tintOverlay,
                                    {
                                        backgroundColor: isSuccess
                                            ? 'rgba(22, 163, 74, 0.12)'
                                            : 'rgba(220, 38, 38, 0.1)',
                                    },
                                ]}
                            />
                            <View style={styles.row}>
                                {isSuccess ? (
                                    <CheckCircle2 size={28} color={iconColor} strokeWidth={2.2} />
                                ) : (
                                    <XCircle size={28} color={iconColor} strokeWidth={2.2} />
                                )}
                                <View style={styles.textCol}>
                                    <Text style={[styles.title, { color: titleColor }]}>
                                        {title}
                                    </Text>
                                    {message ? (
                                        <Text
                                            style={[styles.message, { color: subColor }]}
                                            numberOfLines={3}
                                        >
                                            {message}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        </BlurView>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
    },
    bannerWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        paddingHorizontal: 16,
    },
    blur: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth * 2,
        overflow: 'hidden',
    },
    tintOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    textCol: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    message: {
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
});
