import React, { createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/services/socketService';
import { useAuthStore } from '@/stores/authStore';

interface SocketContextValue {
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ isConnected: false });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { user, accessToken } = useAuthStore();
    const [isConnected, setIsConnected] = React.useState(false);

    useEffect(() => {
        // Set query client for socket service
        socketService.setQueryClient(queryClient);

        // Connect socket when user is authenticated
        if (user && accessToken) {
            console.warn('🔌 Initializing socket connection...');
            const socket = socketService.connect();

            if (socket) {
                setIsConnected(true);
            }
        }

        // Cleanup on unmount or when user logs out
        return () => {
            if (!user || !accessToken) {
                console.warn('🔌 Disconnecting socket...');
                socketService.disconnect();
                setIsConnected(false);
            }
        };
    }, [user, accessToken, queryClient]);

    return <SocketContext.Provider value={{ isConnected }}>{children}</SocketContext.Provider>;
}
