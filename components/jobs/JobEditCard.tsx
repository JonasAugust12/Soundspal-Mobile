import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { Edit, X } from 'lucide-react-native';

interface EditCardProps {
    title: string;
    value: string | number | string[] | undefined;
    onSave: (value: string | number | string[] | boolean | undefined) => void;
    type?: 'text' | 'number' | 'multiline' | 'select' | 'tags' | 'toggle' | 'budget';
    options?: Array<{ label: string; value: string }>;
    placeholder?: string;
    children?: React.ReactNode;
}

export const JobEditCard = ({
    title,
    value,
    onSave,
    type = 'text',
    options: _options = [],
    placeholder,
    children,
}: EditCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(
        type === 'tags' ? (Array.isArray(value) ? value.join(', ') : '') : value,
    );

    const handleSave = () => {
        if (type === 'tags') {
            const tags = (tempValue as string)
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag);
            onSave(tags);
        } else {
            onSave(tempValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(type === 'tags' ? (Array.isArray(value) ? value.join(', ') : '') : value);
        setIsEditing(false);
    };

    const displayValue = () => {
        if (!value) return 'Chưa điền';
        if (Array.isArray(value)) return value.join(', ');
        return String(value);
    };

    return (
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-3">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {title}
                </Text>
                {!isEditing && (
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2">
                        <Edit size={16} color="#7C3BED" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Display Value */}
            {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text
                        className={`text-base font-medium ${
                            value
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-400 dark:text-gray-500'
                        }`}
                    >
                        {displayValue()}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Edit Mode */}
            {isEditing && (
                <View className="gap-3">
                    {children ? (
                        children
                    ) : type === 'text' ? (
                        <TextInput
                            value={String(tempValue || '')}
                            onChangeText={setTempValue}
                            placeholder={placeholder}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                        />
                    ) : type === 'multiline' ? (
                        <TextInput
                            value={String(tempValue || '')}
                            onChangeText={setTempValue}
                            placeholder={placeholder}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                        />
                    ) : type === 'number' ? (
                        <TextInput
                            value={String(tempValue || '')}
                            onChangeText={setTempValue}
                            placeholder={placeholder}
                            keyboardType="numeric"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                        />
                    ) : type === 'tags' ? (
                        <TextInput
                            value={String(tempValue || '')}
                            onChangeText={setTempValue}
                            placeholder="Nhập các mục, cách nhau bằng dấu phẩy"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                        />
                    ) : null}

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg py-2.5 items-center"
                        >
                            <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                                Hủy
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            className="flex-1 bg-purple-600 rounded-lg py-2.5 items-center"
                        >
                            <Text className="text-white font-semibold">Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

// Selection Modal Component
export const SelectionModal = ({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
}: {
    visible: boolean;
    title: string;
    options: Array<{ label: string; value: string }>;
    selectedValue?: string;
    onSelect: (value: string) => void;
    onClose: () => void;
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-96">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#7C3BED" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                                className={`py-3 px-4 rounded-lg mb-2 ${
                                    selectedValue === option.value
                                        ? 'bg-purple-100 dark:bg-purple-900/30'
                                        : 'bg-gray-50 dark:bg-gray-700'
                                }`}
                            >
                                <Text
                                    className={`font-medium ${
                                        selectedValue === option.value
                                            ? 'text-purple-700 dark:text-purple-300'
                                            : 'text-gray-900 dark:text-white'
                                    }`}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
