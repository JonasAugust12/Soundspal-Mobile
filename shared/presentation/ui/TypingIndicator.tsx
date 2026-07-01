import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export function TypingIndicator() {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animateDot = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        };

        animateDot(dot1, 0);
        animateDot(dot2, 200);
        animateDot(dot3, 400);
    }, [dot1, dot2, dot3]);

    const dotStyle = (animatedValue: Animated.Value) => ({
        opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
        }),
        transform: [
            {
                scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                }),
            },
        ],
    });

    return (
        <View className="flex-row items-center gap-1.5 self-start py-2.5 px-3 rounded-2xl border border-primary bg-background">
            <Animated.View className="w-2 h-2 rounded-full bg-primary" style={dotStyle(dot1)} />
            <Animated.View className="w-2 h-2 rounded-full bg-primary" style={dotStyle(dot2)} />
            <Animated.View className="w-2 h-2 rounded-full bg-primary" style={dotStyle(dot3)} />
        </View>
    );
}
