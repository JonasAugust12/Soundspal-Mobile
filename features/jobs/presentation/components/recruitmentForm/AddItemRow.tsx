import React, { useState } from 'react';
import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { GradientButton } from './GradientButton';
import { GradientFocusOutline } from './GradientFocusOutline';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface AddItemRowProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onAdd: () => void;
    buttonLabel?: string;
    inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'style'>;
}

export function AddItemRow({
    placeholder,
    value,
    onChangeText,
    onAdd,
    buttonLabel = 'Thêm',
    inputProps,
}: AddItemRowProps) {
    const [focused, setFocused] = useState(false);
    const { onFocus, onBlur, onEndEditing, ...restInputProps } = inputProps ?? {};

    return (
        <View style={styles.row}>
            <GradientFocusOutline focused={focused} style={styles.inputShell}>
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={RECRUITMENT_FORM_COLORS.textSubtle}
                    style={styles.input}
                    onFocus={(event) => {
                        setFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setFocused(false);
                        onBlur?.(event);
                    }}
                    onEndEditing={(event) => {
                        setFocused(false);
                        onEndEditing?.(event);
                    }}
                    {...restInputProps}
                />
            </GradientFocusOutline>
            <View style={styles.buttonWrap}>
                <GradientButton label={buttonLabel} compact onPress={onAdd} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    inputShell: {
        flex: 1,
        minWidth: 0,
    },
    input: {
        backgroundColor: 'transparent',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: RECRUITMENT_FORM_COLORS.text,
    },
    buttonWrap: {
        flexShrink: 0,
    },
});
