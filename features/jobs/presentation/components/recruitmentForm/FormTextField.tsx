import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { GradientFocusOutline } from './GradientFocusOutline';
import { RECRUITMENT_FORM_COLORS } from './recruitmentFormTheme';

interface FormTextFieldProps extends TextInputProps {
    label: string;
    required?: boolean;
}

export function FormTextField({
    label,
    required,
    style,
    onFocus,
    onBlur,
    onEndEditing,
    ...rest
}: FormTextFieldProps) {
    const [focused, setFocused] = useState(false);

    const handleFocus: TextInputProps['onFocus'] = (event) => {
        setFocused(true);
        onFocus?.(event);
    };

    const handleBlur: TextInputProps['onBlur'] = (event) => {
        setFocused(false);
        onBlur?.(event);
    };

    const handleEndEditing: TextInputProps['onEndEditing'] = (event) => {
        setFocused(false);
        onEndEditing?.(event);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required ? <Text style={styles.required}> *</Text> : null}
            </Text>
            <GradientFocusOutline focused={focused}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={RECRUITMENT_FORM_COLORS.textSubtle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onEndEditing={handleEndEditing}
                    {...rest}
                />
            </GradientFocusOutline>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: RECRUITMENT_FORM_COLORS.text,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: RECRUITMENT_FORM_COLORS.text,
    },
});
