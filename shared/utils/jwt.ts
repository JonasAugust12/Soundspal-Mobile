export const decodeJWT = (token: string): Record<string, unknown> | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode base64 payload (phần giữa)
        const payload = parts[1];

        // Thay thế các ký tự đặc biệt của base64url
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

        // Decode base64
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        );

        return JSON.parse(jsonPayload) as Record<string, unknown>;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

export const isTokenValid = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
        return false;
    }

    // exp là timestamp tính bằng giây, Date.now() tính bằng milliseconds
    const currentTime = Date.now() / 1000;
    return (decoded.exp as number) > currentTime;
};

export const getUserFromToken = (
    token: string,
): {
    id: string;
    email: string;
    role: string;
    is_verified: boolean;
    username: string;
    avatar_url: string;
    display_name: string;
    tier?: string;
} | null => {
    const decoded = decodeJWT(token);
    if (!decoded) {
        return null;
    }

    return {
        id: (decoded.sub as string) || '',
        email: (decoded.email as string) || '',
        role: (decoded.role as string) || '',
        is_verified: !!decoded.is_verified,
        username: (decoded.username as string) || '',
        avatar_url: (decoded.avatar_url as string) || '',
        display_name: (decoded.display_name as string) || '',
        tier: (decoded.tier as string) || undefined,
    };
};
