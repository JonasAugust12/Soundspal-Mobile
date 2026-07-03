import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: React.ComponentType<{ size?: number; color?: string }>;
}

export function FormInput({ label, error, icon: Icon, style, ...props }: FormInputProps) {
    return (
        <View style={styles.wrapper}>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </Text>
            <View
                style={[
                    styles.inputContainer,
                    error ? styles.inputContainerError : styles.inputContainerDefault,
                ]}
            >
                {Icon ? (
                    <View style={styles.iconWrap}>
                        <Icon size={20} color="#9333ea" />
                    </View>
                ) : null}
                <TextInput
                    {...props}
                    style={[styles.input, style]}
                    placeholderTextColor="#9ca3af"
                />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        minHeight: 52,
        paddingHorizontal: 16,
    },
    inputContainerDefault: {
        borderColor: '#d1d5db',
    },
    inputContainerError: {
        borderColor: '#ef4444',
    },
    iconWrap: {
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 12,
        paddingHorizontal: 0,
    },
    error: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
});
