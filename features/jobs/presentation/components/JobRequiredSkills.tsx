import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface JobRequiredSkillsProps {
    skills: string[];
}

export const JobRequiredSkills = ({ skills }: JobRequiredSkillsProps) => {
    if (!skills || skills.length === 0) return null;

    return (
        <View className="gap-3">
            <Text className="text-lg font-extrabold text-gray-900 dark:text-white">
                Kỹ năng yêu cầu
            </Text>
            <View className="gap-2">
                {skills.map((skill, index) => (
                    <View
                        key={index}
                        className="flex-row items-center gap-3 bg-green-50 dark:bg-green-900/20 px-3 py-2.5 rounded-lg border border-green-200 dark:border-green-800"
                    >
                        <CheckCircle size={18} color="#10B981" />
                        <Text className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            {skill}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};
