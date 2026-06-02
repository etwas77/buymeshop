import axios from "axios";
import { clearAuthAndRedirect } from "../common/utils/Functions";

const baseURL = "http://localhost:9090/api/v1";

export const authApi = axios.create({
    baseURL,
    withCredentials: true,
});

export const api = axios.create({
    baseURL,
});

authApi.interceptors.request.use(
    (config) => {
        if (config.url?.includes("/auth/refresh-token")) {
            return config;
        }

        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const refreshToken = async (): Promise<string> => {
    try {        
        const response = await authApi.post("/auth/refresh-token");        
        return response.data.accessToken;
    } catch (error) {
        return Promise.reject(error);
    }
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
                const newToken = await refreshToken();
                if (!newToken) {
                    clearAuthAndRedirect();
                    return Promise.reject(error);
                }

                localStorage.setItem("authToken", newToken);
                authApi.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

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
