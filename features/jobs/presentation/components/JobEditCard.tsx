import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { Edit, X } from 'lucide-react-native';

type FieldValue = string | number | string[] | boolean | undefined;

interface EditCardProps {
    title: string;
    value: FieldValue;
    onSave: (value: FieldValue) => void;
    type?: 'text' | 'number' | 'multiline' | 'select' | 'tags' | 'toggle' | 'budget';
    options?: Array<{ label: string; value: string }>;
    placeholder?: string;
    formatDisplay?: (value: FieldValue) => string;
    children?: React.ReactNode;
}

const toTempValue = (value: FieldValue, type: EditCardProps['type']) => {
    if (type === 'tags') {
        return Array.isArray(value) ? value.join(', ') : '';
    }
    if (value === undefined || value === null) {
        return '';
    }
    return String(value);
};

const isEmptyValue = (value: FieldValue) => {
    if (value === undefined || value === null || value === '') {
        return true;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    return false;
};

export const JobEditCard = ({
    title,
    value,
    onSave,
    type = 'text',
    options: _options = [],
    placeholder,
    formatDisplay,
    children,
}: EditCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState<string | number | string[] | boolean | undefined>(
        toTempValue(value, type),
    );

    useEffect(() => {
        if (!isEditing) {
            setTempValue(toTempValue(value, type));
        }
    }, [value, type, isEditing]);

    const openEditing = useCallback(() => {
        setTempValue(toTempValue(value, type));
        setIsEditing(true);
    }, [value, type]);

    const closeEditing = useCallback(() => {
        setTempValue(toTempValue(value, type));
        setIsEditing(false);
    }, [value, type]);

    const handleSave = () => {
        if (children) {
            setIsEditing(false);
            return;
        }

        if (type === 'tags') {
            const tags = String(tempValue)
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag);
            onSave(tags);
        } else if (type === 'number') {
            const raw = String(tempValue).trim();
            onSave(raw ? parseInt(raw, 10) : undefined);
        } else {
            onSave(tempValue);
        }
        setIsEditing(false);
    };

    const handleTextChange = (text: string) => {
        setTempValue(text);
        if (type === 'text' || type === 'multiline') {
            onSave(text);
        } else if (type === 'number') {
            const raw = text.trim();
            onSave(raw ? parseInt(raw, 10) : undefined);
        } else if (type === 'tags') {
            const tags = text
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag);
            onSave(tags);
        }
    };

    const displayValue = () => {
        if (isEmptyValue(value)) {
            return 'Chưa điền';
        }
        if (formatDisplay) {
            return formatDisplay(value);
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return String(value);
    };

    return (
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-3">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {title}
                </Text>
                {!isEditing && (
                    <TouchableOpacity onPress={openEditing} className="p-2">
                        <Edit size={16} color="#7C3BED" />
                    </TouchableOpacity>
                )}
            </View>

            {!isEditing && (
                <TouchableOpacity onPress={openEditing}>
                    <Text
                        className={`text-base font-medium ${
                            isEmptyValue(value)
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-900 dark:text-white'
                        }`}
                    >
                        {displayValue()}
                    </Text>
                </TouchableOpacity>
            )}

            {isEditing && (
                <View className="gap-3">
                    {children ? (
                        children
                    ) : type === 'text' || type === 'multiline' ? (
                        <TextInput
                            value={String(tempValue || '')}
                            onChangeText={handleTextChange}
                            placeholder={placeholder}
                            multiline={type === 'multiline'}
                            numberOfLines={type === 'multiline' ? 4 : 1}
                            textAlignVertical={type === 'multiline' ? 'top' : 'center'}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                        />
                    ) : type === 'number' ? (
                        <TextInput
                            value={String(tempValue || '')}
                            onChangeText={handleTextChange}
                            placeholder={placeholder}
                            keyboardType="numeric"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                        />
                    ) : type === 'tags' ? (
                        <TextInput
                            value={String(tempValue || '')}
                            onChangeText={handleTextChange}
                            placeholder="Nhập các mục, cách nhau bằng dấu phẩy"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                            placeholderTextColor="#999"
                        />
                    ) : null}

                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={closeEditing}
                            className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg py-2.5 items-center"
                        >
                            <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                                {children ? 'Đóng' : 'Hủy'}
                            </Text>
                        </TouchableOpacity>
                        {!children && (
                            <TouchableOpacity
                                onPress={handleSave}
                                className="flex-1 bg-purple-600 rounded-lg py-2.5 items-center"
                            >
                                <Text className="text-white font-semibold">Lưu</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

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
