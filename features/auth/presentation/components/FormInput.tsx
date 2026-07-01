import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: React.ComponentType<{ size?: number; color?: string }>;
}

export function FormInput({ label, error, icon: Icon, ...props }: FormInputProps) {
    return (
        <View className="w-full mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </Text>
            <View className="relative">
                {Icon && (
                    <View className="absolute left-4 top-4 z-10">
                        <Icon size={20} color="#9333ea" />
                    </View>
                )}
                <TextInput
                    {...props}
                    className={`
                        w-full px-4 py-3 rounded-xl border-2
                        ${Icon ? 'pl-12' : 'pl-4'}
                        ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-white
                    `}
                    placeholderTextColor="#9ca3af"
                />
            </View>
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    );
}
