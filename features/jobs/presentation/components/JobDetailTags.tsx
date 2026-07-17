import React from 'react';
import { View, Text } from 'react-native';

interface JobDetailTagsProps {
    tags: string[];
}

export const JobDetailTags = ({ tags }: JobDetailTagsProps) => {
    if (!tags || tags.length === 0) return null;

    return (
        <View className="flex-row flex-wrap gap-2">
            {tags.map((tag, index) => (
                <View
                    key={index}
                    className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800"
                >
                    <Text className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {tag}
                    </Text>
                </View>
            ))}
        </View>
    );
};
