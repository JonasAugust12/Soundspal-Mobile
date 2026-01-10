import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SelectInputProps {
    label: string;
    options: Array<{ label: string; value: string }>;
    value: string;
    onValueChange: (value: string) => void;
    error?: string;
}

export function SelectInput({ label, options, value, onValueChange, error }: SelectInputProps) {
    return (
        <View className="w-full mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </Text>
            <View className="flex-row gap-2">
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => onValueChange(option.value)}
                        className={`
                            flex-1 py-3 px-4 rounded-xl border-2
                            ${value === option.value
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                            }
                        `}
                    >
                        <Text
                            className={`
                                text-center font-medium
                                ${value === option.value
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                }
                            `}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {error && (
                <Text className="text-red-500 text-xs mt-1">{error}</Text>
            )}
        </View>
    );
}
