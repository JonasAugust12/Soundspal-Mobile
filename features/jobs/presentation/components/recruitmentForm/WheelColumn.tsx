import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Platform,
    type NativeSyntheticEvent,
    type NativeScrollEvent,
} from 'react-native';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

export const WHEEL_ITEM_HEIGHT = 44;
const VISIBLE_PADDING_ROWS = 2;
const WHEEL_VISIBLE_HEIGHT = WHEEL_ITEM_HEIGHT * (VISIBLE_PADDING_ROWS * 2 + 1);

interface WheelColumnProps {
    items: string[];
    selectedIndex: number;
    onValueChange: (index: number) => void;
    width?: number;
}

export function WheelColumn({ items, selectedIndex, onValueChange, width }: WheelColumnProps) {
    const scrollRef = useRef<ScrollView>(null);
    const isUserScrolling = useRef(false);

    const scrollToIndex = useCallback((index: number, animated = false) => {
        scrollRef.current?.scrollTo({
            y: index * WHEEL_ITEM_HEIGHT,
            animated,
        });
    }, []);

    useEffect(() => {
        if (isUserScrolling.current) {
            return;
        }
        scrollToIndex(selectedIndex, false);
    }, [scrollToIndex, selectedIndex]);

    useEffect(() => {
        const timer = setTimeout(() => scrollToIndex(selectedIndex, false), 0);
        return () => clearTimeout(timer);
    }, [scrollToIndex, selectedIndex]);

    const snapToIndex = useCallback(
        (offsetY: number) => {
            const index = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
            const clamped = Math.max(0, Math.min(items.length - 1, index));
            onValueChange(clamped);
            scrollToIndex(clamped, true);
            isUserScrolling.current = false;
        },
        [items.length, onValueChange, scrollToIndex],
    );

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        snapToIndex(event.nativeEvent.contentOffset.y);
    };

    return (
        <View style={[styles.column, width != null ? { width } : styles.columnFlex]}>
            <View style={styles.selectionOverlay} pointerEvents="none" />
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={WHEEL_ITEM_HEIGHT}
                decelerationRate="fast"
                nestedScrollEnabled
                onScrollBeginDrag={() => {
                    isUserScrolling.current = true;
                }}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                contentContainerStyle={styles.scrollContent}
            >
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <View key={`${item}-${index}`} style={styles.item}>
                            <Text
                                style={[styles.itemText, isSelected && styles.itemTextSelected]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.85}
                            >
                                {item}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
            <View style={styles.fadeTop} pointerEvents="none" />
            <View style={styles.fadeBottom} pointerEvents="none" />
        </View>
    );
}

const styles = StyleSheet.create({
    column: {
        height: WHEEL_VISIBLE_HEIGHT,
        position: 'relative',
    },
    columnFlex: {
        flex: 1,
    },
    scroll: {
        flex: 1,
        zIndex: 2,
    },
    scrollContent: {
        paddingVertical: WHEEL_ITEM_HEIGHT * VISIBLE_PADDING_ROWS,
    },
    selectionOverlay: {
        position: 'absolute',
        left: 4,
        right: 4,
        top: WHEEL_ITEM_HEIGHT * VISIBLE_PADDING_ROWS,
        height: WHEEL_ITEM_HEIGHT,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#D8B4FE',
        backgroundColor: 'rgba(124, 59, 237, 0.06)',
        zIndex: 1,
    },
    item: {
        height: WHEEL_ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    itemText: {
        fontSize: 20,
        lineHeight: WHEEL_ITEM_HEIGHT,
        color: RECRUITMENT_FORM_COLORS.textSubtle,
        fontWeight: '500',
        textAlign: 'center',
        ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    itemTextSelected: {
        color: RECRUITMENT_FORM_COLORS.primary,
        fontWeight: '700',
        fontSize: 22,
    },
    fadeTop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: WHEEL_ITEM_HEIGHT * 1.2,
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        opacity: 0.72,
        zIndex: 3,
    },
    fadeBottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: WHEEL_ITEM_HEIGHT * 1.2,
        backgroundColor: RECRUITMENT_FORM_COLORS.surface,
        opacity: 0.72,
        zIndex: 3,
    },
});
