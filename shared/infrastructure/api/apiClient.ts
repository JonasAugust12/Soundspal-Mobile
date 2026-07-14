import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';
import { useAuthStore } from '@/features/auth/presentation/store/authStore';
import { getUserFromToken } from '@/shared/utils/jwt';
import type { RefreshTokenResponse } from '@/features/auth/domain/entities/auth.type';

// Tạo axios instance
export const apiClient = axios.create({
    baseURL: 'https://api.soundspal.com/api/v1',
    //baseURL:'https://talentlink.io.vn/api/v1',
    // headers: {
    //   accept: "application/json",
    //   "User-Agent":
    //     "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36",
    // },
});

// Flag để tránh multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

function isFormDataBody(config: InternalAxiosRequestConfig | undefined): boolean {
    return config?.data instanceof FormData;
}

/**
 * Axios cannot safely replay multipart bodies: FormData is consumed on the first send.
 * Retrying after a 401 refresh often produces an empty body and surfaces as ERR_NETWORK.
 */
function rejectMultipartReplay(
    originalRequest: InternalAxiosRequestConfig,
    firstResponse: AxiosResponse | undefined,
): Promise<never> {
    return Promise.reject(
        new AxiosError(
            'Upload interrupted while refreshing your session. Please try again.',
            'ERR_UPLOAD_AUTH_REFRESH',
            originalRequest,
            undefined,
            firstResponse,
        ),
    );
}

const processQueue = (error: unknown, token: string | null = null) => {
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
                        if (isFormDataBody(originalRequest)) {
                            return rejectMultipartReplay(originalRequest, error.response);
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

                        // Retry original request (multipart cannot be replayed — see isFormDataBody)
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${access_token}`;
                        }
                        isRefreshing = false;
                        if (isFormDataBody(originalRequest)) {
                            return rejectMultipartReplay(originalRequest, error.response);
                        }
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

        console.warn(`📡 ${method} request to ${url}`, {
            isFormData,
            dataType: data ? typeof data : 'undefined',
        });

        const config: Record<string, unknown> = {
            method,
            url,
            data: method !== 'GET' ? data : undefined,
            params: method === 'GET' ? data : undefined,
        };

        // FormData: never set multipart/form-data without boundary — axios adds boundary automatically.
        if (!isFormData && method !== 'GET') {
            config.headers = {
                'Content-Type': 'application/json',
            };
        }

        try {
            const response = await apiClient.request<TResponse>(config as AxiosRequestConfig);
            console.warn(`✅ ${method} ${url} success`, response.data);
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError;
            console.error(`❌ ${method} ${url} error:`, {
                status: err.response?.status,
                message: err.message,
                data: err.response?.data,
            });
            throw error;
        }
    };
};
