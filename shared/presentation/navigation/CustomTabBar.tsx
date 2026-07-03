import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { accentFabShadow, floatingShadow } from '@/shared/presentation/ui/shadows';

const ACTIVE_COLOR = '#7C3BED';
const INACTIVE_COLOR = '#9CA3AF';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const midIndex = Math.floor(state.routes.length / 2); // Middle tab (Jobs)

    return (
        <View
            pointerEvents="box-none"
            style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 4) }]}
        >
            <View style={styles.container}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? options.title ?? route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Center tab (FAB - Floating Action Button)
                    if (index === midIndex) {
                        return (
                            <View key={route.key} style={styles.centerSlot}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    onPress={onPress}
                                    onLongPress={onLongPress}
                                    style={({ pressed }) => [
                                        { transform: [{ translateY: pressed ? 2 : 0 }] },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={['#E43BA3', '#7A3EFF']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.fab}
                                    >
                                        {options.tabBarIcon &&
                                            options.tabBarIcon({
                                                focused: isFocused,
                                                color: 'white',
                                                size: 28,
                                            })}
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        );
                    }

                    // Regular tabs
                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.item}
                        >
                            <View style={styles.itemInner}>
                                {options.tabBarIcon &&
                                    options.tabBarIcon({
                                        focused: isFocused,
                                        color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                                        size: 24,
                                    })}
                                {label && (
                                    <Text
                                        style={[
                                            styles.label,
                                            { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {String(label)}
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    container: {
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 24,
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.04)',
        ...floatingShadow,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 64,
    },
    itemInner: {
        alignItems: 'center',
        gap: 4,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
    },
    centerSlot: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginTop: -28,
        alignItems: 'center',
        justifyContent: 'center',
        ...accentFabShadow,
    },
});

export default CustomTabBar;
