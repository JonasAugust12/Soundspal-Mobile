import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getUserFromToken } from '@/utils/jwt';
import type { RefreshTokenResponse } from '@/types/auth.type';

// Tạo axios instance
export const apiClient = axios.create({
    baseURL: 'https://talentlink.io.vn/api/v1',
    // headers: {
    //   accept: "application/json",
    //   "User-Agent":
    //     "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36",
    // },
});

// Flag để tránh multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor - thêm token vào header
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuthStore.getState();

        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor - handle 401 và refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh, đợi trong queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { refreshToken, logout } = useAuthStore.getState();

            if (!refreshToken) {
                logout();
                processQueue(new Error('No refresh token'), null);
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token
                const response = await axios.post<RefreshTokenResponse>(
                    'https://talentlink.io.vn/api/v1/auth/refresh',
                    { refresh_token: refreshToken },
                    {
                        headers: {
                            accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (response.data?.data?.access_token && response.data?.data?.refresh_token) {
                    const { access_token, refresh_token } = response.data.data;

                    // Decode JWT để lấy user info
                    const user = getUserFromToken(access_token);

                    if (user) {
                        // Update store
                        useAuthStore.getState().setCredentials({
                            accessToken: access_token,
                            refreshToken: refresh_token,
                            user,
                        });

                        // Process queue with new token
                        processQueue(null, access_token);

                        // Retry original request
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${access_token}`;
                        }
                        isRefreshing = false;
                        return apiClient(originalRequest);
                    } else {
                        throw new Error('Cannot decode token');
                    }
                } else {
                    throw new Error('Invalid refresh response');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                logout();
                isRefreshing = false;
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

// Helper function cho API calls
export const createApiCall = <TResponse, TRequest = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
) => {
    return async (data?: TRequest): Promise<TResponse> => {
        const isFormData = data instanceof FormData;

        console.log(`📡 ${method} request to ${url}`, {
            isFormData,
            dataType: data ? typeof data : 'undefined',
        });

        const config: any = {
            method,
            url,
            data: method !== 'GET' ? data : undefined,
            params: method === 'GET' ? data : undefined,
        };

        // Nếu là FormData, để axios tự động set Content-Type
        if (isFormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        } else if (method !== 'GET') {
            config.headers = {
                'Content-Type': 'application/json',
            };
        }

        try {
            const response = await apiClient.request<TResponse>(config);
            console.log(`✅ ${method} ${url} success`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`❌ ${method} ${url} error:`, {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data,
            });
            throw error;
        }
    };
};
