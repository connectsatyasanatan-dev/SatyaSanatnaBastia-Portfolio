import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 65000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor - attach JWT for admin routes ────────
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined' && config.url?.includes('/admin')) {
            const token = localStorage.getItem('admin_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor - handle 401 with transparent auto-refresh ───────────
let isRefreshingAxios = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _isRetry?: boolean; _retryCount?: number };

        // Auto-refresh on 401 for admin routes
        if (
            error.response?.status === 401 &&
            typeof window !== 'undefined' &&
            originalRequest?.url?.includes('/admin') &&
            !originalRequest?.url?.includes('/login') &&
            !originalRequest?.url?.includes('/refresh') &&
            !originalRequest?._isRetry
        ) {
            const refreshToken = localStorage.getItem('admin_refresh_token');
            if (refreshToken) {
                if (isRefreshingAxios) {
                    return new Promise((resolve) => {
                        refreshSubscribers.push((newToken: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            resolve(apiClient(originalRequest));
                        });
                    });
                }

                originalRequest._isRetry = true;
                isRefreshingAxios = true;

                try {
                    const refreshRes = await axios.post(`${BASE_URL}/admin/refresh`, { refreshToken }, { withCredentials: true });
                    const newToken = refreshRes.data?.accessToken || refreshRes.data?.token;
                    const newRefreshToken = refreshRes.data?.refreshToken;

                    if (newToken) {
                        localStorage.setItem('admin_token', newToken);
                        if (newRefreshToken) {
                            localStorage.setItem('admin_refresh_token', newRefreshToken);
                        }
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        onTokenRefreshed(newToken);
                        return apiClient(originalRequest);
                    }
                } catch (refreshErr) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_refresh_token');
                    window.dispatchEvent(new CustomEvent('admin-auth-expired'));
                    return Promise.reject(refreshErr);
                } finally {
                    isRefreshingAxios = false;
                }
            } else {
                localStorage.removeItem('admin_token');
            }
        }

        // Retry on network errors or 5xx (max 2 retries, non-admin only)
        const isAdminRoute = originalRequest?.url?.includes('/admin');
        const shouldRetry =
            !isAdminRoute &&
            (originalRequest?._retryCount ?? 0) < 2 &&
            (!error.response || error.response.status >= 500);

        if (shouldRetry) {
            originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
            const delay = originalRequest._retryCount * 800; // 800ms, 1600ms
            await new Promise((r) => setTimeout(r, delay));
            return apiClient(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
