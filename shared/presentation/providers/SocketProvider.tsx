import React, { createContext, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/shared/infrastructure/socket/socketService';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';

interface SocketContextValue {
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ isConnected: false });

export const useSocket = () => useContext(SocketContext);

/**
 * Sở hữu vòng đời socket cho toàn app. Mount MỘT lần ở app/_layout.tsx —
 * các màn hình không tự gọi socketService.connect() nữa.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    // Phụ thuộc vào id + token (primitive) thay vì object user, để không reconnect thừa
    // mỗi lần store làm mới user.
    const userId = useAuthStore((state) => state.user?.id);
    const accessToken = useAuthStore((state) => state.accessToken);
    const [isConnected, setIsConnected] = React.useState(false);

    useEffect(() => {
        socketService.setQueryClient(queryClient);
    }, [queryClient]);

    // Kết nối khi đã đăng nhập, ngắt khi đăng xuất / token đổi.
    useEffect(() => {
        if (!userId || !accessToken) {
            socketService.disconnect();
            setIsConnected(false);
            return;
        }

        setIsConnected(!!socketService.connect());

        return () => {
            socketService.disconnect();
            setIsConnected(false);
        };
    }, [userId, accessToken]);

    // Socket còn sống = messaging-service coi user là "online" = KHÔNG gửi push tin nhắn
    // (nó chỉ push cho người offline). App xuống nền mà không ngắt socket thì người dùng
    // sẽ không bao giờ nhận được thông báo tin nhắn — xem docs/features/notifications-messaging.md.
    useEffect(() => {
        if (!userId || !accessToken) return;

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'background') {
                socketService.disconnect();
                setIsConnected(false);
            } else if (state === 'active') {
                setIsConnected(!!socketService.connect());
            }
        });

        return () => subscription.remove();
    }, [userId, accessToken]);

    return <SocketContext.Provider value={{ isConnected }}>{children}</SocketContext.Provider>;
}
