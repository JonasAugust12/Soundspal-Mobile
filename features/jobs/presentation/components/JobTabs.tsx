import React from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';

interface JobTabsProps {
    activeTab: 'others' | 'mine';
    onTabChange: (tab: 'others' | 'mine') => void;
}

export const JobTabs = ({ activeTab, onTabChange }: JobTabsProps) => {
    return (
        <View className="w-full px-4">
            <View
                className="flex-row bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl"
                style={styles.container}
            >
                <Pressable
                    onPress={() => onTabChange('others')}
                    className={`flex-1 py-3 rounded-xl ${
                        activeTab === 'others' ? 'bg-white dark:bg-gray-700' : 'bg-transparent'
                    }`}
                    style={activeTab === 'others' ? styles.activeTab : {}}
                >
                    <Text
                        className={`text-center font-bold text-sm ${
                            activeTab === 'others'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Các job khác
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => onTabChange('mine')}
                    className={`flex-1 py-3 rounded-xl ${
                        activeTab === 'mine' ? 'bg-white dark:bg-gray-700' : 'bg-transparent'
                    }`}
                    style={activeTab === 'mine' ? styles.activeTab : {}}
                >
                    <Text
                        className={`text-center font-bold text-sm ${
                            activeTab === 'mine'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Job của tôi
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    activeTab: {
        ...Platform.select({
            ios: {
                shadowColor: '#7C3BED',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
});
