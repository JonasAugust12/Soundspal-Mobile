import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface SelectOption {
    label: string;
    value: string;
    icon?: LucideIcon;
}

interface SelectInputProps {
    label: string;
    options: SelectOption[];
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
                {options.map((option) => {
                    const isSelected = value === option.value;
                    const IconComponent = option.icon;

                    return (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => onValueChange(option.value)}
                            className={`
                                flex-1 py-3 px-3 rounded-xl border-2 items-center gap-1.5
                                ${
                                    isSelected
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-gray-200 bg-white'
                                }
                            `}
                        >
                            {IconComponent && (
                                <IconComponent
                                    size={22}
                                    color={isSelected ? '#7C3AED' : '#9CA3AF'}
                                />
                            )}
                            <Text
                                className={`
                                    text-center font-semibold text-sm
                                    ${isSelected ? 'text-purple-600' : 'text-gray-500'}
                                `}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    );
}
