import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Surfaces render errors instead of a blank/black screen during development.
 */
export class RootErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('[RootErrorBoundary]', error.message, info.componentStack);
    }

    render(): ReactNode {
        if (this.state.error) {
            return (
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scroll}>
                        <Text style={styles.title}>Startup error</Text>
                        <Text style={styles.message}>{this.state.error.message}</Text>
                    </ScrollView>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    scroll: { padding: 24, flexGrow: 1 },
    title: { fontSize: 18, fontWeight: '700', color: '#111827' },
    message: { marginTop: 12, fontSize: 14, color: '#4b5563' },
});
