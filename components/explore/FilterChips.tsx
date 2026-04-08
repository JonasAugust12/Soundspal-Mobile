import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FILTERS = ['Tất cả', 'Phonk', 'Hyperpop', 'Drill', 'Vaporwave', 'Techno'];

export function FilterChips() {
    const [active, setActive] = useState('Tất cả');

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0, gap: 10, paddingBottom: 32 }}
            className="flex-row"
        >
            {FILTERS.map((item) => {
                const isActive = active === item;

                if (isActive) {
                    return (
                        <TouchableOpacity
                            key={item}
                            activeOpacity={0.8}
                            onPress={() => setActive(item)}
                            style={[styles.shadowChip, { borderRadius: 9999 }]}
                        >
                            <LinearGradient
                                colors={['#7d3bed', '#f471b7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 9999 }}
                                className="px-5 py-2.5"
                            >
                                <Text className="text-white font-body font-bold text-sm tracking-wide">
                                    {item}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={item}
                        activeOpacity={0.6}
                        onPress={() => setActive(item)}
                        className="bg-gray-100 px-5 py-2.5 rounded-full border border-gray-200"
                    >
                        <Text className="text-gray-600 font-body font-medium text-sm tracking-wide">
                            {item}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    shadowChip: {
        shadowColor: '#7d3bed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
