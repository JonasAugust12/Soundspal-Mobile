import React, { useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Platform,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    hasError?: boolean;
    autoFocus?: boolean;
    activeColor?: string;
}

export function OTPInput({
    value,
    onChange,
    length = 6,
    hasError = false,
    autoFocus = true,
    activeColor = '#3B82F6',
}: OTPInputProps) {
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

    // Auto focus first input on mount
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [autoFocus]);

    const handleChange = (text: string, index: number) => {
        // Only allow numbers
        const sanitized = text.replace(/[^0-9]/g, '');

        if (sanitized.length > 1) {
            // Handle paste - distribute digits across inputs
            const digits = sanitized.slice(0, length).split('');
            const newValue = value.split('');

            digits.forEach((digit, i) => {
                if (index + i < length) {
                    newValue[index + i] = digit;
                }
            });

            const result = newValue.join('').slice(0, length);
            onChange(result);

            // Focus appropriate input after paste
            const nextIndex = Math.min(index + digits.length, length - 1);
            inputRefs.current[nextIndex]?.focus();
        } else if (sanitized.length === 1) {
            // Single digit input
            const newValue = value.split('');
            newValue[index] = sanitized;
            onChange(newValue.join(''));

            // Move to next input
            if (index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        } else {
            // Empty - clear this position
            const newValue = value.split('');
            newValue[index] = '';
            onChange(newValue.join(''));
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // If current is empty, go back and clear previous
                const newValue = value.split('');
                newValue[index - 1] = '';
                onChange(newValue.join(''));
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleFocus = (index: number) => {
        setFocusedIndex(index);
        // Select input content on focus
        inputRefs.current[index]?.setNativeProps({ selection: { start: 0, end: 1 } });
    };

    const handleBlur = () => {
        setFocusedIndex(null);
    };

    return (
        <View style={styles.container}>
            {Array(length)
                .fill(0)
                .map((_, index) => {
                    const isFocused = focusedIndex === index;
                    const isFilled = !!value[index];

                    return (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                inputRefs.current[index] = ref;
                            }}
                            style={[
                                styles.input,
                                isFilled && {
                                    borderColor: activeColor,
                                    backgroundColor: '#FFFFFF',
                                },
                                isFocused && {
                                    borderColor: activeColor,
                                    borderWidth: 3,
                                    shadowOpacity: 0.2,
                                },
                                hasError && styles.inputError,
                            ]}
                            value={value[index] || ''}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            onFocus={() => handleFocus(index)}
                            onBlur={handleBlur}
                            keyboardType="number-pad"
                            maxLength={length} // Allow paste
                            selectTextOnFocus
                            caretHidden={false}
                        />
                    );
                })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    input: {
        width: 48,
        height: 56,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#111827',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
});
