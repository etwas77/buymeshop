import axios from "axios";
import { clearAuthAndRedirect } from "../common/utils/Functions";

export const baseURL = import.meta.env.VITE_BASE_URL;

export const authApi = axios.create({
    baseURL,
    withCredentials: true,
});

export const api = axios.create({
    baseURL,
});

const refreshToken = async (): Promise<boolean> => {
    const response = await authApi.post("/auth/refresh-token");
    return response.status >= 200 && response.status < 300;
};

authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest?.url?.includes("/auth/refresh-token")) {
            clearAuthAndRedirect();
            return Promise.reject(error);
        }

        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await refreshToken();
                if (!res) {
                    clearAuthAndRedirect();
                    return Promise.reject(error);
                }

                return authApi(originalRequest);
            } catch (refreshError) {
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
            clearAuthAndRedirect();
        }

        return Promise.reject(error);
    }
);
