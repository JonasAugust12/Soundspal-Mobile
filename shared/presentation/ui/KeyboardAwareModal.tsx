import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { KeyboardProvider, KeyboardAvoidingView } from 'react-native-keyboard-controller';

interface KeyboardAwareModalOverlayProps {
    children: React.ReactNode;
    /**
     * How the content reacts to the keyboard. `padding` (default) lifts the whole
     * overlay above the keyboard and works for both centered and bottom-anchored modals.
     */
    behavior?: 'padding' | 'height' | 'position';
    /** Distance between the top of the screen and this view. Usually 0 for full-screen modals. */
    keyboardVerticalOffset?: number;
    /** Extra style merged onto the flex-filling avoiding view. */
    style?: ViewStyle;
}

/**
 * Wrap the *content* of a React Native `<Modal>` with this so the on-screen keyboard
 * never covers focused inputs.
 *
 * A React Native `<Modal>` renders in its own native window, so the app-level
 * `KeyboardProvider` (mounted in `app/_layout.tsx`) does not measure the keyboard
 * inside it — especially on Android. We re-establish a `KeyboardProvider` here and let
 * `KeyboardAvoidingView` shift the modal content above the keyboard.
 *
 * @example
 * <Modal ...>
 *   <KeyboardAwareModalOverlay>
 *     <View className="flex-1 bg-black/50 justify-end">...</View>
 *   </KeyboardAwareModalOverlay>
 * </Modal>
 */
export function KeyboardAwareModalOverlay({
    children,
    behavior = 'padding',
    keyboardVerticalOffset = 0,
    style,
}: KeyboardAwareModalOverlayProps) {
    return (
        <KeyboardProvider>
            <KeyboardAvoidingView
                behavior={behavior}
                keyboardVerticalOffset={keyboardVerticalOffset}
                style={[styles.fill, style]}
            >
                {children}
            </KeyboardAvoidingView>
        </KeyboardProvider>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
});
