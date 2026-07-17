import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AUTH_COMMON } from '@/features/auth/domain/constants/authMessages';

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: React.ComponentType<{ size?: number; color?: string }>;
}

export function FormInput({
    label,
    error,
    icon: Icon,
    style,
    secureTextEntry,
    ...props
}: FormInputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isSecure = secureTextEntry === true;

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
                    secureTextEntry={isSecure && !isPasswordVisible}
                    style={[styles.input, style]}
                    placeholderTextColor="#9ca3af"
                />
                {isSecure ? (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible((prev) => !prev)}
                        accessibilityRole="button"
                        accessibilityLabel={
                            isPasswordVisible ? AUTH_COMMON.hidePassword : AUTH_COMMON.showPassword
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.toggleButton}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={20} color="#9ca3af" />
                        ) : (
                            <Eye size={20} color="#9ca3af" />
                        )}
                    </TouchableOpacity>
                ) : null}
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
    toggleButton: {
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
});
