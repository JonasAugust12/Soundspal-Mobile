import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { MapPin, ChevronDown, Check } from 'lucide-react-native';
import {
    VN_PROVINCES,
    provinceNameByIso,
} from '@/features/profiles/domain/constants/profileConstants';

interface ProvincePickerProps {
    /** ISO của tỉnh/thành đang chọn (state_province). */
    valueIso?: string;
    /** Fallback hiển thị khi chưa có state_province nhưng đã có city (free-text cũ). */
    fallbackName?: string;
    onChange: (iso: string, name: string) => void;
    label?: string;
    /** Màu nhấn cho item đang chọn (mặc định tím). */
    accentColor?: string;
}

export function ProvincePicker({
    valueIso,
    fallbackName,
    onChange,
    label = 'Tỉnh / Thành phố',
    accentColor = '#7C3AED',
}: ProvincePickerProps) {
    const [open, setOpen] = useState(false);

    const selectedName = provinceNameByIso(valueIso) || fallbackName || '';

    return (
        <View className="gap-2">
            <Text className="text-sm font-bold text-foreground">{label}</Text>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                activeOpacity={0.7}
                className="flex-row items-center gap-2 px-4 py-4 bg-secondary dark:bg-gray-800 rounded-xl border border-transparent"
            >
                <MapPin size={18} color={accentColor} />
                <Text
                    className={`flex-1 text-base ${selectedName ? 'text-foreground' : 'text-gray-400'}`}
                >
                    {selectedName || 'Chọn tỉnh / thành phố'}
                </Text>
                <ChevronDown size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setOpen(false)}
                >
                    <Pressable
                        onPress={() => {}}
                        className="bg-white dark:bg-gray-900 rounded-t-3xl pt-4 pb-8 max-h-[70%]"
                    >
                        <View className="w-12 h-1 rounded-full bg-gray-300 dark:bg-gray-700 self-center mb-3" />
                        <Text className="text-lg font-bold text-foreground text-center mb-2">
                            {label}
                        </Text>
                        <FlatList
                            data={VN_PROVINCES}
                            keyExtractor={(item) => item.iso}
                            renderItem={({ item }) => {
                                const isSelected = item.iso === valueIso;
                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            onChange(item.iso, item.name);
                                            setOpen(false);
                                        }}
                                        className="flex-row items-center justify-between px-6 py-4 active:bg-gray-50 dark:active:bg-gray-800"
                                    >
                                        <Text
                                            className={`text-base ${isSelected ? 'font-bold' : 'text-foreground'}`}
                                            style={isSelected ? { color: accentColor } : undefined}
                                        >
                                            {item.name}
                                        </Text>
                                        {isSelected && <Check size={20} color={accentColor} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
