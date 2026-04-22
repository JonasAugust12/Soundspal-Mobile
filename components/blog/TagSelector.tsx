import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { X } from 'lucide-react-native';

interface TagSelectorProps {
    availableTags: string[];
    selectedTags: string[];
    onSelectionChange: (tags: string[]) => void;
    maxTags?: number;
}

export function TagSelector({
    availableTags,
    selectedTags,
    onSelectionChange,
    maxTags = 5,
}: TagSelectorProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onSelectionChange(selectedTags.filter((t) => t !== tag));
        } else if (selectedTags.length < maxTags) {
            onSelectionChange([...selectedTags, tag]);
        }
    };

    const unselectedTags = availableTags.filter((tag) => !selectedTags.includes(tag));

    return (
        <View>
            {/* Selected tags */}
            {selectedTags.length > 0 && (
                <View className="mb-3">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            {selectedTags.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    onPress={() => handleTagToggle(tag)}
                                    className="bg-purple-600 rounded-full px-3 py-1.5 flex-row items-center gap-2"
                                >
                                    <Text className="text-white text-sm font-medium">{tag}</Text>
                                    <X size={14} color="white" strokeWidth={2.5} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Available tags */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                    {unselectedTags.map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            onPress={() => handleTagToggle(tag)}
                            className={`border rounded-full px-3 py-1.5 ${
                                isDark
                                    ? 'border-slate-600 bg-slate-700'
                                    : 'border-gray-300 bg-gray-100'
                            }`}
                        >
                            <Text
                                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                + {tag}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
