import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FloatingCreateButtonProps {
    onPress: () => void;
}

export function FloatingCreateButton({ onPress }: FloatingCreateButtonProps) {
    return (
        <View
            style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                marginLeft: -30,
                zIndex: 100,
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#9333EA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 15,
                }}
            >
                <Plus size={28} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
        </View>
    );
}
